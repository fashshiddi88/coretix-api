/*
  Warnings:

  - Changed the type of `category` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('KONSER', 'KONFERENSI', 'WORKSHOP', 'PERTANDINGAN', 'PERTUNJUKAN', 'PAMERAN');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "category",
ADD COLUMN     "category" "EventCategory" NOT NULL;
