ALTER TABLE `booking` MODIFY COLUMN `startTime` time NOT NULL;--> statement-breakpoint
ALTER TABLE `booking` ADD `startDate` date NOT NULL;--> statement-breakpoint
ALTER TABLE `booking` ADD `messages` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `booking` ADD `updataed` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;