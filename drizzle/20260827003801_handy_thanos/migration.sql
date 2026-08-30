CREATE TABLE `booking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`photographerId` int NOT NULL,
	`date` date NOT NULL,
	`durationHours` int NOT NULL,
	`location` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL,
	`totalPrice` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `booking` ADD CONSTRAINT `booking_clientId_users_id_fk` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking` ADD CONSTRAINT `booking_photographerId_photographer_profiles_id_fk` FOREIGN KEY (`photographerId`) REFERENCES `photographer_profiles`(`id`) ON DELETE cascade ON UPDATE no action;