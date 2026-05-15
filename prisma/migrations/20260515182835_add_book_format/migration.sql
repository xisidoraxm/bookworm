-- CreateEnum
CREATE TYPE "BookFormat" AS ENUM ('PAPERBACK', 'HARDCOVER', 'EBOOK', 'AUDIOBOOK');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "format" "BookFormat" NOT NULL DEFAULT 'PAPERBACK';
