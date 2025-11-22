'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadComplete: (url: string, publicId: string) => void;
  folder?: string;
  currentImage?: string;
}

export function ImageUpload({
  onUploadComplete,
  folder = 'bhasaguru',
  currentImage,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('type', 'image');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      onUploadComplete(result.data.secureUrl, result.data.publicId);
      setProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [folder, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white">
                <p>Uploading... {progress}%</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image, or click to select'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      )}

      {!uploading && preview && (
        <button
          onClick={() => setPreview(null)}
          className="w-full px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
        >
          Remove Image
        </button>
      )}
    </div>
  );
}