/*
  Warnings:

  - A unique constraint covering the columns `[itemId,locationId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Stock_itemId_locationId_key` ON `Stock`(`itemId`, `locationId`);
