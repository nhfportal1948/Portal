import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Register a Principal and their School.
 * POST /auth/register-principal
 */
export async function registerPrincipal(req, res) {
  try {
    const {
      // User credentials
      email,
      password,
      // School details
      schoolName,
      ownershipType,
      province,
      district,
      tehsil,
      completeAddress,
      officialEmail,
      officialPhone,
      principalName,
      principalCNIC,
      principalMobile,
      emisCode,
      schoolRegistrationNumber,
      affiliatedEducationBoard,
    } = req.body;

    // Validate required fields
    if (!email || !password || !schoolName || !ownershipType || !province || !district || !tehsil || 
        !completeAddress || !principalName || !principalCNIC || !principalMobile || !emisCode) {
      return res.status(400).json({ error: 'All mandatory fields are required.' });
    }

    // Validate ownershipType
    if (ownershipType !== 'GOVERNMENT' && ownershipType !== 'PRIVATE') {
      return res.status(400).json({ error: 'ownershipType must be either GOVERNMENT or PRIVATE.' });
    }

    // Server-side Email Formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid user email address format.' });
    }
    if (officialEmail && !emailRegex.test(officialEmail)) {
      return res.status(400).json({ error: 'Invalid official school email address format.' });
    }

    // Server-side Password Strength Check (Min 8 chars, at least 1 letter and 1 number)
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain both letters and numbers.' });
    }

    // Server-side CNIC Format Validation (XXXXX-XXXXXXX-X)
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(principalCNIC)) {
      return res.status(400).json({ error: 'Principal CNIC must be in the format: XXXXX-XXXXXXX-X' });
    }


    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Perform transaction: Create School first, then User linked to School
    const result = await prisma.$transaction(async (tx) => {
      const newSchool = await tx.school.create({
        data: {
          schoolName,
          ownershipType,
          province,
          district,
          tehsil,
          completeAddress,
          officialEmail: officialEmail || null,
          officialPhone: officialPhone || null,
          principalName,
          principalCNIC,
          principalMobile,
          emisCode,
          schoolRegistrationNumber: schoolRegistrationNumber || null,
          affiliatedEducationBoard: affiliatedEducationBoard || null,
          status: 'PENDING',
        },
      });

      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'PRINCIPAL',
          linkedSchoolId: newSchool.id,
        },
      });

      return { school: newSchool, user: newUser };
    });

    // Remove password hash from response
    delete result.user.passwordHash;

    return res.status(201).json({
      message: 'Principal and school registration submitted successfully. Awaiting admin approval.',
      data: result,
    });
  } catch (error) {
    console.error('Error registering principal:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Register a Student athlete.
 * POST /auth/register-student
 */
export async function registerStudent(req, res) {
  try {
    const {
      email,
      phone,
      password,
      fullName,
      guardianName,
      bFormNumber,
      dateOfBirth,
      gender,
      photoUrl,
      province,
      district,
      tehsil,
      cityVillage,
      postalCode,
      completeAddress,
      schoolId,
      rollNumber,
      class: schoolClass,
      section,
      primarySport,
      secondarySport,
      preferredPosition,
      height,
      weight,
      dominantHandFoot,
      bloodGroup,
      allergies,
      existingInjuries,
      emergencyContact,
      bFormDocUrl,
      consentFormDocUrl,
    } = req.body;

    // Step 0: Account Credentials ONLY (New Multi-step flow)
    if (!fullName) {
      if (!password || (!email && !phone)) {
        return res.status(400).json({ error: 'Either email or phone number along with password is required.' });
      }
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: 'Invalid email address format.' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ error: 'A user with this email already exists.' });
        }
      }
      if (phone) {
        const existingUser = await prisma.user.findUnique({ where: { phone } });
        if (existingUser) {
          return res.status(400).json({ error: 'A user with this phone number already exists.' });
        }
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = await prisma.user.create({
        data: {
          email: email || null,
          phone: phone || null,
          passwordHash,
          role: 'STUDENT',
        },
      });
      const token = generateToken(newUser);
      delete newUser.passwordHash;
      return res.status(201).json({
        message: 'Student account created successfully. Please complete the registration wizard.',
        token,
        user: newUser,
      });
    }

    // Validate required fields for full legacy registration
    if (!fullName || !guardianName || !bFormNumber || !dateOfBirth || 
        !gender || !province || !district || !tehsil || 
        !completeAddress || !primarySport || !bFormDocUrl) {
      return res.status(400).json({ error: 'Mandatory fields are required.' });
    }

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'A user with this email already exists.' });
      }
    }
    if (phone) {
      const existingUser = await prisma.user.findUnique({ where: { phone } });
      if (existingUser) {
        return res.status(400).json({ error: 'A user with this phone number already exists.' });
      }
    }

    // Verify school exists and is approved if schoolId provided
    if (schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
      });
      if (!school || school.status !== 'APPROVED') {
        return res.status(400).json({ error: 'Cannot register. The selected school has not been approved by government admin yet.' });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Perform transaction: Create Student first, then User linked to Student
    const result = await prisma.$transaction(async (tx) => {
      const newStudent = await tx.student.create({
        data: {
          fullName,
          guardianName,
          bFormNumber,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          phoneNumber: req.body.phoneNumber || '0300-0000000',
          photoUrl: photoUrl || null,
          province,
          district,
          tehsil,
          cityVillage: cityVillage || null,
          postalCode: postalCode || null,
          completeAddress,
          schoolId: schoolId || null,
          rollNumber: rollNumber || null,
          primarySport,
          secondarySport: secondarySport || null,
          preferredPosition: preferredPosition || null,
          dominantHandFoot: dominantHandFoot || null,
          bFormDocUrl,
          consentFormDocUrl: consentFormDocUrl || null,
          status: 'PENDING_REVIEW',
        },
      });

      const newUser = await tx.user.create({
        data: {
          email: email || null,
          phone: phone || null,
          passwordHash,
          role: 'STUDENT',
          linkedStudentId: newStudent.id,
        },
      });

      return { student: newStudent, user: newUser };
    });

    // Remove password hash from response
    delete result.user.passwordHash;

    return res.status(201).json({
      message: 'Student registration submitted successfully. Profile is pending review.',
      data: result,
    });
  } catch (error) {
    console.error('Error registering student:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * User Login (all roles).
 * POST /auth/login
 */
export async function login(req, res) {
  try {
    const { email, phone, identifier, password } = req.body;
    const loginId = email || phone || identifier;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email or phone number and password are required.' });
    }

    // Find user by email OR phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { phone: loginId },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Guard Principal logins if their school is pending or rejected
    if (user.role === 'PRINCIPAL' && user.linkedSchoolId) {
      const school = await prisma.school.findUnique({
        where: { id: user.linkedSchoolId },
      });

      if (!school) {
        return res.status(400).json({ error: 'Associated school records could not be found.' });
      }

      if (school.status === 'PENDING') {
        return res.status(403).json({ error: 'Your school is still pending verification.' });
      }

      if (school.status === 'REJECTED') {
        return res.status(403).json({ 
          error: `Your school registration has been rejected. Reason: ${school.rejectionReason || 'No reason provided.'}` 
        });
      }
    }

    // Generate JWT
    const token = generateToken(user);


    // Remove password hash from user response payload
    delete user.passwordHash;

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Get User Profile (including linked School or Student records)
 * GET /auth/profile
 */
export async function getProfile(req, res) {
  try {
    const { id, role, linkedSchoolId, linkedStudentId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let profileData = null;

    if (role === 'PRINCIPAL' && linkedSchoolId) {
      profileData = await prisma.school.findUnique({
        where: { id: linkedSchoolId },
      });
    } else if (role === 'STUDENT' && linkedStudentId) {
      profileData = await prisma.student.findUnique({
        where: { id: linkedStudentId },
        include: {
          school: {
            select: {
              schoolName: true,
              status: true,
            },
          },
        },
      });
    }

    return res.status(200).json({
      user,
      profile: profileData,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

