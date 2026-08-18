ALTER TABLE `users` ADD `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `role` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `fullname`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `lastname`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `age`;
update