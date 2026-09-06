CREATE TABLE `anomalies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anomalyId` varchar(32) NOT NULL,
	`service` varchar(128) NOT NULL,
	`account` varchar(128) NOT NULL,
	`occurredAt` varchar(64) NOT NULL,
	`value` int NOT NULL,
	`delta` varchar(16) NOT NULL,
	`severity` enum('Critical','High','Medium','Low') NOT NULL,
	`score` int NOT NULL,
	`summary` text NOT NULL,
	`status` enum('open','acknowledged','resolved') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anomalies_id` PRIMARY KEY(`id`),
	CONSTRAINT `anomalies_anomalyId_unique` UNIQUE(`anomalyId`)
);
--> statement-breakpoint
CREATE TABLE `cost_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day` varchar(32) NOT NULL,
	`total` int NOT NULL,
	`bedrock` int NOT NULL,
	`ecs` int NOT NULL,
	`cloudwatch` int NOT NULL,
	`other` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cost_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `cost_snapshots_day_unique` UNIQUE(`day`)
);
--> statement-breakpoint
CREATE TABLE `evidence_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anomalyId` varchar(32) NOT NULL,
	`eventTime` varchar(32) NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`actor` varchar(128) NOT NULL,
	`accent` varchar(16) NOT NULL,
	CONSTRAINT `evidence_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anomalyId` varchar(32) NOT NULL,
	`verdict` enum('correct','wrong') NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investigations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anomalyId` varchar(32) NOT NULL,
	`confidence` int NOT NULL,
	`rootCause` text NOT NULL,
	`classification` varchar(64) NOT NULL,
	`owner` varchar(128) NOT NULL,
	`blastRadius` int NOT NULL,
	`evidence` text NOT NULL,
	`recommendations` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investigations_id` PRIMARY KEY(`id`),
	CONSTRAINT `investigations_anomalyId_unique` UNIQUE(`anomalyId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
