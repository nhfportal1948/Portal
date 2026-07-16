const BASE_URL = 'http://localhost:5000';

async function testSchoolRegistration() {
  console.log('--- Testing School Registration ---');
  const payload = {
    email: `schooltest_${Date.now()}@test.com`,
    password: 'Password123!',
    schoolName: 'Govt Model High School',
    ownershipType: 'GOVERNMENT',
    province: 'Punjab',
    district: 'Lahore',
    tehsil: 'Lahore City',
    completeAddress: '123 Mall Road, Lahore',
    officialEmail: `official_${Date.now()}@school.com`,
    officialPhone: '042-12345678',
    principalName: 'Ali Khan',
    principalCNIC: '35202-1234567-1',
    principalMobile: '0300-1234567',
    emisCode: `EMIS${Date.now()}`,
    schoolRegistrationNumber: null,
    affiliatedEducationBoard: 'BISE Lahore'
  };

  try {
    const res = await fetch(`${BASE_URL}/auth/register-principal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('School Reg Status:', res.status);
    console.log('School Reg Response:', data);
  } catch (err) {
    console.error('School Reg Error:', err);
  }
}

async function testAthleteRegistration() {
  console.log('\n--- Testing Athlete Registration (Frontend Flow) ---');
  const email = `athletetest_${Date.now()}@test.com`;
  const password = 'Password123!';

  // Step 0: Account Credentials
  console.log('1. Step 0: Account Credentials...');
  const step0Res = await fetch(`${BASE_URL}/auth/register-student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const step0Data = await step0Res.json();
  console.log('Step 0 Status:', step0Res.status);
  console.log('Step 0 Response:', step0Data);

  if (!step0Res.ok) return;

  const token = step0Data.token;

  // Step 6: Final Submit (Exactly as frontend RegisterStudent.jsx sends it when consentFormDocUrl is empty)
  console.log('2. Step 6: Final Profile Submit (without consentFormDocUrl - as allowed by frontend Step 5)...');
  const payloadWithoutConsent = {
    fullName: 'Ahmed Raza',
    guardianName: 'Tariq Raza',
    bFormNumber: '35202-9999999-1',
    dateOfBirth: '2012-05-15',
    gender: 'Male',
    phoneNumber: '0300-9999999',
    province: 'Punjab',
    district: 'Lahore',
    tehsil: 'Lahore City',
    completeAddress: '45 Gulberg, Lahore',
    primarySport: 'Hockey',
    preferredPosition: 'Forward',
    bFormDocUrl: 'https://cloudinary.com/test_bform.jpg',
    consentFormDocUrl: undefined // omitted
  };

  const submitRes1 = await fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payloadWithoutConsent)
  });
  const submitData1 = await submitRes1.json();
  console.log('Submit (Without Consent) Status:', submitRes1.status);
  console.log('Submit (Without Consent) Response:', submitData1);

  // Now test with consentFormDocUrl present
  console.log('\n3. Step 6: Final Profile Submit (with consentFormDocUrl)...');
  const payloadWithConsent = {
    ...payloadWithoutConsent,
    consentFormDocUrl: 'https://cloudinary.com/test_consent.jpg'
  };

  const submitRes2 = await fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payloadWithConsent)
  });
  const submitData2 = await submitRes2.json();
  console.log('Submit (With Consent) Status:', submitRes2.status);
  console.log('Submit (With Consent) Response:', submitData2);
}

async function run() {
  await testSchoolRegistration();
  await testAthleteRegistration();
}

run();
