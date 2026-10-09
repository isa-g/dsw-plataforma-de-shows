/*
  Warnings:

  - A unique constraint covering the columns `[id_local,data_hora]` on the table `show` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `show` MODIFY `setores` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `show_id_local_data_hora_key` ON `show`(`id_local`, `data_hora`);
