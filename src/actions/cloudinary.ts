
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
    const result: UploadApiResponse | UploadApiErrorResponse | undefined = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' }, 
        (error, result) => {
          if (error) {
            // Reject with the error so it's caught by the outer try-catch
            reject(error);
          } else {
            // Resolve with the result (could be success or an error structure from Cloudinary)
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });
    
    // Check if the result is a successful upload response
    if (result && 'secure_url' in result && typeof result.secure_url === 'string') {
      return { success: true, imageUrl: result.secure_url };
    } else {
      // Handle potential error response structure from Cloudinary
      const errorResponse = result as UploadApiErrorResponse | undefined;
      let detailedErrorMessage = 'Unknown Cloudinary upload error';

      if (errorResponse?.error) {
        if (typeof errorResponse.error === 'string') {
            detailedErrorMessage = errorResponse.error;
        } else if (errorResponse.error.message && typeof errorResponse.error.message === 'string') {
            detailedErrorMessage = errorResponse.error.message;
        } else if (typeof errorResponse.error.message === 'object') { // Sometimes message can be an object
            detailedErrorMessage = JSON.stringify(errorResponse.error.message);
        } else {
            detailedErrorMessage = `Cloudinary error object: ${JSON.stringify(errorResponse.error)}`;
        }
      } else if (errorResponse?.message && typeof errorResponse.message === 'string') {
         detailedErrorMessage = errorResponse.message;
      } else if (result) { 
        detailedErrorMessage = `Unexpected response structure from Cloudinary.`;
      }

      // Log the full error response for better debugging on the server
      try {
        console.error('Cloudinary Upload Error Response:', JSON.stringify(errorResponse || result, null, 2));
      } catch (logError) {
        console.error('Cloudinary Upload Error Response (raw):', errorResponse || result);
        console.error('Error stringifying Cloudinary error response:', logError);
      }
      
      return { success: false, error: `Cloudinary upload failed: ${detailedErrorMessage}` };
    }

  } catch (error: unknown) { // Explicitly type error as unknown
    console.error('Original error during Cloudinary upload:', error); // Log the original error object
    let errorMessage = 'An unknown error occurred during image upload.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    } else {
      try {
        errorMessage = `Non-Error exception: ${JSON.stringify(error)}`;
      } catch (stringifyError) {
        errorMessage = 'An unserializable error occurred during image upload.';
      }
    }
    return { success: false, error: errorMessage };
  }
}

