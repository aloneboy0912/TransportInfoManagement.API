-- Script to mark migrations as applied without running them
-- Run this using: mysql -u root -p TransportInfoDB < MarkMigrationsAsApplied.sql

USE TransportInfoDB;

-- Mark AddContactsTableOnly migration as applied
INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251126135133_AddContactsTableOnly', '8.0.0')
ON DUPLICATE KEY UPDATE `ProductVersion` = '8.0.0';

-- Mark AddCallLogsTable migration as applied
INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251128141554_AddCallLogsTable', '8.0.0')
ON DUPLICATE KEY UPDATE `ProductVersion` = '8.0.0';

-- Verify the migrations are marked
SELECT * FROM `__EFMigrationsHistory` ORDER BY `MigrationId`;
