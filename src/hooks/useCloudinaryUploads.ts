import { useState } from 'react';

interface UploadResult {
  url: string;
  publicId: string;
}

export function useCloudinaryUpload(folder: string = 'bhasaguru') {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    file: File,
    type: 'image' | 'video' | 'auto' = 'auto'
  ): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setProgress(100);

      return {
        url: result.data.secureUrl,
        publicId: result.data.publicId,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (publicId: string, resourceType: 'image' | 'video' = 'image') => {
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, resourceType }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      return false;
    }
  };

  return {
    upload,
    deleteFile,
    uploading,
    progress,
    error,
  };
}