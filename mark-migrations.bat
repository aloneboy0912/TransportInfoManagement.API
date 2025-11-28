@echo off
REM Batch script to mark migrations as applied using MySQL command line
REM Usage: mark-migrations.bat

set SERVER=localhost
set DATABASE=TransportInfoDB
set USER=root
set PASSWORD=12345678
set PORT=3306

echo Marking migrations as applied...

mysql -h %SERVER% -P %PORT% -u %USER% -p%PASSWORD% %DATABASE% ^
  -e "INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('20251126135133_AddContactsTableOnly', '8.0.0') ON DUPLICATE KEY UPDATE ProductVersion = '8.0.0';" ^
  -e "INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('20251128141554_AddCallLogsTable', '8.0.0') ON DUPLICATE KEY UPDATE ProductVersion = '8.0.0';" ^
  -e "SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Migrations marked as applied successfully!
    echo.
    echo You can now verify with: dotnet ef migrations list
) else (
    echo.
    echo Error: Could not execute MySQL command.
    echo.
    echo Please ensure MySQL command line client is installed and in your PATH.
    echo Or manually run the SQL from MarkMigrationsAsApplied.sql file.
)

pause

