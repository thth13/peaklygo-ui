'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCloudArrowUp, faCrop, faCheck, faCamera } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
interface ImagePreviewerProps {
  handleInputChange: (field: string, value: any) => void;
  image: File | null;
  existingImageUrl?: string;
}

export const ImagePreviewer = ({ handleInputChange, image, existingImageUrl }: ImagePreviewerProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [cropperSrc, setCropperSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const t = useTranslations('image');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const handleCropComplete = async () => {
    try {
      const croppedImageBlob = await getCroppedImg();
      if (croppedImageBlob) {
        const croppedFile = new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
        handleInputChange('image', croppedFile);

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
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (cropperSrc) {
      URL.revokeObjectURL(cropperSrc);
      setCropperSrc('');
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup preview URL on unmount
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      if (cropperSrc) {
        URL.revokeObjectURL(cropperSrc);
      }
    };
  }, [imagePreview, cropperSrc]);

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('goalPhoto')}</label>

      {showCropper && cropperSrc ? (
        <div className="border-2 border-blue-300 dark:border-blue-600 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Настройки отображения</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCropComplete}
                disabled={!completedCrop}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Применить
              </button>
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Отмена
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={16 / 9}
              minWidth={50}
              minHeight={50}
            >
              <Image
                ref={imgRef}
                alt="Crop me"
                src={cropperSrc}
                unoptimized
                width={500}
                height={400}
                style={{ maxWidth: '100%', maxHeight: '400px' }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>
        </div>
      ) : (
        <div
          className={`mt-1 flex justify-center items-center ${
            displayImageUrl ? '' : 'px-6 pt-5 pb-6'
          } border-2 border-dashed rounded-lg transition-colors cursor-pointer relative overflow-hidden h-64 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400'
          }`}
          onClick={() => !displayImageUrl && fileInputRef.current?.click()}
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
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (displayImageUrl) {
                      setCropperSrc(displayImageUrl);
                      setShowCropper(true);
                    }
                  }}
                  className="p-2 bg-blue-500 dark:bg-blue-600 rounded-full text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-lg"
                  title={t('cropImage')}
                >
                  <FontAwesomeIcon icon={faCrop} className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="p-2 bg-green-500 dark:bg-green-600 rounded-full text-white hover:bg-green-600 dark:hover:bg-green-700 transition-colors shadow-lg"
                  title={t('selectDifferentImage')}
                >
                  <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 bg-red-500 dark:bg-red-600 rounded-full text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-lg"
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
              </div>
            </>
          ) : (
            <div className="space-y-1 text-center">
              <FontAwesomeIcon icon={faCloudArrowUp} className="mx-auto text-gray-400 dark:text-gray-500 text-4xl" />
              <div className="flex text-sm text-gray-600 dark:text-gray-300">
                <span className="relative cursor-pointer bg-white dark:bg-gray-600 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 px-1">
                  {t('uploadPhoto')}
                </span>
                <p className="pl-1">{t('dragOrDrop')}</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('supportedFormats')}</p>
              {image && <p className="text-sm text-green-600 dark:text-green-400 font-medium">{image.name}</p>}
            </div>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};
