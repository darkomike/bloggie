import { put, del } from '@vercel/blob';

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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
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
 * @param {string} url - The URL of the file to delete
 */
export async function deleteBlob(url) {
  try {
    if (!url) {
      throw new Error('No URL provided');
    }

    // Extract the blob key from the URL
    // URL format: https://xxxxx.public.blob.vercel-storage.com/path/to/file
    // We need just the path part: path/to/file
    const urlObj = new URL(url);
    const blobKey = urlObj.pathname.substring(1); // Remove leading slash

    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: blobKey }),
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
  const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `avatars/${userId}/${filename}`;
  return uploadBlob(file, path);
}
