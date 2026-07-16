/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "School" ALTER COLUMN "officialEmail" DROP NOT NULL,
ALTER COLUMN "officialPhone" DROP NOT NULL,
ALTER COLUMN "affiliatedEducationBoard" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "preferredPosition" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
