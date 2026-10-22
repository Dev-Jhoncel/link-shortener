-- DropIndex
DROP INDEX `links_shortCode_idx` ON `links`;

-- DropIndex
DROP INDEX `links_shortCode_key` ON `links`;

-- AlterTable
ALTER TABLE `links` ADD COLUMN `scope` VARCHAR(191) NOT NULL DEFAULT 'public';

-- Backfill: owned links are scoped by their user (NULLs are not unique in MySQL)
UPDATE `links` SET `scope` = `userId` WHERE `userId` IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `links_shortCode_scope_key` ON `links`(`shortCode`, `scope`);

