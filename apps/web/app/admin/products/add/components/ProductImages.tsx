'use client';

import { useState, type ChangeEvent, type DragEvent, type RefObject } from 'react';
import { useTranslation } from '../../../../../lib/i18n-client';
import { ADMIN_RASTER_IMAGE_FILE_ACCEPT } from '@/lib/services/utils/heic-browser-convert';

interface ProductImagesProps {
  imageUrls: string[];
  featuredImageIndex: number;
  imageUploadLoading: boolean;
  imageUploadError: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  onUploadImages: (event: ChangeEvent<HTMLInputElement>) => void;
  onUploadImageFiles: (files: File[]) => Promise<void>;
  onRemoveImage: (index: number) => void;
  onSetFeaturedImage: (index: number) => void;
}

export function ProductImages({
  imageUrls,
  featuredImageIndex,
  imageUploadLoading,
  imageUploadError,
  fileInputRef,
  onUploadImages,
  onUploadImageFiles,
  onRemoveImage,
  onSetFeaturedImage,
}: ProductImagesProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length > 0) {
      await onUploadImageFiles(files);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.products.add.mainProductImage')}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.products.add.productImages')}
            <span className="text-xs text-gray-500 ml-2">({t('admin.products.add.uploadMultipleImages')})</span>
          </label>
          
          <div
            className={`mb-4 rounded-lg border-2 border-dashed p-6 transition-colors ${
              isDragOver ? 'border-[#dcc090] bg-[#dcc090]/15' : 'border-[#dcc090]/35 bg-[#dcc090]/10'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(event) => {
              void handleDrop(event);
            }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploadLoading}
              className="mx-auto px-4 py-2 text-sm font-medium text-[#122a26] bg-white border border-[#dcc090]/35 rounded-md hover:bg-[#dcc090]/10 focus:outline-none focus:ring-2 focus:ring-[#dcc090] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {imageUploadLoading ? t('admin.products.add.uploading') : t('admin.products.add.uploadImages')}
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">
              Drag and drop images here or click to choose files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ADMIN_RASTER_IMAGE_FILE_ACCEPT}
              multiple
              onChange={onUploadImages}
              className="hidden"
            />
          </div>

          {/* Images Grid */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageUrls.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className={`relative border-2 rounded-md overflow-hidden ${
                    featuredImageIndex === index 
                      ? 'border-[#dcc090] ring-2 ring-[#dcc090]/40'
                      : 'border-[#dcc090]/35'
                  }`}>
                    <img
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Main Checkbox */}
                    <div className="absolute top-2 left-2">
                      <label className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="checkbox"
                          checked={featuredImageIndex === index}
                          onChange={() => onSetFeaturedImage(index)}
                          className="w-4 h-4 text-[#122a26] border-[#dcc090]/40 rounded focus:ring-[#dcc090]"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {featuredImageIndex === index ? t('admin.products.add.main') : t('admin.products.add.setAsMain')}
                        </span>
                      </label>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title={t('admin.products.add.removeImage')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Main Badge */}
                    {featuredImageIndex === index && (
                      <div className="absolute bottom-2 left-2 bg-[#122a26] text-[#dcc090] px-2 py-1 rounded text-xs font-medium">
                        {t('admin.products.add.main')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {imageUploadError && (
            <div className="mt-2 text-sm text-red-600">
              {imageUploadError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


