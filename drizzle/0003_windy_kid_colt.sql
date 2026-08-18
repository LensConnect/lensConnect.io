CREATE TABLE `jobpost` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(1000) NOT NULL,
	`location` varchar(255) NOT NULL,
	`category` varchar(255) NOT NULL,
	`date` date NOT NULL,
	`duration` int NOT NULL,
	`status` enum('open','filled','completed','cancelled') NOT NULL,
	`totalPrice` int NOT NULL,
	`notes` varchar(1000),
	CONSTRAINT `jobpost_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('client','photographer') NOT NULL;
