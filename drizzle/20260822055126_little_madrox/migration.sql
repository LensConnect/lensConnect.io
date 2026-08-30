CREATE TABLE `job_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`photographerId` int NOT NULL,
	`message` varchar(255) NOT NULL,
	`bidAmount` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`status` enum('pending','accepted','rejected') NOT NULL,
	`isRead` boolean DEFAULT false,
	CONSTRAINT `job_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobpost` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(1000) NOT NULL,
	`location` varchar(255) NOT NULL,
	`category` varchar(255) NOT NULL,
	`date` date NOT NULL,
	`duration_hours` int NOT NULL,
	`status` enum('open','filled','completed','cancelled') NOT NULL,
	`totalPrice` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobpost_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photographer_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumber` varchar(20),
	`bio` varchar(400),
	`fullname` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('client','photographer') NOT NULL,
	`location` varchar(255),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`experience` int NOT NULL,
	`hourlyRate` int NOT NULL,
	`specialties` json DEFAULT ('[]'),
	`availability` boolean NOT NULL,
	`portfolio_image_url` json DEFAULT ('[]'),
	CONSTRAINT `photographer_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photographer_id` int NOT NULL,
	`title` varchar(255),
	`description` varchar(255),
	`image_url` varchar(255),
	CONSTRAINT `portfolio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumber` varchar(20),
	`imageUrl` varchar(500),
	`bio` varchar(400),
	`website` varchar(255),
	`location` varchar(255),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullname` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('client','photographer') NOT NULL,
	`password_hash` varchar(255),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `photographer_profiles` ADD CONSTRAINT `photographer_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;