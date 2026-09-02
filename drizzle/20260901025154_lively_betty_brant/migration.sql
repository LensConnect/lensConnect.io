CREATE TABLE `photographer_portfolios` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`photographerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(1000) NOT NULL,
	`imageUrl` json DEFAULT ('[]'),
	`category` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photographer_portfolios_ewOf87G5nImp_fkey` FOREIGN KEY (`photographerId`) REFERENCES `photographer_profiles`(`id`)
);
