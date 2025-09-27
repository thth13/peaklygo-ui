'use client';

import React, { useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faCamera, faCrop, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageUploaderProps {
  image: File | null;
  onImageChange: (image: File | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ image, onImageChange }) => {
  const t = useTranslations('image');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [cropperSrc, setCropperSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    return () => {
      // Очистка URL превью при размонтировании
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      if (cropperSrc) {
        URL.revokeObjectURL(cropperSrc);
      }
    };
  }, [imagePreview, cropperSrc]);

  function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        'image/jpeg',
        0.9,
      );
    });
  }, [completedCrop]);

  const processImageFile = (file: File): void => {
    const isImage = file.type.startsWith('image/');
    const isUnderLimit = file.size <= 10 * 1024 * 1024; // 10MB

    if (!isImage) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    if (!isUnderLimit) {
      toast.error('Размер файла не должен превышать 10MB');
      return;
    }

    // Сразу показываем превью и сохраняем файл
    onImageChange(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
  };

  const handleCropComplete = async () => {
    try {
      const croppedImageBlob = await getCroppedImg();
      if (croppedImageBlob) {
        const croppedFile = new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
        onImageChange(croppedFile);

        const objectUrl = URL.createObjectURL(croppedImageBlob);
        setImagePreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });

        setShowCropper(false);
        if (cropperSrc) {
          URL.revokeObjectURL(cropperSrc);
          setCropperSrc('');
        }
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Ошибка при обрезке изображения');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (cropperSrc) {
      URL.revokeObjectURL(cropperSrc);
      setCropperSrc('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    onImageChange(null);

    const input = document.getElementById('goal-image') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div>
      <label className="block text-lg font-bold text-gray-800 mb-3">
        <FontAwesomeIcon icon={faCamera} className="mr-2 text-primary-500" />
        Фото цели
      </label>

      {showCropper && cropperSrc ? (
        <div className="border-2 border-primary-300 rounded-xl p-4 bg-primary-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Настройки отображения</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCropComplete}
                disabled={!completedCrop}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Применить
              </button>
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Отмена
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={16 / 9}
              minWidth={50}
              minHeight={50}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={cropperSrc}
                style={{ maxWidth: '100%', maxHeight: '400px' }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl transition-colors cursor-pointer relative overflow-hidden ${
            imagePreview ? 'h-64' : 'p-6'
          } ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
          onClick={() => !imagePreview && document.getElementById('goal-image')?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) processImageFile(file);
          }}
        >
          {imagePreview ? (
            <>
              <Image
                src={imagePreview}
                alt="Превью изображения"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (imagePreview) {
                      setCropperSrc(imagePreview);
                      setShowCropper(true);
                    }
                  }}
                  className="p-2 bg-primary-500 rounded-full text-white hover:bg-primary-600 transition-colors shadow-lg"
                  title={t('cropImage')}
                >
                  <FontAwesomeIcon icon={faCrop} className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('goal-image')?.click();
                  }}
                  className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors shadow-lg"
                  title={t('selectDifferentImage')}
                >
                  <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
                  title={t('removeImage')}
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2">Перетащите фото сюда или</p>
              <span className="cursor-pointer text-primary-600 font-semibold hover:text-primary-700">
                выберите файл
              </span>
              {image && <p className="text-sm text-green-600 mt-2">Файл выбран: {image.name}</p>}
            </div>
          )}
        </div>
      )}

      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="goal-image" />
      <p className="text-sm text-gray-500 mt-2">
        Изображение поможет визуализировать цель. Поддерживаются JPG, PNG, GIF до 10MB
      </p>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageUploader;
