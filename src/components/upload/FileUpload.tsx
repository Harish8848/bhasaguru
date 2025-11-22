
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadProgress } from './UploadProgress';

interface FileUploadProps {
  onUploadComplete: (url: string, publicId: string, file: UploadedFileInfo) => void;
  folder?: string;
  accept?: string[]; // e.g., ['application/pdf', 'audio/mp3']
  maxSize?: number; // in bytes
  multiple?: boolean;
  label?: string;
}

interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
  url: string;
  publicId: string;
}

export function FileUpload({
  onUploadComplete,
  folder = 'bhasaguru/files',
  accept,
  maxSize = 50 * 1024 * 1024, // 50MB default
  multiple = false,
  label = 'Upload File',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const files = multiple ? acceptedFiles : [acceptedFiles[0]];
      
      for (const file of files) {
        if (!file) continue;

        // Validate file size
        if (file.size > maxSize) {
          setError(`File ${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`);
          continue;
        }

        // Reset error
        setError(null);
        setUploading(true);
        setProgress(0);

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', folder);
          formData.append('type', 'auto'); // Let Cloudinary detect type

          // Upload with progress tracking
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
              
              const fileInfo: UploadedFileInfo = {
                name: file.name,
                size: file.size,
                type: file.type,
                url: result.data.secureUrl,
                publicId: result.data.publicId,
              };

              setUploadedFiles(prev => [...prev, fileInfo]);
              onUploadComplete(result.data.secureUrl, result.data.publicId, fileInfo);
              setProgress(100);
            } else {
              setError('Upload failed');
            }
            setUploading(false);
          });

          xhr.addEventListener('error', () => {
            setError('Upload failed');
            setUploading(false);
          });

          xhr.open('POST', '/api/upload');
          xhr.send(formData);
        } catch (err) {
          console.error('Upload error:', err);
          setError('Upload failed. Please try again.');
          setUploading(false);
        }
      }
    },
    [folder, maxSize, multiple, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept
      ? accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
      : undefined,
    maxFiles: multiple ? undefined : 1,
  });

  const removeFile = (publicId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.publicId !== publicId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/>
        </svg>
      );
    }
    if (type.includes('audio')) {
      return (
        <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 3v2h-2V3H8v2H6V3H4v14h2v-2h2v2h6v-2h2v2h2V3h-2z"/>
        </svg>
      );
    }
    if (type.includes('text') || type.includes('document')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/>
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-2">
          {/* Upload Icon */}
          <div className="flex justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm text-gray-600 font-medium">
              {isDragActive
                ? 'Drop files here'
                : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {accept
                ? `Allowed types: ${accept.join(', ')}`
                : 'Any file type'}
              {' • '}
              Max size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <UploadProgress 
          progress={progress} 
          fileName="Uploading..."
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Files ({uploadedFiles.length})
          </p>
          {uploadedFiles.map((file) => (
            <div
              key={file.publicId}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* File Icon */}
              <div className="shrink-0">
                {getFileIcon(file.type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                  title="View file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </a>
                <button
                  onClick={() => removeFile(file.publicId)}
                  className="text-red-600 hover:text-red-700"
                  title="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}