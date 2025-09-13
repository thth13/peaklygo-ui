'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

interface AvatarUploaderProps {
  onAvatarChange: (file: File | null) => void;
  avatar: File | null;
  existingAvatarUrl?: string;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({ onAvatarChange, existingAvatarUrl }) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayAvatarUrl = avatarPreview || existingAvatarUrl;

  const processFile = (file: File): void => {
    const isImage = file.type.startsWith('image/');
    const isUnderLimit = file.size <= 5 * 1024 * 1024; // 5MB

    if (!isImage) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }

    if (!isUnderLimit) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    onAvatarChange(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    onAvatarChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <div className="flex flex-col items-center">
      <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Фото профиля</label>

      <div className="flex flex-col items-center space-y-4">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-600">
            {displayAvatarUrl ? (
              <Image
                src={displayAvatarUrl}
                alt="Avatar preview"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <FontAwesomeIcon icon={faCloudArrowUp} className="text-3xl" />
              </div>
            )}
          </div>

          {displayAvatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="absolute -top-2 -right-2 p-2 bg-red-500 dark:bg-red-600 rounded-full text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-lg"
            >
              <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Загрузить фото
        </button>

        {/* Delete Button */}
        {displayAvatarUrl && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors"
          >
            Удалить фото
          </button>
        )}

        {/* Drag and Drop Area (optional, hidden version) */}
        <div
          className={`w-64 h-20 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400'
          } hidden`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) processFile(file);
          }}
        >
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Перетащите изображение сюда или нажмите для выбора
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">PNG, JPG, GIF до 5MB</p>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
    </div>
  );
};
