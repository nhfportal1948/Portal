import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generates a Cloudinary signature for client-side uploads.
 * @param {Object} params - Additional parameters to sign (e.g. folder, public_id).
 * @returns {Object} { signature, timestamp, apiKey, cloudName }
 */
export function generateUploadSignature(params = {}) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Merge parameters
  const paramsToSign = {
    timestamp,
    ...params,
  };
  
  // Generate signature using Cloudinary SDK utility
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );
  
  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

/**
 * Uploads a file directly from server using backend credentials (automatically signed).
 * @param {string} fileContent - Local path, base64 string, or file stream/buffer.
 * @param {Object} options - Custom upload options (e.g. folder).
 */
export async function uploadToCloudinary(fileContent, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(fileContent, {
      ...options,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

export default cloudinary;
