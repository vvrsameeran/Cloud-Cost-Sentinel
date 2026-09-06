CREATE TABLE `cur_line_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usageDate` varchar(32) NOT NULL,
	`service` varchar(128) NOT NULL,
	`usageType` varchar(128) NOT NULL,
	`region` varchar(64) NOT NULL,
	`linkedAccount` varchar(128) NOT NULL,
	`team` varchar(128) NOT NULL,
	`environment` varchar(32) NOT NULL,
	`deployId` varchar(64),
	`usageAmount` int NOT NULL,
	`unblendedCost` int NOT NULL,
	`lineItemType` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cur_line_items_id` PRIMARY KEY(`id`)
);
