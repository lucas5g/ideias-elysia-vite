-- CreateTable
CREATE TABLE "public"."Phrase" (
    "id" SERIAL NOT NULL,
    "portuguese" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phrase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Phrase_portuguese_key" ON "public"."Phrase"("portuguese");
