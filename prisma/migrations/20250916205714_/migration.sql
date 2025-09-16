/*
  Warnings:

  - Added the required column `audio` to the `Phrase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Phrase" ADD COLUMN     "audio" BYTEA NOT NULL;
