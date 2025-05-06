
'use server';

import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configure Cloudinary (ensure these environment variables are set)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Keep this secret on the server
  secure: true,
});

interface CloudinaryUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export async function uploadImageToCloudinary(formData: FormData): Promise<CloudinaryUploadResult> {
  const file = formData.get('file') as File | null;

  if (!file) {
    return { success: false, error: 'No file provided for upload.' };
  }

  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary environment variables are not set.');
    return { success: false, error: 'Cloudinary configuration is missing.' };
  }

  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result: UploadApiResponse | UploadApiErrorResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image' }, // You can add more options like folder, tags, etc.
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Cloudinary upload failed with no result and no error.'));
          }
        }
      ).end(buffer);
    });
    
    if ('secure_url' in result) {
      return { success: true, imageUrl: result.secure_url };
    } else {
      // Handle potential error response structure from Cloudinary
      const errorResponse = result as UploadApiErrorResponse;
      const errorMessage = errorResponse.message || (errorResponse.error && errorResponse.error.message) || 'Unknown Cloudinary upload error';
      console.error('Cloudinary Upload Error Response:', errorResponse);
      return { success: false, error: `Cloudinary upload failed: ${errorMessage}` };
    }

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during image upload.';
    return { success: false, error: errorMessage };
  }
}
