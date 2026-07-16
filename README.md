# U-15 Government Athlete Registration Portal

This project provides the full-stack web portal and secure backend foundation for registering U-15 student-athletes, managing schools, and issuing unique athlete IDs upon government administrative approval.

## Stack
- **Frontend**: React + Vite, Modern CSS
- **Backend**: Node.js + Express (ES Modules)
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Cloudinary for secure, signed file uploads
- **Authentication**: JWT Authentication with role-based access control (RBAC)

---

## Folder Structure

```text
D:\PORTAL\
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema defining User, School, and Student models
│   │   └── seed.js              # Script to seed the initial GOVERNMENT_ADMIN user
│   ├── src/
│   │   ├── config/              # Database & app configurations
│   │   ├── controllers/         # Route controller logic (auth, upload, admin)
│   │   ├── middleware/          # Role check guards & JWT auth middleware
│   │   ├── routes/              # Express route declarations
│   │   └── index.js             # Express server entry point
│   ├── run_full_e2e_test.js     # Comprehensive E2E test runner
│   ├── .env.example             # Reference backend environment variables
│   └── package.json             # Backend dependencies and scripts
├── frontend/
│   ├── src/                     # React application source code
│   ├── index.html               # Main HTML template
│   ├── vite.config.js           # Vite build & dev config
│   └── package.json             # Frontend dependencies
├── package.json                 # Root convenience scripts
└── README.md                    # Project documentation
```

---

## Setup Instructions

### 1. Root Convenience Scripts
From the root directory (`D:\PORTAL`), you can use helper commands:
```bash
# Run backend dev server
npm run dev:backend

# Run frontend dev server
npm run dev:frontend

# Run E2E verification tests
npm run test:e2e
```

### 2. Backend Setup (`cd backend`)

Navigate to the `backend` folder:
```bash
cd backend
```

Copy the template environment file:
```bash
copy .env.example .env
```
Open `backend/.env` and configure:
- **`DATABASE_URL`**: Your PostgreSQL connection string.
- **`JWT_SECRET`**: Secure secret string for JWT tokens.
- **`CLOUDINARY_CLOUD_NAME`**, **`CLOUDINARY_API_KEY`**, **`CLOUDINARY_API_SECRET`**: Your Cloudinary cloud credentials.

Run migrations and seed the database:
```bash
npm run prisma:migrate
npm run prisma:seed
```

Start the backend server (`http://localhost:5000`):
```bash
npm run dev
```

---


## API Documentation & Routes

### 1. Authentication (`/auth`)

* **`POST /auth/register-principal`** (Public)
  * Registers a new school and creates its associated Principal user.
  * *Request Body:*
    ```json
    {
      "email": "principal@school.edu",
      "password": "Password123!",
      "schoolName": "Government High School No. 1",
      "ownershipType": "GOVERNMENT",
      "province": "Punjab",
      "district": "Lahore",
      "tehsil": "Lahore Cantt",
      "completeAddress": "12-A Cantonment Road",
      "officialEmail": "ghs1@cantt.edu",
      "officialPhone": "042-35551234",
      "principalName": "Muhammad Ali",
      "principalCNIC": "35201-1234567-1",
      "principalMobile": "0300-1234567",
      "emisCode": "35120001",
      "schoolRegistrationNumber": "REG-998822",
      "affiliatedEducationBoard": "BISE Lahore"
    }
    ```
  * *Default Status:* School defaults to `PENDING`. Associated user role is `PRINCIPAL`.

* **`POST /auth/register-student`** (Public)
  * Registers a new student athlete and creates their own login credentials.
  * *Notes:* The associated school must exist and have status `APPROVED` for registration to succeed.
  * *Request Body:*
    ```json
    {
      "email": "athlete.student@gmail.com",
      "password": "StudentPassword123!",
      "fullName": "Zain Khan",
      "guardianName": "Tariq Khan",
      "bFormNumber": "35201-9876543-1",
      "dateOfBirth": "2012-05-15",
      "gender": "Male",
      "photoUrl": "https://res.cloudinary.com/demo/image/upload/photo.jpg",
      "province": "Punjab",
      "district": "Lahore",
      "tehsil": "Lahore Cantt",
      "cityVillage": "Lahore",
      "postalCode": "54000",
      "completeAddress": "House 10, St 2, Officers Colony",
      "schoolId": "<APPROVED-SCHOOL-UUID>",
      "rollNumber": "42",
      "class": "8th",
      "section": "A",
      "primarySport": "Athletics",
      "secondarySport": "Football",
      "preferredPosition": "Sprinter / Forward",
      "height": 162.5,
      "weight": 52.0,
      "dominantHandFoot": "Right",
      "bloodGroup": "O+",
      "emergencyContact": "0311-1234567",
      "bFormDocUrl": "https://res.cloudinary.com/demo/image/upload/b_form.pdf",
      "consentFormDocUrl": "https://res.cloudinary.com/demo/image/upload/consent.pdf"
    }
    ```
  * *Default Status:* Student defaults to `PENDING_REVIEW`. Associated user role is `STUDENT`.

* **`POST /auth/login`** (Public)
  * Authenticates all users (`GOVERNMENT_ADMIN`, `PRINCIPAL`, `STUDENT`) and returns a JWT.
  * *Request Body:*
    ```json
    {
      "email": "admin@sportsportal.gov.pk",
      "password": "AdminSecurePassword123!"
    }
    ```
  * *Response:* Includes JSON Web Token (`token`) and user object containing roles and relations links (`linkedSchoolId` or `linkedStudentId`).

---

### 2. Cloudinary Upload Signatures (`/upload`)

* **`POST /upload/signature`** (Public)
  * Generates signed parameters for Cloudinary direct client-side uploads. This ensures no API Secrets are exposed to frontend applications.
  * *Request Body (Optional):*
    ```json
    {
      "folder": "u15_athletes/docs",
      "publicId": "doc_bform_zain_khan"
    }
    ```
  * *Response:*
    ```json
    {
      "message": "Cloudinary signed upload signature generated successfully.",
      "signature": "3c02eb9c9f7a5ff632e821b3a3ab800072ec86a1",
      "timestamp": 1783359000,
      "apiKey": "your_cloudinary_api_key",
      "cloudName": "your_cloudinary_cloud_name",
      "folder": "u15_athletes/docs",
      "publicId": "doc_bform_zain_khan"
    }
    ```

---

### 3. Government Admin Management (`/admin`)

*All routes under `/admin` require a valid JWT header (`Authorization: Bearer <token>`) belonging to a user with role `GOVERNMENT_ADMIN`.*

* **`GET /admin/schools`** (Admin Only)
  * Fetches all registered schools. Supports filter `?status=PENDING` or `?status=APPROVED`.

* **`PATCH /admin/schools/:id/status`** (Admin Only)
  * Approve or reject a pending school registry.
  * *Request Body:*
    ```json
    {
      "status": "APPROVED" // or "REJECTED"
    }
    ```
    *(If rejecting, include `"rejectionReason": "Official school document verification failed."`)*

* **`GET /admin/students`** (Admin Only)
  * Fetches all registered students. Supports query filter `?status=PENDING_REVIEW`.

* **`PATCH /admin/students/:id/status`** (Admin Only)
  * Approve or reject a student athlete.
  * *Request Body:*
    ```json
    {
      "status": "APPROVED" // or "REJECTED"
    }
    ```
  * *Outcome of Approval:* The system automatically generates a unique `athleteId` (e.g. `PK-ATH-2026-89712`) and timestamps the approval (`athleteIdIssuedAt`).
