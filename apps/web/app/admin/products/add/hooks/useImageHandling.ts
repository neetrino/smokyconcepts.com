'use client';

import type { ChangeEvent } from 'react';
import { apiClient } from '@/lib/api-client';
import { isLikelyRasterImageFileForAdminUpload } from '@/lib/services/utils/heic-browser-convert';
import { processImageFile } from '@/lib/services/utils/image-utils';
import type { Variant, ColorData } from '../types';
import type { GeneratedVariant } from '../types';

const UPLOAD_IMAGES_ENDPOINT = '/api/v1/admin/products/upload-images';

/** Preserve original image format: PNG → PNG, WebP → WebP, else JPEG. */
function getOutputFileType(file: File): string {
  const t = file.type?.toLowerCase();
  if (t === 'image/png') return 'image/png';
  if (t === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

/** Upload base64 images to R2 via API; returns array of public URLs. */
async function uploadImagesToR2(images: string[]): Promise<string[]> {
  const res = await apiClient.post<{ urls: string[] }>(UPLOAD_IMAGES_ENDPOINT, { images });
  return res?.urls ?? [];
}

interface UseImageHandlingProps {
  imageUrls: string[];
  featuredImageIndex: number;
  variants: Variant[];
  generatedVariants: GeneratedVariant[];
  colorImageTarget: { variantId: string; colorValue: string } | null;
  setImageUrls: (updater: (prev: string[]) => string[]) => void;
  setFeaturedImageIndex: (index: number) => void;
  setMainProductImage: (image: string) => void;
  setVariants: (updater: (prev: Variant[]) => Variant[]) => void;
  setGeneratedVariants: (updater: (prev: GeneratedVariant[]) => GeneratedVariant[]) => void;
  setImageUploadLoading: (loading: boolean) => void;
  setImageUploadError: (error: string | null) => void;
  setColorImageTarget: (target: { variantId: string; colorValue: string } | null) => void;
  t: (key: string) => string;
}

interface UseImageHandlingReturn {
  addImageUrl: () => void;
  removeImageUrl: (index: number) => void;
  updateImageUrl: (index: number, url: string) => void;
  setFeaturedImage: (index: number) => void;
  handleUploadImageFiles: (files: File[]) => Promise<void>;
  handleUploadImages: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleUploadVariantImage: (variantId: string, event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleUploadColorImages: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  addColorImages: (variantId: string, colorValue: string, images: string[]) => void;
}

export function useImageHandling({
  imageUrls,
  featuredImageIndex,
  variants,
  generatedVariants,
  colorImageTarget,
  setImageUrls,
  setFeaturedImageIndex,
  setMainProductImage,
  setVariants,
  setGeneratedVariants,
  setImageUploadLoading,
  setImageUploadError,
  setColorImageTarget,
  t,
}: UseImageHandlingProps): UseImageHandlingReturn {
  const processAndUploadFiles = async (files: File[]): Promise<void> => {
    if (files.length === 0) {
      return;
    }

    console.log('📸 [UPLOAD] Starting upload of', files.length, 'image(s)');
    setImageUploadLoading(true);
    setImageUploadError(null);

    try {
      const imageFiles = files.filter((file) => isLikelyRasterImageFileForAdminUpload(file));
      if (imageFiles.length === 0) {
        setImageUploadError(t('admin.products.add.failedToProcessImages') || 'No valid image files selected');
        return;
      }

      const uploadedImages: string[] = [];
      const errors: string[] = [];

      for (let index = 0; index < imageFiles.length; index += 1) {
        const file = imageFiles[index];
        try {
          console.log(
            `📸 [UPLOAD] Processing file ${index + 1}/${imageFiles.length}:`,
            file.name,
            `(${Math.round(file.size / 1024)}KB)`
          );

          const base64 = await processImageFile(file, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            fileType: getOutputFileType(file),
            initialQuality: 0.85,
          });

          if (base64 && base64.trim()) {
            uploadedImages.push(base64);
          } else {
            errors.push(`Failed to convert "${file.name}" to base64`);
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Error processing "${file.name}": ${message}`);
        }
      }

      if (errors.length > 0) {
        console.warn('⚠️ [UPLOAD] Errors during upload:', errors);
        setImageUploadError(errors.join('; '));
      }

      if (uploadedImages.length === 0) {
        setImageUploadError(t('admin.products.add.failedToProcessImages') || 'Failed to process images');
        return;
      }

      const urls = await uploadImagesToR2(uploadedImages);
      if (urls.length === 0) {
        setImageUploadError(t('admin.products.add.failedToProcessImages') || 'Upload to storage failed');
        return;
      }

      setImageUrls((prev) => {
        const newImageUrls = [...prev, ...urls];
        if (prev.length === 0 && newImageUrls.length > 0) {
          setFeaturedImageIndex(0);
          setMainProductImage(newImageUrls[0]);
        }
        return newImageUrls;
      });
    } catch (error: unknown) {
      console.error('❌ [UPLOAD] Fatal error during upload:', error);
      const message = error instanceof Error ? error.message : t('admin.products.add.failedToProcessImages');
      setImageUploadError(message);
    } finally {
      setImageUploadLoading(false);
    }
  };

  const addImageUrl = () => {
    setImageUrls((prev) => [...prev, '']);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      let newFeaturedIndex = featuredImageIndex;
      if (index === featuredImageIndex) {
        newFeaturedIndex = 0;
      } else if (index < featuredImageIndex) {
        newFeaturedIndex = Math.max(0, featuredImageIndex - 1);
      }
      const finalFeaturedIndex = newUrls.length === 0 ? 0 : Math.min(newFeaturedIndex, newUrls.length - 1);
      const mainImage = newUrls.length > 0 && newUrls[finalFeaturedIndex] ? newUrls[finalFeaturedIndex] : '';
      setFeaturedImageIndex(finalFeaturedIndex);
      setMainProductImage(mainImage);
      return newUrls;
    });
  };

  const updateImageUrl = (index: number, url: string) => {
    setImageUrls((prev) => {
      const newUrls = [...prev];
      newUrls[index] = url;
      return newUrls;
    });
  };

  const setFeaturedImage = (index: number) => {
    if (index < 0 || index >= imageUrls.length) {
      return;
    }
    const mainImage = imageUrls[index] || '';
    setFeaturedImageIndex(index);
    setMainProductImage(mainImage);
  };

  const addColorImages = (variantId: string, colorValue: string, images: string[]) => {
    console.log('🖼️ [ADMIN] Adding images to color:', {
      variantId,
      colorValue,
      imagesCount: images.length,
    });

    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          const updatedColors = v.colors.map((c) => {
            if (c.colorValue === colorValue) {
              const uniqueNewImages = images.filter((newImg) => !c.images.includes(newImg));
              const newImages = [...c.images, ...uniqueNewImages];
              return { ...c, images: newImages };
            }
            return c;
          });
          return { ...v, colors: updatedColors };
        }
        return v;
      })
    );
  };

  const handleUploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    await processAndUploadFiles(files);
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUploadVariantImage = async (variantId: string, event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    const file = files[0];
    if (!isLikelyRasterImageFileForAdminUpload(file)) {
      setImageUploadError(`"${file.name}" is not an image file`);
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    setImageUploadLoading(true);
    setImageUploadError(null);
    try {
      console.log('🖼️ [VARIANT IMAGE] Processing variant image:', {
        variantId,
        fileName: file.name,
        originalSize: `${Math.round(file.size / 1024)}KB`,
      });

      const base64 = await processImageFile(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: getOutputFileType(file),
        initialQuality: 0.85,
      });

      const urls = await uploadImagesToR2([base64]);
      const imageUrl = urls[0] ?? base64;
      setGeneratedVariants((prev) => prev.map((v) => (v.id === variantId ? { ...v, image: imageUrl } : v)));
      console.log('✅ [VARIANT BUILDER] Variant image uploaded and processed for variant:', variantId);
    } catch (error: any) {
      console.error('❌ [VARIANT IMAGE] Error processing variant image:', error);
      setImageUploadError(error?.message || t('admin.products.add.failedToProcessImage'));
    } finally {
      setImageUploadLoading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleUploadColorImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !colorImageTarget) {
      console.log('⚠️ [ADMIN] No files or no color target:', { filesLength: files.length, colorImageTarget });
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    const imageFiles = files.filter((file) => isLikelyRasterImageFileForAdminUpload(file));
    if (imageFiles.length === 0) {
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    try {
      setImageUploadLoading(true);
      console.log('📤 [ADMIN] Starting upload for color:', colorImageTarget.colorValue, 'Files:', imageFiles.length);

      const base64Images = await Promise.all(
        imageFiles.map(async (file, index) => {
          console.log(`🖼️ [COLOR IMAGE] Processing image ${index + 1}/${imageFiles.length}:`, {
            fileName: file.name,
            originalSize: `${Math.round(file.size / 1024)}KB`,
          });

          const base64 = await processImageFile(file, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            fileType: getOutputFileType(file),
            initialQuality: 0.85,
          });

          console.log(`✅ [COLOR IMAGE] Image ${index + 1}/${imageFiles.length} processed, base64 length:`, base64.length);
          return base64;
        })
      );

      const uploadedImages = await uploadImagesToR2(base64Images);

      console.log('📥 [ADMIN] All images uploaded to R2, adding to variant:', {
        variantId: colorImageTarget.variantId,
        colorValue: colorImageTarget.colorValue,
        imagesCount: uploadedImages.length,
      });

      addColorImages(colorImageTarget.variantId, colorImageTarget.colorValue, uploadedImages);
      console.log('✅ [ADMIN] Color images added to state:', uploadedImages.length);
    } catch (error: any) {
      console.error('❌ [ADMIN] Error uploading color images:', error);
      setImageUploadError(error?.message || t('admin.products.add.failedToProcessImages'));
    } finally {
      setImageUploadLoading(false);
      if (event.target) {
        event.target.value = '';
      }
      setColorImageTarget(null);
    }
  };

  return {
    addImageUrl,
    removeImageUrl,
    updateImageUrl,
    setFeaturedImage,
    handleUploadImageFiles: processAndUploadFiles,
    handleUploadImages,
    handleUploadVariantImage,
    handleUploadColorImages,
    addColorImages,
  };
}


