ALTER TABLE `photographer_profiles` ADD `fullname` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `photographer_profiles` ADD `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `photographer_profiles` ADD `role` enum('client','photographer') NOT NULL;--> statement-breakpoint
ALTER TABLE `photographer_profiles` ADD `portfolio_image_url` json DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `photographer_profiles` DROP COLUMN `portfolioImages`;