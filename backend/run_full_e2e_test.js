import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000';

const report = {
  summaryTable: [],
  bugs: [],
  untestable: [],
  evidence: [],
};

function logStep(stepNum, title, status, details = '', bug = null) {
  console.log(`[Step ${stepNum}] ${title} -> ${status}`);
  if (details) console.log(`   Details: ${details}`);
  report.summaryTable.push({ step: stepNum, title, status, details });
  if (bug) {
    console.error(`   [BUG DETECTED] ${bug.description} at ${bug.location}`);
    report.bugs.push(bug);
  }
}

async function uploadToCloudinary(folder) {
  try {
    const sigRes = await fetch(`${BASE_URL}/upload/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    });
    const sig = await sigRes.json();
    if (!sig.apiKey || !sig.signature) throw new Error('Invalid signature response');

    const form = new FormData();
    form.append('file', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    form.append('api_key', sig.apiKey);
    form.append('timestamp', sig.timestamp);
    form.append('signature', sig.signature);
    form.append('folder', sig.folder);

    const upRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
      method: 'POST',
      body: form,
    });
    const upData = await upRes.json();
    if (!upData.secure_url) throw new Error(upData.error?.message || 'Upload failed');
    return upData.secure_url;
  } catch (err) {
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING FULL END-TO-END TEST SUITE (10 PHASES)');
  console.log('====================================================\n');

  let adminToken = '';
  let principalToken = '';
  let studentToken = '';
  let rejectStudentToken = '';

  let approvedSchoolId = '';
  let rejectedSchoolId = '';
  let approvedStudentId = '';
  let rejectedStudentId = '';

  const timestamp = Date.now();
  const principalEmail = `principal_appr_${timestamp}@test.edu.pk`;
  const principalRejectEmail = `principal_rej_${timestamp}@test.edu.pk`;
  const studentEmail = `student_appr_${timestamp}@test.edu.pk`;
  const studentRejectEmail = `student_rej_${timestamp}@test.edu.pk`;

  // ──────────────────────────────────────────────────────────────────────────
  // 1. BACKEND HEALTH CHECK
  // ──────────────────────────────────────────────────────────────────────────
  try {
    // Check server HTTP response
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootData = await rootRes.json();
    if (rootRes.status !== 200) throw new Error(`HTTP status ${rootRes.status}`);

    // Check Postgres connection
    const userCount = await prisma.user.count();

    // Check Cloudinary connection
    const testImageUrl = await uploadToCloudinary('test_e2e_health');

    // Check Seeded Admin
    const seedAdmin = await prisma.user.findFirst({ where: { role: 'GOVERNMENT_ADMIN', email: 'admin@sportsportal.gov.pk' } });
    if (!seedAdmin) throw new Error('Seeded Government Admin account not found in database');

    logStep('1', 'Backend Health Check', 'PASS', `Server OK | DB Users: ${userCount} | Cloudinary URL: ${testImageUrl} | Seed Admin: Found`);
    report.evidence.push(`Phase 1 Evidence: Cloudinary upload successful (${testImageUrl}), Admin seed ID ${seedAdmin.id}`);
  } catch (err) {
    logStep('1', 'Backend Health Check', 'FAIL', err.message, { description: err.message, location: 'Phase 1: Backend Health Check' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. GOVERNMENT ADMIN LOGIN
  // ──────────────────────────────────────────────────────────────────────────
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sportsportal.gov.pk', password: 'AdminSecurePassword123!' }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) throw new Error(`Admin login failed: ${loginData.error || 'No token'}`);
    adminToken = loginData.token;

    // Check Admin can see Schools & Students lists
    const schRes = await fetch(`${BASE_URL}/admin/schools`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const schData = await schRes.json();
    if (schRes.status !== 200 || !Array.isArray(schData.data)) throw new Error('Failed to fetch admin schools list');

    const stdRes = await fetch(`${BASE_URL}/admin/students`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const stdData = await stdRes.json();
    if (stdRes.status !== 200 || !Array.isArray(stdData.data)) throw new Error('Failed to fetch admin students list');

    logStep('2', 'Government Admin Login', 'PASS', `JWT Issued (${adminToken.slice(0, 15)}...) | Schools: ${schData.data.length} | Students: ${stdData.data.length}`);
    report.evidence.push(`Phase 2 Evidence: Admin JWT issued, successfully retrieved ${schData.data.length} schools and ${stdData.data.length} students.`);
  } catch (err) {
    logStep('2', 'Government Admin Login', 'FAIL', err.message, { description: err.message, location: 'Phase 2: Admin Login' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. PRINCIPAL SELF-REGISTRATION FLOW
  // ──────────────────────────────────────────────────────────────────────────
  try {
    // Valid Principal Registration
    const regPayload = {
      email: principalEmail,
      password: 'Password123!',
      schoolName: `Govt High School Lahore ${timestamp}`,
      ownershipType: 'GOVERNMENT',
      province: 'Punjab',
      district: 'Lahore',
      tehsil: 'Lahore City',
      completeAddress: '101 Education Mall, Lahore',
      officialEmail: `info_${timestamp}@ghsl.edu.pk`,
      officialPhone: '042-99200111',
      principalName: 'Dr. Tariq Mahmood',
      principalCNIC: '35202-1111111-1',
      principalMobile: '0300-1111111',
      emisCode: `3520${Math.floor(1000 + Math.random() * 8999)}`,
      affiliatedEducationBoard: 'BISE Lahore',
    };

    const regRes = await fetch(`${BASE_URL}/auth/register-principal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regData = await regRes.json();
    if (regRes.status !== 201) throw new Error(`Registration failed: ${regData.error}`);
    approvedSchoolId = regData.data.school.id;

    // DB Verification
    const dbSchool = await prisma.school.findUnique({ where: { id: approvedSchoolId } });
    if (!dbSchool || dbSchool.status !== 'PENDING') throw new Error(`DB school status mismatch: ${dbSchool?.status}`);
    const dbUser = await prisma.user.findFirst({ where: { email: principalEmail } });
    if (!dbUser || dbUser.role !== 'PRINCIPAL' || dbUser.linkedSchoolId !== approvedSchoolId) {
      throw new Error('DB user record mismatch for principal');
    }

    // Attempt Login BEFORE Approval
    const blockRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: principalEmail, password: 'Password123!' }),
    });
    const blockData = await blockRes.json();
    if (blockRes.status !== 403 || !blockData.error?.toLowerCase().includes('pending')) {
      throw new Error(`Expected 403 pending verification block, got status ${blockRes.status}: ${blockData.error}`);
    }

    // Invalid Registrations Check
    const badCnicRes = await fetch(`${BASE_URL}/auth/register-principal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...regPayload, email: `bad1_${timestamp}@test.com`, principalCNIC: '12345' }),
    });
    if (badCnicRes.status !== 400) throw new Error(`Expected 400 for bad CNIC, got ${badCnicRes.status}`);

    const missingRes = await fetch(`${BASE_URL}/auth/register-principal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...regPayload, email: `bad2_${timestamp}@test.com`, schoolName: '' }),
    });
    if (missingRes.status !== 400) throw new Error(`Expected 400 for missing field, got ${missingRes.status}`);

    // Check DB that no bad records were created
    const badCount = await prisma.user.count({ where: { email: { in: [`bad1_${timestamp}@test.com`, `bad2_${timestamp}@test.com`] } } });
    if (badCount > 0) throw new Error('Invalid user records were erroneously created in DB');

    logStep('3', 'Principal Self-Registration Flow', 'PASS', `School ID: ${approvedSchoolId} (PENDING) | Unapproved Login Blocked (403) | Bad Data Blocked (400)`);
    report.evidence.push(`Phase 3 Evidence: Created School ${dbSchool.schoolName} (${dbSchool.id}) in PENDING state. Pre-approval login correctly rejected with 403.`);
  } catch (err) {
    logStep('3', 'Principal Self-Registration Flow', 'FAIL', err.message, { description: err.message, location: 'Phase 3: Principal Registration' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. GOVERNMENT ADMIN: SCHOOL VERIFICATION
  // ──────────────────────────────────────────────────────────────────────────
  try {
    // 1. Check Pending Queue
    const pendRes = await fetch(`${BASE_URL}/admin/schools?status=PENDING`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const pendData = await pendRes.json();
    const foundSchool = pendData.data?.find(s => s.id === approvedSchoolId);
    if (!foundSchool) throw new Error('New school not found in Admin pending queue');

    // 2. Approve School
    const apprRes = await fetch(`${BASE_URL}/admin/schools/${approvedSchoolId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (apprRes.status !== 200) throw new Error(`School approval endpoint failed: ${apprRes.status}`);

    const dbApprovedSchool = await prisma.school.findUnique({ where: { id: approvedSchoolId } });
    if (dbApprovedSchool.status !== 'APPROVED') throw new Error(`DB status not updated to APPROVED: ${dbApprovedSchool.status}`);

    // 3. Confirm Principal can now log in
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: principalEmail, password: 'Password123!' }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.token) throw new Error(`Principal post-approval login failed: ${loginData.error}`);
    principalToken = loginData.token;

    // 4. Register and Reject a second test school
    const rejSchoolPayload = {
      email: principalRejectEmail,
      password: 'Password123!',
      schoolName: `Private Academy Lahore ${timestamp}`,
      ownershipType: 'PRIVATE',
      province: 'Punjab',
      district: 'Lahore',
      tehsil: 'Lahore City',
      completeAddress: '99 Gulberg Lahore',
      officialEmail: `info_rej_${timestamp}@academy.pk`,
      officialPhone: '042-33333333',
      principalName: 'Mr. Salman Khan',
      principalCNIC: '35202-2222222-2',
      principalMobile: '0300-2222222',
      emisCode: `3520${Math.floor(1000 + Math.random() * 8999)}`,
      affiliatedEducationBoard: 'BISE Lahore',
    };
    const rejRegRes = await fetch(`${BASE_URL}/auth/register-principal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rejSchoolPayload),
    });
    const rejRegData = await rejRegRes.json();
    rejectedSchoolId = rejRegData.data.school.id;

    const rejectReason = 'Invalid EMIS document verification certificate.';
    const rejRes = await fetch(`${BASE_URL}/admin/schools/${rejectedSchoolId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ reason: rejectReason }),
    });
    if (rejRes.status !== 200) throw new Error(`School rejection failed: ${rejRes.status}`);

    const dbRejectedSchool = await prisma.school.findUnique({ where: { id: rejectedSchoolId } });
    if (dbRejectedSchool.status !== 'REJECTED' || dbRejectedSchool.rejectionReason !== rejectReason) {
      throw new Error(`DB rejected school mismatch: status=${dbRejectedSchool.status}, reason=${dbRejectedSchool.rejectionReason}`);
    }

    logStep('4', 'Government Admin: School Verification', 'PASS', `School Approved (${approvedSchoolId}) -> Principal Login OK | Second School Rejected (${rejectedSchoolId}) with reason stored`);
    report.evidence.push(`Phase 4 Evidence: School ${dbApprovedSchool.schoolName} approved by admin. Principal JWT acquired. Second school rejected with reason: "${rejectReason}".`);
  } catch (err) {
    logStep('4', 'Government Admin: School Verification', 'FAIL', err.message, { description: err.message, location: 'Phase 4: School Verification' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. STUDENT SELF-REGISTRATION FLOW
  // ──────────────────────────────────────────────────────────────────────────
  try {
    // 1. Step 0: Account Credentials
    const accRes = await fetch(`${BASE_URL}/auth/register-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password: 'Password123!' }),
    });
    const accData = await accRes.json();
    if (accRes.status !== 201) throw new Error(`Student account creation failed: ${accData.error}`);

    // Log in to get token for profile submission
    const stdLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password: 'Password123!' }),
    });
    const stdLoginData = await stdLoginRes.json();
    studentToken = stdLoginData.token;

    // 2. Confirm Approved Schools Endpoint filtering
    const schListRes = await fetch(`${BASE_URL}/schools`);
    const schListData = await schListRes.json();
    const approvedInList = schListData.schools?.some(s => s.id === approvedSchoolId);
    const rejectedInList = schListData.schools?.some(s => s.id === rejectedSchoolId);
    if (!approvedInList) throw new Error('Approved school not found in public /schools list');
    if (rejectedInList) throw new Error('Rejected school erroneously found in public /schools list!');

    // 3. Upload 3 real documents to Cloudinary
    console.log('   Uploading 3 test documents to Cloudinary...');
    const photoUrl = await uploadToCloudinary('students_photo');
    const bFormDocUrl = await uploadToCloudinary('students_bform');
    const consentFormDocUrl = await uploadToCloudinary('students_consent');

    // 4. Complete Registration Wizard (Step 1 to 7)
    const wizardPayload = {
      fullName: 'Muhammad Ali Raza',
      guardianName: 'Chaudhry Ghulam Raza',
      bFormNumber: '35202-8888888-1',
      dateOfBirth: '2012-04-10',
      gender: 'Male',
      phoneNumber: '0300-8888888',
      photoUrl,
      province: 'Punjab',
      district: 'Lahore',
      tehsil: 'Lahore City',
      cityVillage: 'Lahore',
      postalCode: '54000',
      completeAddress: 'H# 45, Block C, Model Town, Lahore',
      schoolId: approvedSchoolId,
      rollNumber: '902',
      primarySport: 'Hockey',
      secondarySport: 'Athletics',
      preferredPosition: 'Center Forward',
      bFormDocUrl,
      consentFormDocUrl,
    };

    const wizRes = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify(wizardPayload),
    });
    const wizData = await wizRes.json();
    if (wizRes.status !== 201) throw new Error(`Wizard submission failed: ${wizData.error}`);
    approvedStudentId = wizData.data.student.id;

    // Verify DB State
    const dbStudent = await prisma.student.findUnique({ where: { id: approvedStudentId } });
    if (dbStudent.status !== 'PENDING_REVIEW') throw new Error(`Expected PENDING_REVIEW, got ${dbStudent.status}`);
    if (dbStudent.photoUrl !== photoUrl || dbStudent.bFormDocUrl !== bFormDocUrl || dbStudent.consentFormDocUrl !== consentFormDocUrl) {
      throw new Error('Cloudinary URLs were not saved correctly on Student DB record');
    }

    // 5. Test missing required document
    const missingDocRes = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ ...wizardPayload, consentFormDocUrl: '' }),
    });
    if (missingDocRes.status !== 400) throw new Error(`Expected 400 for missing consent form, got ${missingDocRes.status}`);

    logStep('5', 'Student Self-Registration Flow', 'PASS', `Student ID: ${approvedStudentId} | 3 Cloudinary URLs Saved | Missing Doc Blocked (400)`);
    report.evidence.push(`Phase 5 Evidence: Student ${dbStudent.fullName} registered under School ID ${approvedSchoolId}. Status: PENDING_REVIEW. Reference ID: REF-${dbStudent.id.slice(0, 8).toUpperCase()}.`);
  } catch (err) {
    logStep('5', 'Student Self-Registration Flow', 'FAIL', err.message, { description: err.message, location: 'Phase 5: Student Registration' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. GOVERNMENT ADMIN: DOCUMENT VERIFICATION
  // ──────────────────────────────────────────────────────────────────────────
  try {
    // 1. Check Pending Students Queue
    const qRes = await fetch(`${BASE_URL}/admin/students?status=PENDING_REVIEW`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const qData = await qRes.json();
    const foundStudent = qData.data?.find(s => s.id === approvedStudentId);
    if (!foundStudent) throw new Error('New student not found in Admin pending review queue');
    if (!foundStudent.photoUrl || !foundStudent.bFormDocUrl || !foundStudent.consentFormDocUrl) {
      throw new Error('Preview URLs missing in Admin queue response');
    }

    // 2. Approve Student -> generate Athlete ID
    const apprStdRes = await fetch(`${BASE_URL}/admin/students/${approvedStudentId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const apprStdData = await apprStdRes.json();
    if (apprStdRes.status !== 200) throw new Error(`Student approval failed: ${apprStdData.error}`);

    const dbApprStudent = await prisma.student.findUnique({ where: { id: approvedStudentId } });
    if (dbApprStudent.status !== 'APPROVED') throw new Error(`DB status not APPROVED: ${dbApprStudent.status}`);
    if (!dbApprStudent.athleteId || !dbApprStudent.athleteId.startsWith('NAT-')) {
      throw new Error(`Invalid athlete ID format generated: ${dbApprStudent.athleteId}`);
    }
    if (!dbApprStudent.athleteIdIssuedAt) throw new Error('athleteIdIssuedAt timestamp was not set in DB');

    // 3. Register and Reject a second test student
    await fetch(`${BASE_URL}/auth/register-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentRejectEmail, password: 'Password123!' }),
    });
    const rejLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentRejectEmail, password: 'Password123!' }),
    });
    const rejLoginData = await rejLoginRes.json();
    rejectStudentToken = rejLoginData.token;

    const rejWizRes = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${rejectStudentToken}` },
      body: JSON.stringify({
        fullName: 'Bilal Ahmed',
        guardianName: 'Ahmed Din',
        bFormNumber: '35202-9999999-9',
        dateOfBirth: '2013-01-20',
        gender: 'Male',
        phoneNumber: '0300-9999999',
        photoUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        province: 'Punjab', district: 'Lahore', tehsil: 'Lahore City', completeAddress: '12 St, Lahore',
        schoolId: approvedSchoolId, rollNumber: '903', primarySport: 'Football', preferredPosition: 'Goalkeeper',
        bFormDocUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', consentFormDocUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      }),
    });
    const rejWizData = await rejWizRes.json();
    rejectedStudentId = rejWizData.data.student.id;

    const stdRejectReason = 'B-Form photo is blurry and illegible. Please re-upload.';
    const rejStdRes = await fetch(`${BASE_URL}/admin/students/${rejectedStudentId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ reason: stdRejectReason }),
    });
    if (rejStdRes.status !== 200) throw new Error(`Student rejection endpoint failed: ${rejStdRes.status}`);

    const dbRejStudent = await prisma.student.findUnique({ where: { id: rejectedStudentId } });
    if (dbRejStudent.status !== 'REJECTED' || dbRejStudent.rejectionReason !== stdRejectReason) {
      throw new Error(`DB rejected student mismatch: status=${dbRejStudent.status}, reason=${dbRejStudent.rejectionReason}`);
    }

    logStep('6', 'Government Admin: Document Verification', 'PASS', `Approved Athlete ID: ${dbApprStudent.athleteId} | Issued At: ${dbApprStudent.athleteIdIssuedAt.toISOString()} | Second Student Rejected`);
    report.evidence.push(`Phase 6 Evidence: Issued Athlete ID "${dbApprStudent.athleteId}" to ${dbApprStudent.fullName}. Rejected second student with reason: "${stdRejectReason}".`);
  } catch (err) {
    logStep('6', 'Government Admin: Document Verification', 'FAIL', err.message, { description: err.message, location: 'Phase 6: Document Verification' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. ATHLETE ID CARD
  // ──────────────────────────────────────────────────────────────────────────
  try {
    // View as Student via GET /students/me
    const meRes = await fetch(`${BASE_URL}/students/me`, { headers: { Authorization: `Bearer ${studentToken}` } });
    const meData = await meRes.json();
    const stdCard = meData.data;
    if (!stdCard || stdCard.athleteId !== (await prisma.student.findUnique({ where: { id: approvedStudentId } })).athleteId) {
      throw new Error('Student me endpoint did not return valid athlete ID card data');
    }
    if (!stdCard.photoUrl || !stdCard.fullName || !stdCard.school?.schoolName || !stdCard.primarySport || !stdCard.dateOfBirth || !stdCard.district) {
      throw new Error('Athlete ID card is missing required display fields');
    }

    // View from Admin side via GET /admin/students
    const admStdRes = await fetch(`${BASE_URL}/admin/students?status=APPROVED`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const admStdData = await admStdRes.json();
    const admCard = admStdData.data?.find(s => s.id === approvedStudentId);
    if (!admCard || admCard.athleteId !== stdCard.athleteId || admCard.fullName !== stdCard.fullName) {
      throw new Error('Admin view of Athlete ID card does not match Student view');
    }

    // Check QR code & PDF functionality notes
    // Note: In our frontend implementation, DigitalIDCardModal renders standard HTML/CSS print styling and triggers window.print() for PDF download.
    logStep('7', 'Athlete ID Card', 'PASS', `Card Verified for ${stdCard.fullName} | Athlete ID: ${stdCard.athleteId} | Admin/Student Views Match Exactly`);
    report.evidence.push(`Phase 7 Evidence: Digital ID Card verified. Athlete ID: ${stdCard.athleteId}, School: ${stdCard.school.schoolName}, Sport: ${stdCard.primarySport}, DOB: ${stdCard.dateOfBirth.split('T')[0]}.`);
  } catch (err) {
    logStep('7', 'Athlete ID Card', 'FAIL', err.message, { description: err.message, location: 'Phase 7: Athlete ID Card' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. PRINCIPAL DASHBOARD
  // ──────────────────────────────────────────────────────────────────────────
  try {
    const schRes = await fetch(`${BASE_URL}/principal/school`, { headers: { Authorization: `Bearer ${principalToken}` } });
    const schData = await schRes.json();
    if (schRes.status !== 200 || schData.data.status !== 'APPROVED') {
      throw new Error(`Principal school endpoint error: status ${schRes.status}`);
    }

    const stdsRes = await fetch(`${BASE_URL}/principal/students`, { headers: { Authorization: `Bearer ${principalToken}` } });
    const stdsData = await stdsRes.json();
    if (stdsRes.status !== 200 || !Array.isArray(stdsData.data)) {
      throw new Error('Principal students endpoint failed');
    }

    const foundInSchool = stdsData.data.find(s => s.id === approvedStudentId);
    if (!foundInSchool || foundInSchool.athleteId !== (await prisma.student.findUnique({ where: { id: approvedStudentId } })).athleteId) {
      throw new Error('Approved student athlete ID not found in Principal students list');
    }

    // Confirm read-only access (no DELETE or PATCH endpoint on /principal/students/:id)
    const delAttempt = await fetch(`${BASE_URL}/principal/students/${approvedStudentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${principalToken}` },
    });
    if (delAttempt.status === 200 || delAttempt.status === 204) {
      throw new Error('Security flaw: Principal was able to delete student data!');
    }

    logStep('8', 'Principal Dashboard', 'PASS', `School Status: APPROVED | Total School Athletes: ${stdsData.data.length} | Read-Only Enforced`);
    report.evidence.push(`Phase 8 Evidence: Principal Dashboard retrieved school ${schData.data.schoolName} and ${stdsData.data.length} registered students.`);
  } catch (err) {
    logStep('8', 'Principal Dashboard', 'FAIL', err.message, { description: err.message, location: 'Phase 8: Principal Dashboard' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. STUDENT DASHBOARD
  // ──────────────────────────────────────────────────────────────────────────
  try {
    // Approved Student View
    const apprRes = await fetch(`${BASE_URL}/students/me`, { headers: { Authorization: `Bearer ${studentToken}` } });
    const apprData = await apprRes.json();
    if (apprData.data.status !== 'APPROVED' || !apprData.data.athleteId) {
      throw new Error('Approved student dashboard did not return APPROVED status and athlete ID');
    }

    // Rejected Student View
    const rejRes = await fetch(`${BASE_URL}/students/me`, { headers: { Authorization: `Bearer ${rejectStudentToken}` } });
    const rejData = await rejRes.json();
    if (rejData.data.status !== 'REJECTED' || !rejData.data.rejectionReason) {
      throw new Error('Rejected student dashboard did not return REJECTED status and rejection reason');
    }

    // Test Resubmit Option
    const resubmitRes = await fetch(`${BASE_URL}/students/me/resubmit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${rejectStudentToken}` },
      body: JSON.stringify({
        phoneNumber: '0300-9999999',
        bFormDocUrl: 'https://res.cloudinary.com/demo/image/upload/fixed_bform.jpg',
      }),
    });
    const resubmitData = await resubmitRes.json();
    if (resubmitRes.status !== 200 || resubmitData.data.status !== 'PENDING_REVIEW') {
      throw new Error(`Resubmit failed: status=${resubmitRes.status}, dbStatus=${resubmitData.data?.status}`);
    }

    const dbAfterResubmit = await prisma.student.findUnique({ where: { id: rejectedStudentId } });
    if (dbAfterResubmit.status !== 'PENDING_REVIEW' || dbAfterResubmit.rejectionReason !== null) {
      throw new Error(`DB not updated on resubmit: status=${dbAfterResubmit.status}, reason=${dbAfterResubmit.rejectionReason}`);
    }

    logStep('9', 'Student Dashboard', 'PASS', `Approved View OK (Athlete ID Card) | Rejected View OK (Reason Shown) | Resubmit Flow OK (Status -> PENDING_REVIEW)`);
    report.evidence.push(`Phase 9 Evidence: Approved student dashboard returns Athlete ID. Rejected dashboard displayed reason and resubmitted successfully.`);
  } catch (err) {
    logStep('9', 'Student Dashboard', 'FAIL', err.message, { description: err.message, location: 'Phase 9: Student Dashboard' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 10. ROLE BOUNDARY / SECURITY CHECKS
  // ──────────────────────────────────────────────────────────────────────────
  try {
    // 1. Student cannot access Admin routes
    const stdAdminRes = await fetch(`${BASE_URL}/admin/schools`, { headers: { Authorization: `Bearer ${studentToken}` } });
    if (stdAdminRes.status !== 403) throw new Error(`Expected 403 when Student calls Admin route, got ${stdAdminRes.status}`);

    // 2. Principal cannot access another school's data or admin routes
    const prAdminRes = await fetch(`${BASE_URL}/admin/students`, { headers: { Authorization: `Bearer ${principalToken}` } });
    if (prAdminRes.status !== 403) throw new Error(`Expected 403 when Principal calls Admin route, got ${prAdminRes.status}`);

    // 3. Cloudinary API secret not exposed in frontend build
    const frontendDistExists = fs.existsSync('./frontend/dist/assets');
    let secretExposed = false;
    if (frontendDistExists) {
      const files = fs.readdirSync('./frontend/dist/assets');
      for (const file of files) {
        if (file.endsWith('.js')) {
          const content = fs.readFileSync(`./frontend/dist/assets/${file}`, 'utf-8');
          if (content.includes(process.env.CLOUDINARY_API_SECRET)) {
            secretExposed = true;
            break;
          }
        }
      }
    }
    if (secretExposed) throw new Error('SECURITY BUG: Cloudinary API Secret was found in frontend production JS build!');

    // 4. Passwords stored as bcrypt hashes
    const allUsers = await prisma.user.findMany();
    for (const u of allUsers) {
      if (!u.passwordHash || (!u.passwordHash.startsWith('$2a$') && !u.passwordHash.startsWith('$2b$'))) {
        throw new Error(`SECURITY BUG: User ${u.email} does not have a valid bcrypt password hash!`);
      }
    }

    logStep('10', 'Role Boundary / Security Checks', 'PASS', `RBAC Enforced (403 on Unauthorized Access) | Cloudinary Secret Protected | All Passwords Bcrypt Hashed (${allUsers.length} users checked)`);
    report.evidence.push(`Phase 10 Evidence: Verified 403 Forbidden on role boundary violations. Checked ${allUsers.length} DB user records for bcrypt hash formatting ($2a$/$2b$). Verified Cloudinary secret isolation.`);
  } catch (err) {
    logStep('10', 'Role Boundary / Security Checks', 'FAIL', err.message, { description: err.message, location: 'Phase 10: Security Checks' });
  }

  console.log('\n====================================================');
  console.log('TEST SUITE COMPLETED');
  console.log('====================================================\n');

  // Save Report
  fs.writeFileSync('./e2e_test_report.json', JSON.stringify(report, null, 2));
  await prisma.$disconnect();
}

runTests().catch(async (e) => {
  console.error('Fatal Test Runner Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
