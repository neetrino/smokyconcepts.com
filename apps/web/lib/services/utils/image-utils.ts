/**
 * Unified image URL utilities for consistent handling across the application
 */

import imageCompression from 'browser-image-compression';
import { ensureBrowserDecodableImageFile } from './heic-browser-convert';
import { logger } from './logger';

const PNG_TRIM_ALPHA_THRESHOLD = 8;

async function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read image for trim'));
    reader.readAsDataURL(file);
  });
}

async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to decode image for trim'));
    image.src = src;
  });
}

function resolveOpaqueBounds(
  alphaChannel: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold: number
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = alphaChannel[(y * width + x) * 4 + 3];
      if (alpha < alphaThreshold) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY };
}

async function trimTransparentImageFile(
  file: File,
  outputType: string,
  alphaThreshold = PNG_TRIM_ALPHA_THRESHOLD
): Promise<File> {
  if (typeof document === 'undefined' || !outputType.includes('png')) return file;
  const src = await readFileAsDataUrl(file);
  const image = await loadImageElement(src);
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (width <= 0 || height <= 0) return file;

  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceCtx = sourceCanvas.getContext('2d');
  if (!sourceCtx) return file;
  sourceCtx.drawImage(image, 0, 0, width, height);

  const sourcePixels = sourceCtx.getImageData(0, 0, width, height);
  const bounds = resolveOpaqueBounds(sourcePixels.data, width, height, alphaThreshold);
  if (!bounds) return file;

  const trimmedWidth = bounds.maxX - bounds.minX + 1;
  const trimmedHeight = bounds.maxY - bounds.minY + 1;
  if (trimmedWidth === width && trimmedHeight === height) return file;

  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = trimmedWidth;
  targetCanvas.height = trimmedHeight;
  const targetCtx = targetCanvas.getContext('2d');
  if (!targetCtx) return file;
  targetCtx.drawImage(
    sourceCanvas,
    bounds.minX,
    bounds.minY,
    trimmedWidth,
    trimmedHeight,
    0,
    0,
    trimmedWidth,
    trimmedHeight
  );

  const trimmedBlob = await new Promise<Blob | null>((resolve) =>
    targetCanvas.toBlob(resolve, outputType)
  );
  if (!trimmedBlob) return file;

  const extension = outputType.includes('png') ? 'png' : file.name.split('.').pop() ?? 'png';
  const safeName = file.name.replace(/\.[^.]+$/, '') || 'product-image';
  return new File([trimmedBlob], `${safeName}.${extension}`, { type: outputType });
}

/**
 * Type for image URL input - can be string or object with url/src/value properties
 */
type ImageUrlInput = string | null | undefined | { url?: string; src?: string; value?: string };

/**
 * Validates if a URL is a valid image URL
 */
export function isValidImageUrl(url: ImageUrlInput): boolean {
  if (!url) return false;
  
  const urlStr = typeof url === 'string' ? url.trim() : '';
  if (!urlStr) return false;
  
  // Base64 images are valid
  if (urlStr.startsWith('data:image/')) return true;
  
  // HTTP/HTTPS URLs are valid
  if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) return true;
  
  // Relative paths starting with / are valid
  if (urlStr.startsWith('/')) return true;
  
  return false;
}

/**
 * Processes and normalizes an image URL from various formats
 * Returns null if invalid
 */
export function processImageUrl(url: ImageUrlInput): string | null {
  if (!url) return null;
  
  let finalUrl = '';
  if (typeof url === 'string') {
    finalUrl = url.trim();
  } else if (typeof url === 'object' && url !== null) {
    finalUrl = (url.url || url.src || url.value || '').trim();
  }
  
  if (!finalUrl) return null;
  
  // Validate
  if (!isValidImageUrl(finalUrl)) {
    return null;
  }
  
  // For base64 or full URLs, return as-is
  if (finalUrl.startsWith('data:') || finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
    return finalUrl;
  }
  
  // For relative paths, ensure they start with /
  if (finalUrl.startsWith('/')) {
    return finalUrl;
  }
  
  return `/${finalUrl}`;
}

/**
 * Smart split for comma-separated image URLs that handles Base64 data URIs
 * Base64 strings can contain commas, so we need special handling
 */
