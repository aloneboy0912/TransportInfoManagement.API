# PowerShell script to mark migrations as applied
# Usage: .\mark-migrations.ps1

$connectionString = "Server=localhost;Database=TransportInfoDB;User=root;Password=12345678;Port=3306;"

# Extract connection details
$server = "localhost"
$database = "TransportInfoDB"
$user = "root"
$password = "12345678"
$port = "3306"

Write-Host "Marking migrations as applied..." -ForegroundColor Yellow

# SQL commands
$sql = @"
USE TransportInfoDB;

INSERT INTO \`__EFMigrationsHistory\` (\`MigrationId\`, \`ProductVersion\`)
VALUES ('20251126135133_AddContactsTableOnly', '8.0.0')
ON DUPLICATE KEY UPDATE \`ProductVersion\` = '8.0.0';

INSERT INTO \`__EFMigrationsHistory\` (\`MigrationId\`, \`ProductVersion\`)
VALUES ('20251128141554_AddCallLogsTable', '8.0.0')
ON DUPLICATE KEY UPDATE \`ProductVersion\` = '8.0.0';

SELECT * FROM \`__EFMigrationsHistory\` ORDER BY \`MigrationId\`;
"@

# Try to use MySQL command line if available
$mysqlPath = "mysql"
try {
    # Escape password for command line
    $escapedPassword = $password -replace "'", "''"
    
    # Execute via MySQL command line
    $sql | & $mysqlPath -h $server -P $port -u $user -p"$escapedPassword" $database
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migrations marked as applied successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now verify with: dotnet ef migrations list" -ForegroundColor Cyan
    } else {
        Write-Host "Error executing MySQL command. Trying alternative method..." -ForegroundColor Yellow
        throw
    }
} catch {
    Write-Host "MySQL command line not found. Please run the SQL manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $sql -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or use MySQL Workbench to execute the SQL in MarkMigrationsAsApplied.sql" -ForegroundColor Yellow
}

