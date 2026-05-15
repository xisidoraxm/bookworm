/*
  Warnings:

  - The values [EBOOK,AUDIOBOOK] on the enum `BookFormat` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookFormat_new" AS ENUM ('PAPERBACK', 'HARDCOVER');
ALTER TABLE "public"."Book" ALTER COLUMN "format" DROP DEFAULT;
ALTER TABLE "Book" ALTER COLUMN "format" TYPE "BookFormat_new" USING ("format"::text::"BookFormat_new");
ALTER TYPE "BookFormat" RENAME TO "BookFormat_old";
ALTER TYPE "BookFormat_new" RENAME TO "BookFormat";
DROP TYPE "public"."BookFormat_old";
ALTER TABLE "Book" ALTER COLUMN "format" SET DEFAULT 'PAPERBACK';
COMMIT;
