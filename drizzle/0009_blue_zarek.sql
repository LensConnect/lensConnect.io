CREATE TABLE `photographer_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumber` varchar(20),
	`bio` varchar(400),
	`location` varchar(255),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`experience` int NOT NULL,
	`hourlyRate` int NOT NULL,
	`specialties` json DEFAULT ('[]'),
	`availability` boolean NOT NULL,
	`portfolioImages` json DEFAULT ('[]'),
	CONSTRAINT `photographer_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `photographer_profiles` ADD CONSTRAINT `photographer_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;