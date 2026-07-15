-- CreateEnum
CREATE TYPE "ContactMessageSource" AS ENUM ('CONTACT', 'PERSONALIZE');

-- AlterTable
ALTER TABLE "contact_messages" ADD COLUMN "source" "ContactMessageSource" NOT NULL DEFAULT 'CONTACT';

-- CreateIndex
CREATE INDEX "contact_messages_source_idx" ON "contact_messages"("source");
