import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (server-side only)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// Helper to get public Cloudinary URL
export const getCloudinaryUrl = (publicId: string, transformations?: string) => {
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`;
  return transformations 
    ? `${baseUrl}/${transformations}/${publicId}`
    : `${baseUrl}/image/upload/${publicId}`;
};