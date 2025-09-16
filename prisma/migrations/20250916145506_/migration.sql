/*
  Warnings:

  - You are about to drop the `PhraseTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PhraseTag" DROP CONSTRAINT "PhraseTag_phraseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PhraseTag" DROP CONSTRAINT "PhraseTag_tagId_fkey";

-- AlterTable
ALTER TABLE "public"."Phrase" ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."PhraseTag";

-- DropTable
DROP TABLE "public"."Tag";
