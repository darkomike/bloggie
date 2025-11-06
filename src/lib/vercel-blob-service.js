import { put, del } from '@vercel/blob';

/**
 * Compress an image file before upload
 * @param {File|Blob} file - The image file to compress
 * @param {Object} options
 * @param {number} options.quality - Quality level (0-1)
 * @param {number} options.maxWidth - Max width in pixels
 * @param {number} options.maxHeight - Max height in pixels
 * @param {string} options.mimeType - Target mime type
 * @returns {Promise<File>} - Compressed image file
 */
export async function compressImageFile(file, options = {}) {
  const {
    quality = 0.8,
    maxWidth = 2000,
    maxHeight = 2000,
    mimeType,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (event) => {
      reject(event.target?.error || new Error('Failed to read file for compression'));
    };
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = mimeType || (file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg');

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Unable to compress image'));
              return;
            }
            const fileName = file.name || `compressed-${Date.now()}.jpg`;
            const compressedFile = new File([blob], fileName, {
              type: targetMime,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          targetMime,
          quality
        );
      };
      img.onerror = () => reject(new Error('Unable to load image for compression'));
      img.src = event.target.result;
    };
  });
}

/**
 * Upload a file to Vercel Blob via API route
 * @param {File} file - The file to upload
 * @param {string} path - The path in blob storage (e.g., 'blog-covers/image.jpg')
 * @returns {Promise<string>} - The URL of the uploaded file
 */
export async function uploadBlob(file, path) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    let fileToUpload = file;
    
    // Max file size: 5MB
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    // Compress image if it's an image file
    if (file.type.startsWith('image/')) {
      if (file.size > MAX_FILE_SIZE) {
        console.log(`📦 Image ${file.name} is ${(file.size / 1024 / 1024).toFixed(2)}MB - compressing to <5MB...`);
        fileToUpload = await compressImageFile(file, { quality: 0.6 });
        
        // If still too large, compress more aggressively
        if (fileToUpload.size > MAX_FILE_SIZE) {
          console.log(`📦 Still large (${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB) - compressing further...`);
          fileToUpload = await compressImageFile(fileToUpload, { quality: 0.4 });
        }
        
        console.log(`✅ Compressed to ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
      } else if (file.size > 1024 * 1024) {
        // Compress if over 1MB even if under max (for bandwidth optimization)
        console.log(`📦 Optimizing image ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
        fileToUpload = await compressImageFile(file, { quality: 0.75 });
        console.log(`✅ Optimized to ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
      }
    }
    
    // Final check - reject if still over 5MB
    if (fileToUpload.size > MAX_FILE_SIZE) {
      throw new Error(`File is too large (${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 5MB.`);
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('path', path);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Server error: ${response.statusText}` };
      }
      
      console.error('Upload failed with status', response.status, errorData);
      
      if (response.status === 413) {
        throw new Error(errorData.error || 'File too large. Please use a smaller image.');
      }
      throw new Error(errorData.error || `Upload failed (status: ${response.status})`);
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw error;
  }
}

/**
 * Delete a file from Vercel Blob via API route
 * @param {string} url - The URL of the file to delete (full URL)
 */
export async function deleteBlob(url) {
  try {
    if (!url) {
      throw new Error('No URL provided');
    }

    // Skip deletion for data URLs or other non-http references
    if (!/^https?:\/\//i.test(url)) {
      console.warn('Skipping blob deletion for non-HTTP URL:', url.slice(0, 60));
      return false;
    }

    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }

    return true;
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    throw error;
  }
}

/**
 * Upload a blog cover image
 * @param {File} file - The image file
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export async function uploadBlogCover(file) {
  const timestamp = Date.now();
  const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `blog-covers/${timestamp}-${filename}`;
  return uploadBlob(file, path);
}

/**
 * Upload a user avatar
 * @param {File} file - The image file
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - The URL of the uploaded avatar
 */
export async function uploadUserAvatar(file, userId) {
  const timestamp = Date.now();
  const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `avatars/${userId}/${timestamp}-${filename}`;
  return uploadBlob(file, path);
}