export function smartSplitUrls(str: string | null | undefined): string[] {
  if (!str) return [];
  
  // If no base64, simple split
  if (!str.includes('data:image/')) {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  // Handle base64 - split carefully
  // Base64 format: data:image/type;base64,<base64data>
  // The comma after base64, is the separator, but base64 data itself can contain commas
  // We need to find the comma that separates base64 header from data, then find the next URL separator
  
  const results: string[] = [];
  let i = 0;
  
  while (i < str.length) {
    if (str.substring(i).startsWith('data:image/')) {
      // Found start of base64 image
      // Find the comma after base64, (this is the separator between header and data)
      const headerEnd = str.indexOf(',', i);
      if (headerEnd === -1) {
        // No comma found, treat entire rest as base64
        results.push(str.substring(i).trim());
        break;
      }
      
      // Find the next comma that's likely a URL separator (followed by whitespace and another URL pattern)
      // Or find end of string
      let nextSeparator = str.length;
      for (let j = headerEnd + 1; j < str.length; j++) {
        if (str[j] === ',') {
          // Check if this comma is followed by a URL pattern (not part of base64)
          const afterComma = str.substring(j + 1).trim();
          if (afterComma.startsWith('data:image/') || 
              afterComma.startsWith('http://') || 
              afterComma.startsWith('https://') ||
              afterComma.startsWith('/')) {
            nextSeparator = j;
            break;
          }
        }
      }
      
      // Extract base64 image (from start to separator)
      const base64Image = str.substring(i, nextSeparator).trim();
      if (base64Image) {
        results.push(base64Image);
      }
      
      i = nextSeparator + 1;
    } else {
      // Regular URL - find next comma or end
      const nextComma = str.indexOf(',', i);
      if (nextComma === -1) {
        // No more commas, add rest as single URL
        const url = str.substring(i).trim();
        if (url) {
          results.push(url);
        }
        break;
      } else {
        // Add URL up to comma
        const url = str.substring(i, nextComma).trim();
        if (url) {
          results.push(url);
        }
        i = nextComma + 1;
      }
    }
  }
  
  return results.filter(Boolean);
}

/**
 * Normalizes URL for comparison (ensures consistent format for deduplication)
 * Returns normalized string for exact matching
 */
export function normalizeUrlForComparison(url: string): string {
  if (!url) return '';
  
  // Base64 images - return as-is (exact match required)
  if (url.startsWith('data:')) {
    return url;
  }
  
  // HTTP/HTTPS URLs - return as-is (exact match)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Relative paths - normalize to start with /
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  
  return `/${trimmed}`;
}

/**
 * Gets all normalized variations of a URL for comparison
 * Useful when comparing URLs that might have different formats
 */
export function getUrlVariations(url: string): string[] {
  if (!url) return [];
  
  const normalized = normalizeUrlForComparison(url);
  const variations = new Set<string>([normalized]);
  
  // For relative paths, add variations with/without leading slash
  if (!normalized.startsWith('data:') && !normalized.startsWith('http')) {
    if (normalized.startsWith('/')) {
      variations.add(normalized.substring(1));
      variations.add(normalized);
    } else {
      variations.add(normalized);
      variations.add(`/${normalized}`);
    }
    
    // Also add without query params
    const withoutQuery = normalized.split('?')[0];
    if (withoutQuery !== normalized) {
      variations.add(withoutQuery);
      if (withoutQuery.startsWith('/')) {
        variations.add(withoutQuery.substring(1));
      } else {
        variations.add(`/${withoutQuery}`);
      }
    }
  }
  
  return Array.from(variations);
}

/**
 * Cleans and validates an array of image URLs
 * Removes invalid, empty, and duplicate URLs
 */
export function cleanImageUrls(urls: (string | ImageUrlInput)[]): string[] {
  if (!Array.isArray(urls)) return [];
  
  const seen = new Set<string>();
  const cleaned: string[] = [];
  
  for (const url of urls) {
    const processed = processImageUrl(url);
    if (!processed) continue;
    
    const normalized = normalizeUrlForComparison(processed);
    if (seen.has(normalized)) continue;
    
    seen.add(normalized);
    cleaned.push(processed);
  }
  
  return cleaned;
}

/**
 * Separates main images from variant images
 * Removes variant images from main images array to prevent duplication
 */
export function separateMainAndVariantImages(
  mainImages: (string | ImageUrlInput)[],
  variantImages: (string | ImageUrlInput)[]
): {
  main: string[];
  variants: string[];
} {
  // Process and normalize all variant images
  const variantUrlSet = new Set<string>();
  const variantVariationsMap = new Map<string, string[]>();
  
  for (const variantImg of variantImages) {
    const processed = processImageUrl(variantImg);
    if (!processed) continue;
    
    const normalized = normalizeUrlForComparison(processed);
    variantUrlSet.add(normalized);
    
    // Store all variations for this URL
    const variations = getUrlVariations(processed);
    variations.forEach(v => variantVariationsMap.set(v, variations));
  }
  
  // Process main images and filter out those that match variants
  const mainProcessed: string[] = [];
  const seenMain = new Set<string>();
  
  for (const mainImg of mainImages) {
    const processed = processImageUrl(mainImg);
    if (!processed) continue;
    
    const normalized = normalizeUrlForComparison(processed);
    
    // Check if this main image matches any variant image
    const isVariantImage = variantUrlSet.has(normalized) || 
                          variantVariationsMap.has(normalized) ||
                          Array.from(variantVariationsMap.values()).some(variations => 
                            variations.some(v => {
                              const mainVariations = getUrlVariations(processed);
                              return mainVariations.includes(v);
                            })
                          );
    
    if (isVariantImage) {
      continue; // Skip - this is a variant image
    }
    
    // Check for duplicates in main images
    if (seenMain.has(normalized)) {
      continue;
    }
    
    seenMain.add(normalized);
    mainProcessed.push(processed);
  }
  
  // Process variant images (already validated above)
  const variantProcessed: string[] = [];
  const seenVariant = new Set<string>();
  
  for (const variantImg of variantImages) {
    const processed = processImageUrl(variantImg);
    if (!processed) continue;
    
    const normalized = normalizeUrlForComparison(processed);
    if (seenVariant.has(normalized)) continue;
    
    seenVariant.add(normalized);
    variantProcessed.push(processed);
  }
  
  return {
    main: mainProcessed,
    variants: variantProcessed,
  };
}

/**
 * Processes an image file with compression, EXIF orientation correction, and size optimization
 * Automatically handles:
 * - EXIF orientation (rotates image correctly)
 * - Resize to max dimensions (1920x1920 by default)
 * - Compression to reduce file size (maxSizeMB: 2MB by default)
 * 
 * @param file - The image file to process
 * @param options - Processing options
 * @returns Promise<string> - Base64 data URL of processed image
 */
export async function processImageFile(
  file: File,
  options?: {
    maxSizeMB?: number; // Maximum file size in MB (default: 2)
    maxWidthOrHeight?: number; // Maximum width or height in pixels (default: 1920)
    useWebWorker?: boolean; // Use web worker for processing (default: true)
    fileType?: string; // Output file type (default: 'image/jpeg')
    initialQuality?: number; // Initial quality 0-1 (default: 0.8)
    trimTransparentPadding?: boolean; // Trim transparent PNG borders (default: true for png output)
    trimAlphaThreshold?: number; // Alpha threshold for trim detection (default: 8)
  }
): Promise<string> {
  try {
    logger.debug('Starting image processing', {
      fileName: file.name,
      originalSize: `${Math.round(file.size / 1024)}KB`,
      type: file.type
    });

    const {
      maxSizeMB = 2,
      maxWidthOrHeight = 1920,
      useWebWorker = true,
      fileType = 'image/jpeg',
      initialQuality = 0.8,
      trimTransparentPadding = fileType === 'image/png',
      trimAlphaThreshold = PNG_TRIM_ALPHA_THRESHOLD,
    } = options || {};

    const decodableFile = await ensureBrowserDecodableImageFile(file);
    if (decodableFile !== file) {
      logger.info('HEIC/HEIF decoded to JPEG for pipeline', {
        originalName: file.name,
        decodedName: decodableFile.name,
      });
    }

    // Process image with compression and EXIF orientation correction
    // browser-image-compression automatically handles EXIF orientation
    const compressedFile = await imageCompression(decodableFile, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      fileType,
      initialQuality,
      // EXIF orientation is automatically handled by browser-image-compression
    });

    const normalizedFile = trimTransparentPadding
      ? await trimTransparentImageFile(compressedFile, fileType, trimAlphaThreshold)
      : compressedFile;

    logger.info('Image processed successfully', {
      originalSize: `${Math.round(decodableFile.size / 1024)}KB`,
      compressedSize: `${Math.round(normalizedFile.size / 1024)}KB`,
      reduction: `${Math.round((1 - normalizedFile.size / decodableFile.size) * 100)}%`,
      trimTransparentPadding,
    });

    // Convert to base64
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        logger.debug('Image converted to base64', { length: result.length });
        resolve(result);
      };
      reader.onerror = (error) => {
        logger.error('Error converting to base64', { error });
        reject(new Error('Failed to convert image to base64'));
      };
      reader.readAsDataURL(normalizedFile);
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
    logger.error('Error processing image', { error });
    throw new Error(errorMessage);
  }
}

