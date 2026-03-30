-- CreateTable
CREATE TABLE "voting_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voting_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voting_likes" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voting_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "voting_items_deletedAt_idx" ON "voting_items"("deletedAt");

-- CreateIndex
CREATE INDEX "voting_items_createdAt_idx" ON "voting_items"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "voting_likes_itemId_userId_key" ON "voting_likes"("itemId", "userId");

-- CreateIndex
CREATE INDEX "voting_likes_itemId_idx" ON "voting_likes"("itemId");

-- CreateIndex
CREATE INDEX "voting_likes_userId_idx" ON "voting_likes"("userId");

-- CreateIndex
CREATE INDEX "voting_likes_createdAt_idx" ON "voting_likes"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "voting_likes" ADD CONSTRAINT "voting_likes_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "voting_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_likes" ADD CONSTRAINT "voting_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
