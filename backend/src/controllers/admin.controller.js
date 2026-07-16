import prisma from '../config/db.js';

function getProvinceCode(provinceName = '') {
  const p = provinceName.toLowerCase();
  if (p.includes('punjab')) return 'PB';
  if (p.includes('sindh')) return 'SD';
  if (p.includes('khyber') || p.includes('kp') || p.includes('pakhtunkhwa')) return 'KP';
  if (p.includes('balochistan')) return 'BL';
  if (p.includes('islamabad') || p.includes('ict')) return 'IS';
  if (p.includes('gilgit') || p.includes('baltistan') || p.includes('gb')) return 'GB';
  if (p.includes('azad') || p.includes('kashmir') || p.includes('ajk')) return 'AK';
  return 'PK';
}

async function generateAthleteId(student) {
  const year = new Date().getFullYear();
  const provCode = getProvinceCode(student.province || '');
  const count = await prisma.student.count({
    where: {
      status: 'APPROVED',
      province: student.province,
    },
  });
  const sequence = String(count + 1).padStart(6, '0');
  return `NAT-${provCode}-${year}-${sequence}`;
}

/**
 * Get all schools with optional status filter.
 * GET /admin/schools
 */
export async function getSchools(req, res) {
  try {
    const { status } = req.query;
    const schools = await prisma.school.findMany({
      where: status ? { status } : {},
      include: {
        principal: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ data: schools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Approve or Reject a School.
 * PATCH /admin/schools/:id/status
 */
export async function updateSchoolStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'status must be either APPROVED or REJECTED.' });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({ error: 'rejectionReason is required when status is REJECTED.' });
    }

    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) {
      return res.status(404).json({ error: 'School not found.' });
    }

    const updatedSchool = await prisma.school.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      },
    });

    return res.status(200).json({
      message: `School has been successfully ${status.toLowerCase()}.`,
      data: updatedSchool,
    });
  } catch (error) {
    console.error('Error updating school status:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Get all students with optional status filter.
 * GET /admin/students
 */
export async function getStudents(req, res) {
  try {
    const { status } = req.query;
    const students = await prisma.student.findMany({
      where: status ? { status } : {},
      include: {
        school: {
          select: {
            schoolName: true,
            emisCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Approve or Reject a Student athlete.
 * PATCH /admin/students/:id/status
 */
export async function updateStudentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'status must be either APPROVED or REJECTED.' });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({ error: 'rejectionReason is required when status is REJECTED.' });
    }

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return res.status(404).json({ error: 'Student athlete not found.' });
    }

    let updateData = {
      status,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null,
    };

    // If approved, generate athlete ID if not already generated
    if (status === 'APPROVED' && !student.athleteId) {
      updateData.athleteId = await generateAthleteId(student);
      updateData.athleteIdIssuedAt = new Date();
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      message: `Student registration has been ${status.toLowerCase()}.`,
      data: updatedStudent,
    });
  } catch (error) {
    console.error('Error updating student status:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Approve a School — PATCH /admin/schools/:id/approve
 * Sets status = APPROVED, clears any prior rejectionReason.
 */
export async function approveSchool(req, res) {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) return res.status(404).json({ error: 'School not found.' });

    const updatedSchool = await prisma.school.update({
      where: { id },
      data: { status: 'APPROVED', rejectionReason: null },
    });

    return res.status(200).json({
      message: 'School approved. Principal can now log in.',
      data: updatedSchool,
    });
  } catch (error) {
    console.error('Error approving school:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Reject a School — PATCH /admin/schools/:id/reject
 * Requires { reason } in body. Sets status = REJECTED, stores rejectionReason.
 */
export async function rejectSchool(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A rejection reason is required.' });
    }

    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) return res.status(404).json({ error: 'School not found.' });

    const updatedSchool = await prisma.school.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason.trim() },
    });

    return res.status(200).json({
      message: 'School registration has been rejected.',
      data: updatedSchool,
    });
  } catch (error) {
    console.error('Error rejecting school:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Approve a Student — PATCH /admin/students/:id/approve
 * Sets status = APPROVED, generates an Athlete ID if not already issued.
 */
export async function approveStudent(req, res) {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ error: 'Student athlete not found.' });

    const updateData = { status: 'APPROVED', rejectionReason: null };
    if (!student.athleteId) {
      updateData.athleteId = await generateAthleteId(student);
      updateData.athleteIdIssuedAt = new Date();
    }

    const updatedStudent = await prisma.student.update({ where: { id }, data: updateData });
    return res.status(200).json({ message: 'Student approved. Athlete ID issued.', data: updatedStudent });
  } catch (error) {
    console.error('Error approving student:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Reject a Student — PATCH /admin/students/:id/reject
 * Requires { reason } in body.
 */
export async function rejectStudent(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A rejection reason is required.' });
    }
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ error: 'Student athlete not found.' });

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason.trim() },
    });
    return res.status(200).json({ message: 'Student registration has been rejected.', data: updatedStudent });
  } catch (error) {
    console.error('Error rejecting student:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
