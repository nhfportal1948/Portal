import { Router } from 'express';
import {
  getApprovedSchools,
  createStudentProfile,
  getMyProfile,
  updateNonCriticalFields,
  resubmitApplication,
} from '../controllers/student.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: GET /schools?status=APPROVED
router.get('/schools', getApprovedSchools);

// Protected: Student self-registration & dashboard routes
router.post('/students', authenticateJWT, requireRole('STUDENT'), createStudentProfile);
router.get('/students/me', authenticateJWT, requireRole('STUDENT'), getMyProfile);
router.patch('/students/me', authenticateJWT, requireRole('STUDENT'), updateNonCriticalFields);
router.put('/students/me/resubmit', authenticateJWT, requireRole('STUDENT'), resubmitApplication);

export default router;
