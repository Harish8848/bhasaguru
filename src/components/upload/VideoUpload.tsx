'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface VideoUploadProps {
  onUploadComplete: (url: string, publicId: string) => void;
  folder?: string;
}

export function VideoUpload({
  onUploadComplete,
  folder = 'bhasaguru/videos',
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate
    if (file.size > 100 * 1024 * 1024) {
      alert('Video size must be less than 100MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('type', 'video');

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          setVideoUrl(result.data.secureUrl);
          onUploadComplete(result.data.secureUrl, result.data.publicId);
        } else {
          alert('Upload failed');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        alert('Upload failed');
        setUploading(false);
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
      setUploading(false);
    }
  }, [folder, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      {videoUrl ? (
        <div className="space-y-2">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg"
          />
          <button
            onClick={() => setVideoUrl(null)}
            className="w-full px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg"
          >
            Remove Video
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploading... {progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Drop the video here'
                  : 'Click or drag video to upload'}
              </p>
              <p className="text-xs text-gray-500">
                MP4, MOV, AVI up to 100MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}