'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ProgressEntry, CreateProgressEntryDto, Comment, CreateCommentDto } from '@/types';
import { getProgressEntries, createProgressEntry, toggleLike, getComments, createComment } from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';

interface ProgressBlogContextType {
  // State
  blogEntries: ProgressEntry[];
  isLoading: boolean;
  likeAnimations: { [key: string]: boolean };

  // Comment state
  expandedComments: { [key: string]: boolean };
  comments: { [key: string]: Comment[] };
  commentTexts: { [key: string]: string };
  setCommentTexts: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  loadingComments: { [key: string]: boolean };

  // Actions
  createEntry: (content: string) => Promise<void>;
  handleToggleLike: (entryId: string) => Promise<void>;
  isLikedByCurrentUser: (entry: ProgressEntry) => boolean;
  toggleComments: (entryId: string) => Promise<void>;
  handleCommentSubmit: (entryId: string) => Promise<void>;
}

const ProgressBlogContext = createContext<ProgressBlogContextType | null>(null);

interface ProgressBlogProviderProps {
  children: ReactNode;
  goalId: string;
}

export const ProgressBlogProvider = ({ children, goalId }: ProgressBlogProviderProps) => {
  const { userId } = useContext(AuthContext);
  const [blogEntries, setBlogEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likeAnimations, setLikeAnimations] = useState<{ [key: string]: boolean }>({});

  // Comment-related state
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({});

  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const entries = await getProgressEntries(goalId);
      setBlogEntries(entries);
    } catch (error) {
      toast.error('Ошибка загрузки записей');
      console.error('Error loading progress entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    loadEntries();
  }, [goalId, loadEntries]);

  const createEntry = async (content: string) => {
    if (!content.trim()) {
      toast.error('Напишите что-нибудь о своем прогрессе');
      return;
    }

    try {
      const createDto: CreateProgressEntryDto = {
        goalId,
        content: content.trim(),
      };

      const newProgressEntry = await createProgressEntry(createDto);
      setBlogEntries([newProgressEntry, ...blogEntries]);
      toast.success('Запись добавлена!');
    } catch (error) {
      toast.error('Ошибка создания записи');
      console.error('Error creating progress entry:', error);
      throw error;
    }
  };

  const handleToggleLike = async (entryId: string) => {
    if (!userId) {
      toast.error('Для оценки записей необходимо войти в аккаунт');
      return;
    }

    try {
      setLikeAnimations((prev) => ({ ...prev, [entryId]: true }));

      const updatedEntry = await toggleLike(entryId);

      setBlogEntries((prevEntries) =>
        prevEntries.map((entry) => (entry._id === entryId ? { ...entry, likes: updatedEntry.likes } : entry)),
      );

      setTimeout(() => {
        setLikeAnimations((prev) => ({ ...prev, [entryId]: false }));
      }, 600);
    } catch (error) {
      toast.error('Ошибка при изменении лайка');
      console.error('Error toggling like:', error);
      setLikeAnimations((prev) => ({ ...prev, [entryId]: false }));
    }
  };

  const isLikedByCurrentUser = (entry: ProgressEntry): boolean => {
    return userId ? entry.likes.some((like) => like._id === userId) : false;
  };

  const toggleComments = async (entryId: string) => {
    const isExpanding = !expandedComments[entryId];

    setExpandedComments((prev) => ({ ...prev, [entryId]: isExpanding }));

    if (isExpanding && !comments[entryId]) {
      try {
        setLoadingComments((prev) => ({ ...prev, [entryId]: true }));
        const entryComments = await getComments(entryId);
        setComments((prev) => ({ ...prev, [entryId]: entryComments }));
      } catch (error) {
        toast.error('Ошибка загрузки комментариев');
        console.error('Error loading comments:', error);
      } finally {
        setLoadingComments((prev) => ({ ...prev, [entryId]: false }));
      }
    }
  };

  const handleCommentSubmit = async (entryId: string) => {
    const commentText = commentTexts[entryId]?.trim();
    if (!commentText) {
      toast.error('Напишите комментарий');
      return;
    }

    try {
      const createDto: CreateCommentDto = { content: commentText };
      const newComment = await createComment(entryId, createDto);

      setComments((prev) => ({
        ...prev,
        [entryId]: [...(prev[entryId] || []), newComment],
      }));

      setBlogEntries((prev) =>
        prev.map((entry) =>
          entry._id === entryId ? { ...entry, commentCount: (entry.commentCount || 0) + 1 } : entry,
        ),
      );

      setCommentTexts((prev) => ({ ...prev, [entryId]: '' }));
      toast.success('Комментарий добавлен!');
    } catch (error) {
      toast.error('Ошибка добавления комментария');
      console.error('Error creating comment:', error);
    }
  };

  const value: ProgressBlogContextType = {
    // State
    blogEntries,
    isLoading,
    likeAnimations,

    // Comment state
    expandedComments,
    comments,
    commentTexts,
    setCommentTexts,
    loadingComments,

    // Actions
    createEntry,
    handleToggleLike,
    isLikedByCurrentUser,
    toggleComments,
    handleCommentSubmit,
  };

  return <ProgressBlogContext.Provider value={value}>{children}</ProgressBlogContext.Provider>;
};

export const useProgressBlogContext = () => {
  const context = useContext(ProgressBlogContext);
  if (!context) {
    throw new Error('useProgressBlogContext must be used within ProgressBlogProvider');
  }
  return context;
};
