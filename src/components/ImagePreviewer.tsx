'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
interface ImagePreviewerProps {
  handleInputChange: (field: string, value: any) => void;
  image: File | null;
  existingImageUrl?: string;
}

export const ImagePreviewer = ({ handleInputChange, image, existingImageUrl }: ImagePreviewerProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute the image URL to display (new preview takes priority over existing)
  const displayImageUrl = imagePreview || existingImageUrl;

  const processFile = (file: File): void => {
    const isImage = file.type.startsWith('image/');
    const isUnderLimit = file.size <= 10 * 1024 * 1024; // 10MB
    if (!isImage || !isUnderLimit) return;
    handleInputChange('image', file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  useEffect(() => {
    return () => {
      // Cleanup preview URL on unmount
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Фото цели</label>
      <div
        className={`mt-1 flex justify-center items-center ${
          displayImageUrl ? '' : 'px-6 pt-5 pb-6'
        } border-2 border-dashed rounded-lg transition-colors cursor-pointer relative overflow-hidden h-64 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
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
        {displayImageUrl ? (
          <>
            <Image
              src={displayImageUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <button
              type="button"
              className="absolute top-2 right-2 p-1 bg-red-500 dark:bg-red-600 rounded-full text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (imagePreview) URL.revokeObjectURL(imagePreview);
                setImagePreview(null);
                handleInputChange('image', null);
                handleInputChange('existingImageUrl', undefined);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="space-y-1 text-center">
            <FontAwesomeIcon icon={faCloudArrowUp} className="mx-auto text-gray-400 dark:text-gray-500 text-4xl" />
            <div className="flex text-sm text-gray-600 dark:text-gray-300">
              <span className="relative cursor-pointer bg-white dark:bg-gray-600 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 px-1">
                Загрузить фото
              </span>
              <p className="pl-1">или перетащите сюда</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF до 10MB</p>
            {image && <p className="text-sm text-green-600 dark:text-green-400 font-medium">{image.name}</p>}
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
    </div>
  );
};
