CREATE TABLE `portfolio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photographer_id` int NOT NULL,
	`title` varchar(255),
	`description` varchar(255),
	`image_url` varchar(255),
	CONSTRAINT `portfolio_id` PRIMARY KEY(`id`)
);
