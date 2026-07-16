import { generateUploadSignature } from '../utils/cloudinary.js';

/**
 * Generates a signed upload signature for frontend direct uploads to Cloudinary.
 * POST /upload/signature
 */
export async function getUploadSignature(req, res) {
  try {
    const { folder, publicId } = req.body;
    
    // Setup sign parameters. Ensure we use parameters the client will also submit.
    const params = {};
    if (folder) {
      params.folder = folder;
    }
    if (publicId) {
      params.public_id = publicId;
    }
    
    // Generate signature and fetch environment info
    const signatureData = generateUploadSignature(params);
    
    return res.status(200).json({
      message: 'Cloudinary signed upload signature generated successfully.',
      ...signatureData,
      folder: folder || null,
      publicId: publicId || null,
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return res.status(500).json({ error: 'Failed to generate signed upload signature.' });
  }
}
