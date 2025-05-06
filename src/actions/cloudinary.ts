'use server';

import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configure Cloudinary explicitly with individual environment variables
// These should be set in your .env.local file and in your deployment environment
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else {
  // This console log will appear in the server logs if configuration is missing at startup.
  // It's important to check this, as the function below will also error out per-request.
  console.error(
    'CRITICAL: Cloudinary environment variables (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not fully set. Image uploads will fail.'
  );
}


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

  // Check configuration again at the time of function call
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Cloudinary environment variables are not set during an upload attempt.');
    return { 
      success: false, 
      error: 'Cloudinary configuration is missing. Please check server environment variables. Image uploads are disabled.' 
    };
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