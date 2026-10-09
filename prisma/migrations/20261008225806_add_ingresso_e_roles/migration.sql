/*
  Warnings:

  - You are about to drop the column `id_usu` on the `ingresso` table. All the data in the column will be lost.
  - Added the required column `quantidade` to the `ingresso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `ingresso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `ingresso` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ingresso` DROP FOREIGN KEY `ingresso_id_show_fkey`;

-- DropForeignKey
ALTER TABLE `ingresso` DROP FOREIGN KEY `ingresso_id_usu_fkey`;

-- AlterTable
ALTER TABLE `ingresso` DROP COLUMN `id_usu`,
    ADD COLUMN `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `quantidade` INTEGER NOT NULL,
    ADD COLUMN `tipo` ENUM('PISTA', 'VIP', 'CAMAROTE', 'CADEIRA_SUPERIOR', 'CADEIRA_INFERIOR', 'ARQUIBANCADA') NOT NULL,
    ADD COLUMN `usuarioId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `role` ENUM('ADMIN', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE';

-- AddForeignKey
ALTER TABLE `ingresso` ADD CONSTRAINT `ingresso_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id_usu`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingresso` ADD CONSTRAINT `ingresso_id_show_fkey` FOREIGN KEY (`id_show`) REFERENCES `show`(`id_show`) ON DELETE CASCADE ON UPDATE CASCADE;
