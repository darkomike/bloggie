import { put, del } from '@vercel/blob';

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

    const buffer = await file.arrayBuffer();

    const blob = await put(path, buffer, {
      access: 'public',
      contentType: file.type,
    });

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return Response.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload - Delete a file from Vercel Blob
 * Body: { url: string }
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

    await del(url);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    return Response.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}
