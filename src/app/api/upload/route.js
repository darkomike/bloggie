import { put, del } from '@vercel/blob';

// Max file size: 5MB (Vercel Blob supports larger but 413 errors suggest payload too large)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/upload - Upload a file to Vercel Blob
 * Body: { file: File, path: string }
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const path = formData.get('path');

    if (!file || !path) {
      return Response.json(
        { error: 'Missing file or path' },
        { status: 400 }
      );
    }

    // Check file size before uploading
    const buffer = await file.arrayBuffer();
    if (buffer.byteLength > MAX_FILE_SIZE) {
      return Response.json(
        { 
          error: `File size (${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (5MB). Please compress your image.` 
        },
        { status: 413 }
      );
    }

    const blob = await put(path, buffer, {
      access: 'public',
      contentType: file.type,
    });

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    
    // Handle specific error cases
    if (error?.message?.includes('413')) {
      return Response.json(
        { error: 'File too large. Please compress your image to under 5MB.' },
        { status: 413 }
      );
    }
    
    return Response.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload - Delete a file from Vercel Blob
 * Body: { url: string } - Full Vercel Blob URL
 */
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return Response.json(
        { error: 'Missing URL' },
        { status: 400 }
      );
    }

    // Extract just the pathname for deletion
    // URL format: https://xxxxx.public.blob.vercel-storage.com/path/to/file
    // del() expects: path/to/file (without domain)
    const urlObj = new URL(url);
    const blobPath = urlObj.pathname.substring(1); // Remove leading slash

    await del(blobPath);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    return Response.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}
