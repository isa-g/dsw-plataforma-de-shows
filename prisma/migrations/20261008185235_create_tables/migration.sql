-- CreateTable
CREATE TABLE `artista` (
    `id_art` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_artista` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_art`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `local` (
    `id_local` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_local` VARCHAR(50) NOT NULL,
    `cidade` VARCHAR(50) NOT NULL,
    `capacidade` INTEGER NULL,

    PRIMARY KEY (`id_local`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `show` (
    `id_show` INTEGER NOT NULL AUTO_INCREMENT,
    `data_hora` DATETIME(3) NOT NULL,
    `setores` VARCHAR(100) NULL,
    `id_art` INTEGER NOT NULL,
    `id_local` INTEGER NOT NULL,

    PRIMARY KEY (`id_show`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id_usu` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `nome_unico` VARCHAR(50) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `senha_hash` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `usuario_nome_unico_key`(`nome_unico`),
    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id_usu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ingresso` (
    `id_ingresso` INTEGER NOT NULL AUTO_INCREMENT,
    `id_show` INTEGER NOT NULL,
    `id_usu` INTEGER NOT NULL,

    PRIMARY KEY (`id_ingresso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `show` ADD CONSTRAINT `show_id_art_fkey` FOREIGN KEY (`id_art`) REFERENCES `artista`(`id_art`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `show` ADD CONSTRAINT `show_id_local_fkey` FOREIGN KEY (`id_local`) REFERENCES `local`(`id_local`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingresso` ADD CONSTRAINT `ingresso_id_show_fkey` FOREIGN KEY (`id_show`) REFERENCES `show`(`id_show`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingresso` ADD CONSTRAINT `ingresso_id_usu_fkey` FOREIGN KEY (`id_usu`) REFERENCES `usuario`(`id_usu`) ON DELETE RESTRICT ON UPDATE CASCADE;
