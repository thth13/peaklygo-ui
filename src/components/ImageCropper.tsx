'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import ReactCrop, { Crop, PixelCrop, centerCrop, convertToPixelCrop, makeAspectCrop } from 'react-image-crop';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faCrop } from '@fortawesome/free-solid-svg-icons';
import 'react-image-crop/dist/ReactCrop.css';
import { useTranslations } from 'next-intl';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

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

export const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCropComplete, onCancel, aspectRatio }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useTranslations('image');
  const tCommon = useTranslations('common');

  useEffect(() => {
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [src, aspectRatio]);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const imageElement: HTMLImageElement = e.currentTarget;
      const rect: DOMRect = imageElement.getBoundingClientRect();
      const width: number = Math.max(1, Math.round(rect.width));
      const height: number = Math.max(1, Math.round(rect.height));
      const initialCrop: Crop = aspectRatio
        ? centerAspectCrop(width, height, aspectRatio)
        : { unit: '%', x: 0, y: 0, width: 100, height: 100 };
      setCrop(initialCrop);
      setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
    },
    [aspectRatio],
  );

  const getCroppedImg = useCallback(async () => {
    if (
      !completedCrop ||
      completedCrop.width < 1 ||
      completedCrop.height < 1 ||
      !imgRef.current ||
      !canvasRef.current
    ) {
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

    canvas.width = Math.max(1, Math.floor(completedCrop.width * scaleX));
    canvas.height = Math.max(1, Math.floor(completedCrop.height * scaleY));

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
        onCropComplete(croppedImageBlob);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faCrop} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Кадрирование изображения</h2>
                <p className="text-sm text-gray-600">Выберите область для обрезки</p>
              </div>
            </div>
            <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-auto flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            minWidth={50}
            minHeight={50}
          >
            <Image
              ref={imgRef}
              alt="Crop me"
              src={src}
              unoptimized
              width={500}
              height={500}
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            {tCommon('cancel')}
          </button>
          <button
            onClick={handleCropComplete}
            disabled={!completedCrop}
            className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faCheck} className="mr-2" />
            {t('applyCrop')}
          </button>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};
