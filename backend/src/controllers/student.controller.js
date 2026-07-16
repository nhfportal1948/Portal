import prisma from '../config/db.js';

/**
 * Fetch all APPROVED schools for student registration autocomplete.
 * GET /schools?status=APPROVED
 */
export async function getApprovedSchools(req, res) {
  try {
    const schools = await prisma.school.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        schoolName: true,
        district: true,
        tehsil: true,
        emisCode: true,
      },
      orderBy: { schoolName: 'asc' },
    });
    return res.status(200).json({ schools });
  } catch (error) {
    console.error('Error fetching approved schools:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Create a Student profile linked to the logged-in Student user.
 * POST /students
 */
export async function createStudentProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      fullName, guardianName, bFormNumber, dateOfBirth, gender, phoneNumber, photoUrl,
      province, district, tehsil, cityVillage, postalCode, completeAddress,
      schoolId, rollNumber,
      primarySport, secondarySport, preferredPosition, dominantHandFoot,
      bFormDocUrl, consentFormDocUrl,
    } = req.body;

    if (!fullName || !guardianName || !bFormNumber || !dateOfBirth || !gender || !phoneNumber ||
        !province || !district || !tehsil || !completeAddress ||
        !primarySport || !bFormDocUrl) {
      return res.status(400).json({ error: 'All mandatory fields must be provided.' });
    }

    // Verify school exists and is APPROVED if schoolId provided
    if (schoolId) {
      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      if (!school || school.status !== 'APPROVED') {
        return res.status(400).json({ error: 'Selected school is not valid or has not been approved by government admin.' });
      }
    }

    // Create Student record and link to user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newStudent = await tx.student.create({
        data: {
          fullName, guardianName, bFormNumber,
          dateOfBirth: new Date(dateOfBirth),
          gender, phoneNumber, photoUrl: photoUrl || null,
          province, district, tehsil,
          cityVillage: cityVillage || null, postalCode: postalCode || null, completeAddress,
          schoolId: schoolId || null, rollNumber: rollNumber || null,
          primarySport, secondarySport: secondarySport || null, preferredPosition: preferredPosition || null,
          dominantHandFoot: dominantHandFoot || null,
          bFormDocUrl, consentFormDocUrl: consentFormDocUrl || null,
          status: 'PENDING_REVIEW',
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { linkedStudentId: newStudent.id },
      });

      return { student: newStudent, user: updatedUser };
    });

    delete result.user.passwordHash;

    return res.status(201).json({
      message: 'Student registration submitted successfully. Profile is pending review.',
      data: result,
      referenceId: `REF-${result.student.id.slice(0, 8).toUpperCase()}`,
    });
  } catch (error) {
    console.error('Error creating student profile:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Get logged-in Student's own profile and school info.
 * GET /students/me
 */
export async function getMyProfile(req, res) {
  try {
    let studentId = req.user.linkedStudentId;

    // Fallback: check database user record in case JWT was issued before step 1 wizard completion
    if (!studentId) {
      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      studentId = dbUser?.linkedStudentId;
    }

    if (!studentId) {
      return res.status(404).json({ error: 'No student registration found for this account. Please complete the registration wizard.' });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        school: {
          select: { schoolName: true, district: true, tehsil: true, emisCode: true },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    return res.status(200).json({ data: student });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Update non-critical fields for an APPROVED student athlete.
 * PATCH /students/me
 */
export async function updateNonCriticalFields(req, res) {
  try {
    let studentId = req.user.linkedStudentId;
    if (!studentId) {
      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      studentId = dbUser?.linkedStudentId;
    }
    if (!studentId) return res.status(404).json({ error: 'Student profile not found.' });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    if (student.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Only approved profiles can edit non-critical fields here.' });
    }

    // Guard against core identity modification attempts
    const lockedFields = ['fullName', 'bFormNumber', 'dateOfBirth', 'gender', 'phoneNumber', 'schoolId', 'rollNumber', 'bFormDocUrl'];
    for (const field of lockedFields) {
      if (req.body[field] !== undefined && req.body[field] !== student[field]) {
        return res.status(403).json({
          error: `Core identity field "${field}" is locked after government verification and cannot be changed without Admin intervention.`,
        });
      }
    }

    // Filter allowed fields
    const allowedFields = [
      'completeAddress', 'postalCode', 'cityVillage',
      'preferredPosition', 'photoUrl', 'secondarySport', 'dominantHandFoot', 'consentFormDocUrl'
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
      include: { school: { select: { schoolName: true, district: true, tehsil: true } } },
    });

    return res.status(200).json({
      message: 'Non-critical profile details updated successfully.',
      data: updatedStudent,
    });
  } catch (error) {
    console.error('Error updating non-critical fields:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Resubmit application after rejection.
 * PUT /students/me/resubmit
 */
export async function resubmitApplication(req, res) {
  try {
    let studentId = req.user.linkedStudentId;
    if (!studentId) {
      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      studentId = dbUser?.linkedStudentId;
    }
    if (!studentId) return res.status(404).json({ error: 'Student profile not found.' });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    if (student.status !== 'REJECTED') {
      return res.status(400).json({ error: 'Only rejected applications can be resubmitted.' });
    }

    const {
      fullName, guardianName, bFormNumber, dateOfBirth, gender, phoneNumber, photoUrl,
      province, district, tehsil, cityVillage, postalCode, completeAddress,
      schoolId, rollNumber,
      primarySport, secondarySport, preferredPosition, dominantHandFoot,
      bFormDocUrl, consentFormDocUrl,
    } = req.body;

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        fullName: fullName || student.fullName,
        guardianName: guardianName || student.guardianName,
        bFormNumber: bFormNumber || student.bFormNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : student.dateOfBirth,
        gender: gender || student.gender,
        phoneNumber: phoneNumber || student.phoneNumber,
        photoUrl: photoUrl !== undefined ? photoUrl : student.photoUrl,
        province: province || student.province,
        district: district || student.district,
        tehsil: tehsil || student.tehsil,
        cityVillage: cityVillage !== undefined ? cityVillage : student.cityVillage,
        postalCode: postalCode !== undefined ? postalCode : student.postalCode,
        completeAddress: completeAddress || student.completeAddress,
        schoolId: schoolId !== undefined ? schoolId : student.schoolId,
        rollNumber: rollNumber !== undefined ? rollNumber : student.rollNumber,
        primarySport: primarySport || student.primarySport,
        secondarySport: secondarySport !== undefined ? secondarySport : student.secondarySport,
        preferredPosition: preferredPosition || student.preferredPosition,
        dominantHandFoot: dominantHandFoot !== undefined ? dominantHandFoot : student.dominantHandFoot,
        bFormDocUrl: bFormDocUrl || student.bFormDocUrl,
        consentFormDocUrl: consentFormDocUrl !== undefined ? consentFormDocUrl : student.consentFormDocUrl,
        status: 'PENDING_REVIEW',
        rejectionReason: null,
      },
      include: { school: { select: { schoolName: true, district: true, tehsil: true } } },
    });

    return res.status(200).json({
      message: 'Application resubmitted successfully. Now pending review.',
      data: updatedStudent,
      referenceId: `REF-${updatedStudent.id.slice(0, 8).toUpperCase()}`,
    });
  } catch (error) {
    console.error('Error resubmitting application:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
