-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_schoolId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "allergies",
DROP COLUMN "bloodGroup",
DROP COLUMN "class",
DROP COLUMN "emergencyContact",
DROP COLUMN "existingInjuries",
DROP COLUMN "height",
DROP COLUMN "section",
DROP COLUMN "weight",
ADD COLUMN     "phoneNumber" TEXT NOT NULL DEFAULT '0300-0000000',
ALTER COLUMN "photoUrl" DROP NOT NULL,
ALTER COLUMN "cityVillage" DROP NOT NULL,
ALTER COLUMN "postalCode" DROP NOT NULL,
ALTER COLUMN "schoolId" DROP NOT NULL,
ALTER COLUMN "rollNumber" DROP NOT NULL,
ALTER COLUMN "dominantHandFoot" DROP NOT NULL,
ALTER COLUMN "consentFormDocUrl" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
