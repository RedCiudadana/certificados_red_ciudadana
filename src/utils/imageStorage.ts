// Utility functions for managing uploaded images in localStorage

export interface StoredImage {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  uploadDate: string;
}

const STORAGE_PREFIX = 'certificate_template_';
const STORAGE_INDEX_KEY = 'certificate_templates_index';

/**
 * Store an image in localStorage and return its ID
 */
export const storeImage = (file: File, dataUrl: string): string => {
  const imageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const storageKey = `${STORAGE_PREFIX}${imageId}`;
  
  const imageData: StoredImage = {
    id: imageId,
    name: file.name,
    dataUrl,
    size: file.size,
    uploadDate: new Date().toISOString()
  };
  
  try {
    // Store the image data
    localStorage.setItem(storageKey, JSON.stringify(imageData));
    
    // Update the index
    const index = getStoredImagesIndex();
    index.push(imageId);
    localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));
    
    return imageId;
  } catch (error) {
    console.error('Error storing image:', error);
    throw new Error('No se pudo guardar la imagen. Puede ser muy grande.');
  }
};

/**
 * Retrieve an image by ID
 */
export const getStoredImage = (imageId: string): StoredImage | null => {
  try {
    const storageKey = `${STORAGE_PREFIX}${imageId}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving image:', error);
    return null;
  }
};

/**
 * Get all stored images
 */
export const getAllStoredImages = (): StoredImage[] => {
  const index = getStoredImagesIndex();
  const images: StoredImage[] = [];
  
  index.forEach(imageId => {
    const image = getStoredImage(imageId);
    if (image) {
      images.push(image);
    }
  });
  
  return images.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
};

/**
 * Delete a stored image
 */
export const deleteStoredImage = (imageId: string): boolean => {
  try {
    const storageKey = `${STORAGE_PREFIX}${imageId}`;
    localStorage.removeItem(storageKey);
    
    // Update the index
    const index = getStoredImagesIndex();
    const updatedIndex = index.filter(id => id !== imageId);
    localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(updatedIndex));
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Get the index of stored image IDs
 */
const getStoredImagesIndex = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_INDEX_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading storage index:', error);
    return [];
  }
};

/**
 * Clean up orphaned images (images not in the index)
 */
export const cleanupOrphanedImages = (): number => {
  const index = getStoredImagesIndex();
  let cleanedCount = 0;
  
  // Get all localStorage keys that match our prefix
  const allKeys = Object.keys(localStorage);
  const imageKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));
  
  imageKeys.forEach(key => {
    const imageId = key.replace(STORAGE_PREFIX, '');
    if (!index.includes(imageId)) {
      localStorage.removeItem(key);
      cleanedCount++;
    }
  });
  
  return cleanedCount;
};

/**
 * Get total storage usage for images
 */
export const getStorageUsage = (): { totalSize: number; imageCount: number } => {
  const images = getAllStoredImages();
  const totalSize = images.reduce((sum, image) => sum + image.size, 0);
  
  return {
    totalSize,
    imageCount: images.length
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};