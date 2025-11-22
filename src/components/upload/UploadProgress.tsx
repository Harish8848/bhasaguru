'use client';

interface UploadProgressProps {
  progress: number; // 0-100
  fileName?: string;
  fileSize?: number;
  uploadSpeed?: number; // bytes per second
  showPercentage?: boolean;
  showFileName?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function UploadProgress({
  progress,
  fileName,
  fileSize,
  uploadSpeed,
  showPercentage = true,
  showFileName = true,
  variant = 'default',
}: UploadProgressProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return `${formatFileSize(bytesPerSecond)}/s`;
  };

  const calculateTimeRemaining = () => {
    if (!fileSize || !uploadSpeed || uploadSpeed === 0) return null;
    const remaining = fileSize * ((100 - progress) / 100);
    const seconds = Math.ceil(remaining / uploadSpeed);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        {/* Spinner */}
        <div className="shrink-0">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        {/* Progress Bar */}
        <div className="flex-1">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Percentage */}
        {showPercentage && (
          <div className="shrink-0">
            <span className="text-sm font-semibold text-blue-600">
              {progress}%
            </span>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Animated Upload Icon */}
            <div className="relative">
              <svg
                className="w-10 h-10 text-blue-600"
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
              <div className="absolute inset-0 animate-ping">
                <svg
                  className="w-10 h-10 text-blue-400 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                </svg>
              </div>
            </div>

            {/* File Info */}
            <div>
              {showFileName && fileName && (
                <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                  {fileName}
                </p>
              )}
              <p className="text-xs text-gray-600 mt-0.5">
                Uploading...
              </p>
            </div>
          </div>

          {/* Percentage Badge */}
          <div className="shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-600 text-white">
              {progress}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-linear-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 relative"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            {fileSize && (
              <span>
                Size: {formatFileSize(fileSize)}
              </span>
            )}
            {uploadSpeed && uploadSpeed > 0 && (
              <span>
                Speed: {formatSpeed(uploadSpeed)}
              </span>
            )}
          </div>
          {calculateTimeRemaining() && (
            <span>
              {calculateTimeRemaining()} remaining
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
      {/* File Name */}
      {showFileName && fileName && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {fileName}
          </p>
          {showPercentage && (
            <span className="text-sm font-semibold text-blue-600 ml-2">
              {progress}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Additional Info */}
      {(fileSize || uploadSpeed) && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          {fileSize && <span>{formatFileSize(fileSize)}</span>}
          {uploadSpeed && uploadSpeed > 0 && (
            <span>{formatSpeed(uploadSpeed)}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: FileUpload for PDF attachments
<FileUpload
  folder="bhasaguru/attachments"
  accept={['application/pdf']}
  maxSize={10 * 1024 * 1024} // 10MB
  onUploadComplete={(url, publicId, file) => {
    console.log('PDF uploaded:', file);
  }}
  label="Upload Course Materials (PDF)"
/>

// Example 2: FileUpload for audio lessons
<FileUpload
  folder="bhasaguru/audio"
  accept={['audio/mp3', 'audio/wav', 'audio/mpeg']}
  maxSize={50 * 1024 * 1024} // 50MB
  onUploadComplete={(url, publicId, file) => {
    setLessonData({ ...lessonData, audioUrl: url });
  }}
  label="Upload Audio Lesson"
/>

// Example 3: Multiple file upload
<FileUpload
  folder="bhasaguru/documents"
  multiple={true}
  onUploadComplete={(url, publicId, file) => {
    setAttachments(prev => [...prev, file]);
  }}
/>

// Example 4: UploadProgress - Default
<UploadProgress
  progress={45}
  fileName="course-video.mp4"
  fileSize={15 * 1024 * 1024}
  uploadSpeed={500 * 1024}
/>

// Example 5: UploadProgress - Compact
<UploadProgress
  progress={75}
  variant="compact"
/>

// Example 6: UploadProgress - Detailed
<UploadProgress
  progress={60}
  fileName="lesson-01-introduction.mp4"
  fileSize={50 * 1024 * 1024}
  uploadSpeed={1.5 * 1024 * 1024}
  variant="detailed"
/>
*/

// ============================================================================
// CSS for shimmer animation (add to your global CSS)
// ============================================================================

/*
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
*/