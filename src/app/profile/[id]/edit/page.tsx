'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserProfile } from '@/context/UserProfileContext';
import { getProfile, editProfile } from '@/lib/api/profile';
import { UserProfile } from '@/types';
import ProfileEditForm from '@/components/profile/ProfileEditForm';

interface EditProfileData {
  fullName: string;
  username: string;
  description: string;
  avatar?: File | null;
}

const ProfileEditPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  const { profile: currentUserProfile } = useUserProfile();

  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await getProfile(profileId);
        setProfileData(data);
      } catch (err: any) {
        setError('Ошибка загрузки профиля');
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (profileId) {
      loadProfileData();
    }
  }, [profileId]);

  useEffect(() => {
    // Check if current user can edit this profile
    const canEdit = currentUserProfile?.user._id === profileId;

    if (currentUserProfile && !canEdit) {
      router.push(`/profile/${profileId}`);
    }
  }, [currentUserProfile, profileId, router]);

  const handleSubmit = async (formData: EditProfileData) => {
    if (!profileData) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.fullName);
      formDataToSend.append('username', formData.username);
      formDataToSend.append('description', formData.description);

      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      await editProfile(profileId, formDataToSend);
      router.push(`/profile/${profileId}`);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    router.push(`/profile/${profileId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{error || 'Профиль не найден'}</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto mt-6 px-4">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Редактирование профиля
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Редактирование профиля</h1>
        <p className="text-gray-600 dark:text-gray-400">Обновите свою информацию и настройки профиля</p>
      </div>

      <ProfileEditForm
        initialData={{
          fullName: profileData.name,
          username: profileData.user.username,
          email: 'user@example.com', // TODO: Получить email из API
          description: profileData.description,
          existingAvatarUrl: profileData.avatar,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </main>
  );
};

export default ProfileEditPage;
