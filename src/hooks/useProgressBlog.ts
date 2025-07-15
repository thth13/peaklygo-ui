import { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { ProgressEntry, CreateProgressEntryDto, Comment, CreateCommentDto } from '@/types';
import { getProgressEntries, createProgressEntry, toggleLike, getComments, createComment } from '@/lib/api';
import { AuthContext } from '@/context/AuthContext';

interface UseProgressBlogOptions {
  goalId: string;
}

export const useProgressBlog = ({ goalId }: UseProgressBlogOptions) => {
  const { userId } = useContext(AuthContext);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ content: '' });
  const [blogEntries, setBlogEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likeAnimations, setLikeAnimations] = useState<{ [key: string]: boolean }>({});

  // Comment-related state
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({});

  const loadEntries = async () => {
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
  };

  useEffect(() => {
    loadEntries();
  }, [goalId]);

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.content.trim()) {
      toast.error('Напишите что-нибудь о своем прогрессе');
      return;
    }

    try {
      const createDto: CreateProgressEntryDto = {
        goalId,
        content: newEntry.content.trim(),
      };

      const newProgressEntry = await createProgressEntry(createDto);
      setBlogEntries([newProgressEntry, ...blogEntries]);
      setNewEntry({ content: '' });
      setShowNewEntryForm(false);
      toast.success('Запись добавлена!');
    } catch (error) {
      toast.error('Ошибка создания записи');
      console.error('Error creating progress entry:', error);
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
        prev.map((entry) => (entry._id === entryId ? { ...entry, commentCount: entry.commentCount + 1 } : entry)),
      );

      setCommentTexts((prev) => ({ ...prev, [entryId]: '' }));
      toast.success('Комментарий добавлен!');
    } catch (error) {
      toast.error('Ошибка добавления комментария');
      console.error('Error creating comment:', error);
    }
  };

  return {
    // State
    showNewEntryForm,
    setShowNewEntryForm,
    newEntry,
    setNewEntry,
    blogEntries,
    isLoading,
    likeAnimations,

    // Comment state
    expandedComments,
    comments,
    commentTexts,
    setCommentTexts,
    loadingComments,

    // Handlers
    handleSubmitEntry,
    handleToggleLike,
    isLikedByCurrentUser,

    // Comment handlers
    toggleComments,
    handleCommentSubmit,
  };
};
