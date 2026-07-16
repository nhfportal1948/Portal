const BASE_URL = 'http://localhost:5000';

async function verifyFlows() {
  console.log('── Starting End-to-End Verification ───────────────────────────');
  let allPassed = true;

  // 1. Verify School Registration WITHOUT optional fields
  try {
    console.log('\n[TEST 1] Registering School without optional fields (officialEmail, officialPhone, affiliatedEducationBoard)...');
    const timestamp = Date.now();
    const payloadSchool = {
      email: `principal_${timestamp}@school.edu.pk`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      schoolName: `Test Model School ${timestamp}`,
      ownershipType: 'GOVERNMENT',
      province: 'Punjab',
      district: 'Lahore',
      tehsil: 'Lahore City',
      completeAddress: '123 Education Road, Lahore',
      principalName: 'Dr. Ahmad Khan',
      principalCNIC: '35202-1234567-1',
      principalMobile: '0300-1112233',
      emisCode: `E${String(timestamp).slice(-7)}`
      // Notice: officialEmail, officialPhone, affiliatedEducationBoard omitted!
    };

    const res1 = await fetch(`${BASE_URL}/auth/register-principal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadSchool)
    });
    const data1 = await res1.json();

    if (res1.status === 201) {
      console.log('✅ TEST 1 PASSED: School registration succeeded without optional fields.');
      console.log('   Response message:', data1.message);
    } else {
      console.error('❌ TEST 1 FAILED:', res1.status, data1);
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ TEST 1 ERROR:', err.message);
    allPassed = false;
  }

  // 2. Verify Athlete Registration WITH PHONE NUMBER and WITHOUT optional fields (consentFormDocUrl, preferredPosition)
  const athletePhone = `0300-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const athletePw = 'AthletePass123!';
  try {
    console.log('\n[TEST 2] Registering Athlete with Phone Number & without optional fields (preferredPosition, consentFormDocUrl)...');
    const payloadAthlete = {
      phone: athletePhone,
      password: athletePw,
      fullName: 'Ali Raza U15',
      guardianName: 'Raza Ahmad',
      bFormNumber: '35202-7654321-1',
      dateOfBirth: '2011-05-15',
      gender: 'Male',
      phoneNumber: athletePhone,
      province: 'Punjab',
      district: 'Lahore',
      tehsil: 'Lahore City',
      completeAddress: 'Model Town, Lahore',
      primarySport: 'Football',
      dominantHandFoot: 'Right',
      bFormDocUrl: 'https://cloudinary.com/demo/bform.pdf'
      // Notice: email, preferredPosition, consentFormDocUrl omitted!
    };

    const res2 = await fetch(`${BASE_URL}/auth/register-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadAthlete)
    });
    const data2 = await res2.json();

    if (res2.status === 201) {
      console.log('✅ TEST 2 PASSED: Athlete registration succeeded with Phone Number and without optional fields.');
      console.log('   Created Athlete User ID:', data2.user?.id || data2.data?.user?.id);
    } else {
      console.error('❌ TEST 2 FAILED:', res2.status, data2);
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ TEST 2 ERROR:', err.message);
    allPassed = false;
  }

  // 3. Verify Login WITH PHONE NUMBER
  try {
    console.log('\n[TEST 3] Logging in Athlete using Phone Number...');
    const res3 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: athletePhone, password: athletePw })
    });
    const data3 = await res3.json();

    if (res3.status === 200 && data3.token) {
      console.log('✅ TEST 3 PASSED: Login with Phone Number succeeded.');
      console.log('   Logged in account role:', data3.user?.role);
    } else {
      console.error('❌ TEST 3 FAILED:', res3.status, data3);
      allPassed = false;
    }
  } catch (err) {
    console.error('❌ TEST 3 ERROR:', err.message);
    allPassed = false;
  }

  console.log('\n─────────────────────────────────────────────────────────────');
  if (allPassed) {
    console.log('🎉 ALL END-TO-END REGISTRATION & AUTH FLOWS PASSED PERFECTLY!');
  } else {
    console.log('⚠️ SOME TESTS FAILED.');
  }
}

verifyFlows();
