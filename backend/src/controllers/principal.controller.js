import prisma from '../config/db.js';

/**
 * Get Principal's linked School profile.
 * GET /principal/school
 */
export async function getPrincipalSchool(req, res) {
  try {
    const { linkedSchoolId } = req.user;
    if (!linkedSchoolId) {
      return res.status(400).json({ error: 'No school linked to this principal account.' });
    }

    const school = await prisma.school.findUnique({
      where: { id: linkedSchoolId },
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found.' });
    }

    return res.status(200).json({ data: school });
  } catch (error) {
    console.error('Error fetching principal school:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Get all students registered under this Principal's school.
 * GET /principal/students
 */
export async function getPrincipalStudents(req, res) {
  try {
    const { linkedSchoolId } = req.user;
    if (!linkedSchoolId) {
      return res.status(400).json({ error: 'No school linked to this principal account.' });
    }

    const students = await prisma.student.findMany({
      where: { schoolId: linkedSchoolId },
      orderBy: { createdAt: 'desc' },
      include: {
        school: {
          select: { schoolName: true, district: true, tehsil: true },
        },
      },
    });

    return res.status(200).json({
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error('Error fetching principal students:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
