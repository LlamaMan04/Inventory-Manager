/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barcode` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Item` ADD COLUMN `barcode` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Item_barcode_key` ON `Item`(`barcode`);
