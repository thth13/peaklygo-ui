'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useProgressBlogContext } from '@/context/ProgressBlogContext';
import { ProgressBlogEntry } from './ProgressBlogEntry';
import { EditorToolbar } from './EditorToolbar';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useTranslations } from 'next-intl';
import './tiptap-editor.css';

export const ProgressBlog = ({ isOwner = false }: { isOwner?: boolean }) => {
  const {
    blogEntries,
    isLoading,
    likeAnimations,
    expandedComments,
    comments,
    commentTexts,
    setCommentTexts,
    loadingComments,
    createEntry,
    handleToggleLike,
    toggleComments,
    handleCommentSubmit,
  } = useProgressBlogContext();

  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const t = useTranslations();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t('goals.blog.tellProgress'),
      }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[120px] p-3',
      },
    },
  });

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    try {
      const content = editor.getHTML();
      await createEntry(content);
      editor.commands.clearContent();
      setShowNewEntryForm(false);
    } catch (error) {
      console.log('Error submitting entry:', error);
    }
  };

  const handleCommentTextChange = (entryId: string, text: string) => {
    setCommentTexts((prev) => ({ ...prev, [entryId]: text }));
  };

  const actions = {
    onToggleLike: handleToggleLike,
    onToggleComments: toggleComments,
    onCommentSubmit: handleCommentSubmit,
    onCommentTextChange: handleCommentTextChange,
  };

  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('blog.title')}</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">{t('blog.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('blog.title')}</h3>
        {isOwner && (
          <button
            onClick={() => setShowNewEntryForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <span>{t('blog.newEntry')}</span>
          </button>
        )}
      </div>

      {showNewEntryForm && isOwner && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
          <form onSubmit={handleSubmitEntry} className="space-y-4">
            <div>
              {/* Панель инструментов */}
              <EditorToolbar editor={editor} />

              {/* Редактор */}
              <div className="border border-gray-300 dark:border-gray-600 border-t-0 rounded-b-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <EditorContent
                  editor={editor}
                  className="prose prose-sm max-w-none dark:prose-invert focus-within:ring-2 focus-within:ring-blue-500 rounded-b-lg"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
              >
                {t('blog.publish')}
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.commands.clearContent();
                  setShowNewEntryForm(false);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg text-sm transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {blogEntries.map((entry) => (
          <ProgressBlogEntry
            key={entry._id}
            entry={entry}
            likeAnimations={likeAnimations}
            expandedComments={expandedComments}
            comments={comments}
            commentTexts={commentTexts}
            loadingComments={loadingComments}
            actions={actions}
          />
        ))}
      </div>

      {blogEntries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t('blog.noEntries')}</p>
          {isOwner && (
            <button
              onClick={() => setShowNewEntryForm(true)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              {t('blog.createFirst')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
