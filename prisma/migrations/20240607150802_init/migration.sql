-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `refreshToken` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OTP` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EducationContent` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `content` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pemasukan` (
    `idTransaksiPemasukan` VARCHAR(191) NOT NULL,
    `idUser` VARCHAR(191) NOT NULL,
    `jumlah` DOUBLE NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `sumber` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idTransaksiPemasukan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pengeluaran` (
    `idTransaksiPengeluaran` VARCHAR(191) NOT NULL,
    `idUser` VARCHAR(191) NOT NULL,
    `jumlah` DOUBLE NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `sumber` VARCHAR(191) NOT NULL,
    `lampiran` VARCHAR(191) NULL,

    PRIMARY KEY (`idTransaksiPengeluaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Laporan` (
    `idLaporan` VARCHAR(191) NOT NULL,
    `idUser` VARCHAR(191) NOT NULL,
    `idTransaksiPengeluaran` VARCHAR(191) NULL,
    `idTransaksiPemasukan` VARCHAR(191) NULL,
    `keterangan` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Laporan_idTransaksiPengeluaran_key`(`idTransaksiPengeluaran`),
    UNIQUE INDEX `Laporan_idTransaksiPemasukan_key`(`idTransaksiPemasukan`),
    PRIMARY KEY (`idLaporan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OTP` ADD CONSTRAINT `OTP_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pemasukan` ADD CONSTRAINT `Pemasukan_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengeluaran` ADD CONSTRAINT `Pengeluaran_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Laporan` ADD CONSTRAINT `Laporan_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Laporan` ADD CONSTRAINT `Laporan_idTransaksiPemasukan_fkey` FOREIGN KEY (`idTransaksiPemasukan`) REFERENCES `Pemasukan`(`idTransaksiPemasukan`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Laporan` ADD CONSTRAINT `Laporan_idTransaksiPengeluaran_fkey` FOREIGN KEY (`idTransaksiPengeluaran`) REFERENCES `Pengeluaran`(`idTransaksiPengeluaran`) ON DELETE SET NULL ON UPDATE CASCADE;
