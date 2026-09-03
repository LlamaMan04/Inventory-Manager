-- DropForeignKey
ALTER TABLE `Stock` DROP FOREIGN KEY `Stock_itemId_fkey`;

-- DropIndex
DROP INDEX `Stock_itemId_key` ON `Stock`;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
