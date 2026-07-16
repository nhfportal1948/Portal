import { Router } from 'express';
import {
  getSchools, updateSchoolStatus, approveSchool, rejectSchool,
  getStudents, updateStudentStatus, approveStudent, rejectStudent,
} from '../controllers/admin.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// Secure every admin route — must be GOVERNMENT_ADMIN
router.use(authenticateJWT);
router.use(requireRole('GOVERNMENT_ADMIN'));

// ── School Management ─────────────────────────────────────────────────────────
router.get('/schools',               getSchools);
router.patch('/schools/:id/status',  updateSchoolStatus);   // generic (backwards compat)
router.patch('/schools/:id/approve', approveSchool);
router.patch('/schools/:id/reject',  rejectSchool);

// ── Student (Athlete) Management ──────────────────────────────────────────────
router.get('/students',               getStudents);
router.patch('/students/:id/status',  updateStudentStatus);  // generic (backwards compat)
router.patch('/students/:id/approve', approveStudent);
router.patch('/students/:id/reject',  rejectStudent);

export default router;
