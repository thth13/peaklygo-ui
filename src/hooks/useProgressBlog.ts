import { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { ProgressEntry, CreateProgressEntryDto } from '@/types';
import { getProgressEntries, createProgressEntry, toggleLike } from '@/lib/api';
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
    try {
      setLikeAnimations((prev) => ({ ...prev, [entryId]: true }));

      const updatedEntry = await toggleLike(entryId);
      setBlogEntries((prevEntries) => prevEntries.map((entry) => (entry._id === entryId ? updatedEntry : entry)));

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

  return {
    // State
    showNewEntryForm,
    setShowNewEntryForm,
    newEntry,
    setNewEntry,
    blogEntries,
    isLoading,
    likeAnimations,

    // Handlers
    handleSubmitEntry,
    handleToggleLike,
    isLikedByCurrentUser,
  };
};
