/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;

-- Update existing records with default values
UPDATE "User" SET 
  "firstName" = 'User',
  "lastName" = CONCAT('', "id")
WHERE "firstName" IS NULL;
