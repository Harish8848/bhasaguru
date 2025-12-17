/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "audioUrl",
DROP COLUMN "imageUrl",
DROP COLUMN "pdfUrl",
DROP COLUMN "videoUrl";
