-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GOVERNMENT_ADMIN', 'PRINCIPAL', 'STUDENT');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('GOVERNMENT', 'PRIVATE');

-- CreateEnum
CREATE TYPE "SchoolStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "linkedSchoolId" TEXT,
    "linkedStudentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "ownershipType" "OwnershipType" NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "tehsil" TEXT NOT NULL,
    "completeAddress" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "officialPhone" TEXT NOT NULL,
    "principalName" TEXT NOT NULL,
    "principalCNIC" TEXT NOT NULL,
    "principalMobile" TEXT NOT NULL,
    "emisCode" TEXT NOT NULL,
    "schoolRegistrationNumber" TEXT,
    "affiliatedEducationBoard" TEXT NOT NULL,
    "status" "SchoolStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "bFormNumber" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "tehsil" TEXT NOT NULL,
    "cityVillage" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "completeAddress" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "primarySport" TEXT NOT NULL,
    "secondarySport" TEXT,
    "preferredPosition" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "dominantHandFoot" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "allergies" TEXT,
    "existingInjuries" TEXT,
    "emergencyContact" TEXT NOT NULL,
    "bFormDocUrl" TEXT NOT NULL,
    "consentFormDocUrl" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "rejectionReason" TEXT,
    "athleteId" TEXT,
    "athleteIdIssuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_linkedSchoolId_key" ON "User"("linkedSchoolId");

-- CreateIndex
CREATE UNIQUE INDEX "User_linkedStudentId_key" ON "User"("linkedStudentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkedSchoolId_fkey" FOREIGN KEY ("linkedSchoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkedStudentId_fkey" FOREIGN KEY ("linkedStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
