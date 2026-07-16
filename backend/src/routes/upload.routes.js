import { Router } from 'express';
import { getUploadSignature } from '../controllers/upload.controller.js';

const router = Router();

// Expose signature route publicly so that new PRINCIPAL and STUDENT sign-ups
// can upload their photos and documents to Cloudinary before calling registration endpoints.
router.post('/signature', getUploadSignature);

export default router;
