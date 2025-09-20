'use client';

import { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { formatTimeAgo } from '@/lib/utils';
import { ProgressEntry, Comment } from '@/types';
import { useProgressBlogEntry } from '@/hooks/useProgressBlogEntry';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import './progress-blog-entry.css';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { IMAGE_URL } from '@/constants';

interface ProgressBlogActions {
  onToggleLike: (entryId: string) => void;
  onToggleComments: (entryId: string) => void;
  onCommentSubmit: (entryId: string) => void;
  onCommentTextChange: (entryId: string, text: string) => void;
}

interface ProgressBlogEntryProps {
  entry: ProgressEntry;
  likeAnimations: { [key: string]: boolean };
  expandedComments: { [key: string]: boolean };
  comments: { [key: string]: Comment[] };
  commentTexts: { [key: string]: string };
  loadingComments: { [key: string]: boolean };
  actions: ProgressBlogActions;
}

export const ProgressBlogEntry = ({
  entry,
  likeAnimations,
  expandedComments,
  comments,
  commentTexts,
  loadingComments,
  actions,
}: ProgressBlogEntryProps) => {
  const { isLiked, isAnimating, commentsExpanded, entryComments, commentLoading, commentText } = useProgressBlogEntry({
    entry,
    likeAnimations,
    expandedComments,
    comments,
    commentTexts,
    loadingComments,
  });

  const { userId } = useContext(AuthContext);
  const t = useTranslations();
  const tTimeAgo = useTranslations('timeAgo');

  // Функция для безопасного рендеринга HTML
  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br'],
      ALLOWED_ATTR: [],
    });
  };

  return (
    <div className="flex space-x-4">
      <div className="flex-shrink-0">
        <div className="bg-blue-500 text-white rounded-lg w-14 h-14 flex flex-col items-center justify-center text-center">
          <div className="text-lg font-bold leading-none">{entry.day}</div>
          <div className="text-xs font-medium uppercase tracking-wide leading-none">{t('common.day')}</div>
        </div>
      </div>

      {/* Содержимое записи */}
      <div className="flex-1 min-w-0">
        <div
          className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed progress-blog-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(entry.content) }}
        />

        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => actions.onToggleLike(entry._id)}
              className={`flex items-center space-x-1 transition-all duration-200 transform ${
                isLiked
                  ? '!text-red-500 dark:!text-red-400 hover:!text-red-600 dark:hover:!text-red-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
              } ${isAnimating ? 'animate-pulse scale-125' : 'hover:scale-110'}`}
              style={{
                animation: isAnimating ? 'heartPulse 0.6s ease-in-out' : undefined,
                color: isLiked ? '#ef4444' : undefined,
              }}
            >
              <FontAwesomeIcon icon={faHeart} className="w-4 h-4 transition-all duration-200" />
              <span className="font-medium">{entry.likes.length}</span>
            </button>
            <button
              onClick={() => actions.onToggleComments(entry._id)}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <FontAwesomeIcon icon={faComment} className="w-4 h-4" />
              <span>
                {entry.commentCount} {t('common.comments')}
              </span>
            </button>
          </div>
          <span className="text-gray-500 dark:text-gray-400">{formatTimeAgo(entry.createdAt, tTimeAgo)}</span>
        </div>

        {/* Секция комментариев */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            commentsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
            {/* Список комментариев */}
            {commentLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('comments.loading')}</p>
              </div>
            ) : entryComments.length > 0 ? (
              <div className="space-y-3">
                {entryComments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <Link href={`/profile/${comment.profile.user}`}>
                        {comment.profile?.avatar ? (
                          <Image
                            src={`${IMAGE_URL}/${comment.profile.avatar}`}
                            alt={comment.profile.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center hover:opacity-80 transition-opacity">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {comment.profile?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link
                          href={`/profile/${comment.profile.user}`}
                          className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {comment.profile?.name || t('comments.unknownUser')}
                        </Link>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(comment.createdAt, tTimeAgo)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('comments.noComments')}</p>
              </div>
            )}
            <div className="mt-3">
              {userId ? (
                <div className="flex space-x-2">
                  <textarea
                    placeholder={t('comments.writeComment')}
                    value={commentText}
                    onChange={(e) => actions.onCommentTextChange(entry._id, e.target.value)}
                    rows={1}
                    className="flex-1 max-w-md px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  />
                  <button
                    onClick={() => actions.onCommentSubmit(entry._id)}
                    className="px-4 py-1.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm transition-colors flex items-center"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t('auth.needAccountLogin')}</p>
                  <div className="flex justify-center space-x-3 text-sm">
                    <Link
                      href="/auth/login"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      {t('auth.signIn')}
                    </Link>
                    <span className="text-gray-400">{t('common.or')}</span>
                    <Link
                      href="/auth/register"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      {t('auth.signUp')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
