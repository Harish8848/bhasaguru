export async function uploadToCloudinary(file: File, folder: string = 'bhasaguru') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', folder);
  
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
  
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
  
    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      size: data.bytes,
    };
  }
  
  export function validateFile(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }) {
    const { maxSize = 10 * 1024 * 1024, allowedTypes } = options; // default 10MB
  
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
    }
  
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
    }
  
    return true;
  }