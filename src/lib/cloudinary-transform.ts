// Image transformation helpers

export const cloudinaryTransforms = {
    // Profile images (square, small)
    avatar: 'c_fill,w_200,h_200,g_face,q_auto,f_auto',
    
    // Course thumbnails (16:9 ratio)
    courseThumbnail: 'c_fill,w_640,h_360,q_auto,f_auto',
    
    // Lesson cover images
    lessonCover: 'c_fill,w_1200,h_630,q_auto,f_auto',
    
    // Article featured images
    articleImage: 'c_fill,w_1200,h_800,q_auto,f_auto',
    
    // Gallery images (responsive)
    gallery: 'c_scale,w_auto:100:800,q_auto,f_auto',
    
    // Full size optimized
    fullSize: 'q_auto,f_auto',
  };
  
  export function getOptimizedImageUrl(
    publicId: string,
    transform: keyof typeof cloudinaryTransforms = 'fullSize'
  ): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return `https://res.cloudinary.com/${cloudName}/image/upload/${cloudinaryTransforms[transform]}/${publicId}`;
  }
  
  export function getVideoThumbnail(publicId: string): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return `https://res.cloudinary.com/${cloudName}/video/upload/so_0,c_fill,w_640,h_360/${publicId}.jpg`;
  }