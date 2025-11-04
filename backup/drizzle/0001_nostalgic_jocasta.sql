CREATE TABLE `birthCertificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`declarationId` int NOT NULL,
	`certificateNumber` varchar(50) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`generatedBy` int NOT NULL,
	CONSTRAINT `birthCertificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `birthCertificates_declarationId_unique` UNIQUE(`declarationId`),
	CONSTRAINT `birthCertificates_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
--> statement-breakpoint
CREATE TABLE `birthDeclarations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`childFirstName` varchar(255) NOT NULL,
	`childLastName` varchar(255) NOT NULL,
	`childGender` enum('masculin','feminin') NOT NULL,
	`birthDate` timestamp NOT NULL,
	`birthPlace` varchar(255) NOT NULL,
	`fatherFirstName` varchar(255) NOT NULL,
	`fatherLastName` varchar(255) NOT NULL,
	`fatherIdNumber` varchar(50) NOT NULL,
	`motherFirstName` varchar(255) NOT NULL,
	`motherLastName` varchar(255) NOT NULL,
	`motherIdNumber` varchar(50) NOT NULL,
	`residenceAddress` text NOT NULL,
	`status` enum('en_cours','en_attente','valide','rejete') NOT NULL DEFAULT 'en_cours',
	`rejectionReason` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`verifiedByMairieAt` timestamp,
	`verifiedByHopitalAt` timestamp,
	`validatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `birthDeclarations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`declarationId` int NOT NULL,
	`documentType` enum('certificat_accouchement','id_pere','id_mere','autre') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`mimeType` varchar(100),
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`declarationId` int,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certificateId` int NOT NULL,
	`amount` int NOT NULL,
	`paymentMethod` enum('wave','orange_money') NOT NULL,
	`paymentStatus` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(255),
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('parent','mairie','hopital','admin') NOT NULL DEFAULT 'parent';--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `otpCode` varchar(6);--> statement-breakpoint
ALTER TABLE `users` ADD `otpExpiry` timestamp;