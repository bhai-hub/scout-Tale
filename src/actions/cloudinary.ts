
'use server';

import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configure Cloudinary explicitly with individual environment variables
// These should be set in your .env.local file and in your deployment environment
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY; // Public key is fine here
const apiSecret = process.env.CLOUDINARY_API_SECRET; // Secret key - MUST NOT be prefixed with NEXT_PUBLIC_

// Check if essential configuration is present
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else {
  // Log a warning during server startup if configuration is incomplete.
  // The function below will also check and return an error per-request.
  console.warn(
    'Cloudinary configuration is incomplete. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables. Image uploads may fail.'
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

  // Perform a runtime check to ensure Cloudinary is configured before attempting an upload.
  // This is crucial because the initial config check happens at build/startup,
  // but env vars might change or be missing in some environments.
  if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) {
    console.error('Cloudinary is not configured. Make sure all environment variables are set.');
    return { 
      success: false, 
      error: 'Cloudinary configuration is missing on the server. Image uploads are disabled.' 
    };
  }

  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result: UploadApiResponse | UploadApiErrorResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' }, // You can add more options like folder, tags, etc.
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            // This case should ideally not happen if Cloudinary's SDK behaves as expected.
            reject(new Error('Cloudinary upload failed with no result and no error.'));
          }
        }
      );
      uploadStream.end(buffer);
    });
    
    // Check if the result is a successful upload response
    if ('secure_url' in result) {
      return { success: true, imageUrl: result.secure_url };
    } else {
      // Handle potential error response structure from Cloudinary
      // This casting is to help TypeScript understand it's an error response
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
