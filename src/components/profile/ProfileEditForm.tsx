'use client';

import { useState } from 'react';
import { AvatarUploader } from './AvatarUploader';
import { IMAGE_URL } from '@/constants';
import { useTranslations } from 'next-intl';

interface ProfileEditFormData {
  fullName: string;
  username: string;
  email: string;
  description: string;
  existingAvatarUrl?: string;
}

interface ProfileEditFormProps {
  initialData: ProfileEditFormData;
  onSubmit: (data: { fullName: string; username: string; description: string; avatar?: File | null }) => Promise<void>;
  onCancel: () => void;
}

interface ValidationErrors {
  fullName?: string;
  username?: string;
  description?: string;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    username: initialData.username || '',
    description: initialData.description || '',
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('validation.fullNameRequired');
    } else if (formData.fullName.trim().length > 255) {
      newErrors.fullName = t('validation.fullNameTooLong');
    }

    if (!formData.username.trim()) {
      newErrors.username = t('validation.usernameRequired');
    } else if (formData.username.trim().length > 50) {
      newErrors.username = t('validation.usernameTooLong');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = t('validation.usernameInvalid');
    }

    if (formData.description.length > 1024) {
      newErrors.description = t('validation.bioTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        description: formData.description.trim(),
        avatar,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar */}
        <div className="lg:col-span-1">
          <AvatarUploader
            onAvatarChange={setAvatar}
            avatar={avatar}
            existingAvatarUrl={
              initialData.existingAvatarUrl ? `${IMAGE_URL}/${initialData.existingAvatarUrl}` : undefined
            }
          />
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('fullName')}
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              placeholder={t('fullNamePlaceholder')}
            />
            {errors.fullName && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* Username (Editable) */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('username')}
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              placeholder={t('usernamePlaceholder')}
            />
            {errors.username && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.username}</p>}
          </div>

          {/* About */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('bio')}
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              maxLength={1024}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
              placeholder={t('bioPlaceholder')}
            />
            <div className="flex justify-between mt-1">
              {errors.description && <p className="text-red-500 dark:text-red-400 text-sm">{errors.description}</p>}
              <p className="text-gray-500 dark:text-gray-400 text-sm ml-auto">{formData.description.length}/1024</p>
            </div>
          </div>

          {/* Date and City Row */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Дата рождения
              </label>
              <input
                type="date"
                id="birthDate"
                defaultValue="1990-05-15"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Город
              </label>
              <input
                type="text"
                id="city"
                defaultValue="Москва"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                readOnly
              />
            </div>
          </div> */}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          {tCommon('cancel')}
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? t('saving') : t('saveChanges')}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
