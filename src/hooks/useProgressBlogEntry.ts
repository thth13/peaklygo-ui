import { useContext } from 'react';
import { ProgressEntry, Comment } from '@/types';
import { AuthContext } from '@/context/AuthContext';

interface UseProgressBlogEntryOptions {
  entry: ProgressEntry;
  likeAnimations: { [key: string]: boolean };
  expandedComments: { [key: string]: boolean };
  comments: { [key: string]: Comment[] };
  commentTexts: { [key: string]: string };
  loadingComments: { [key: string]: boolean };
}

export const useProgressBlogEntry = ({
  entry,
  likeAnimations,
  expandedComments,
  comments,
  commentTexts,
  loadingComments,
}: UseProgressBlogEntryOptions) => {
  const { userId } = useContext(AuthContext);

  const isLiked = userId ? entry.likes.some((like) => like._id === userId) : false;
  const isAnimating = likeAnimations[entry._id];
  const commentsExpanded = expandedComments[entry._id];
  const entryComments = comments[entry._id] || [];
  const commentLoading = loadingComments[entry._id];
  const commentText = commentTexts[entry._id] || '';

  return {
    isLiked,
    isAnimating,
    commentsExpanded,
    entryComments,
    commentLoading,
    commentText,
  };
};
