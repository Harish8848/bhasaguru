import cloudinary from './cloudinary';

export interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any[];
  tags?: string[];
}

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  size: number;
  resourceType: string;
}

/**
 * Upload file to Cloudinary (Server-side)
 * @param file - File buffer or base64 string
 * @param options - Upload options
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    folder = 'bhasaguru',
    resourceType = 'auto',
    transformation = [],
    tags = [],
  } = options;

  try {
    const result = await cloudinary.uploader.upload(file.toString('base64'), {
      folder,
      resource_type: resourceType,
      transformation,
      tags,
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      duration: result.duration,
      size: result.bytes,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

/**
 * Delete file from Cloudinary
 * @param publicId - Public ID of the file
 * @param resourceType - Type of resource
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}

/**
 * Generate signed upload URL (for secure client-side uploads)
 * @param folder - Upload folder
 */
export function generateSignedUploadUrl(folder: string = 'bhasaguru') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  };
}