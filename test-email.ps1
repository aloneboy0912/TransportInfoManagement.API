# PowerShell Script to Test Email Backend
# Usage: .\test-email.ps1

$apiUrl = "http://localhost:5000/api/email/send"
$testEmail = Read-Host "Enter recipient email (or press Enter to use configured sender)"

if ([string]::IsNullOrWhiteSpace($testEmail)) {
    Write-Host "Using configured sender email..." -ForegroundColor Yellow
    $body = @{
        subject = "Test Email from PowerShell - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        message = "This is a test email sent from the backend API using PowerShell script.`n`nIf you received this email, your SendGrid configuration is working correctly!`n`nTest Details:`n- Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n- Backend: http://localhost:5000`n- Method: PowerShell Script"
        name = "Test User"
        company = "Excell-On Services"
    } | ConvertTo-Json
} else {
    $body = @{
        to = $testEmail
        subject = "Test Email from PowerShell - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        message = "This is a test email sent from the backend API using PowerShell script.`n`nIf you received this email, your SendGrid configuration is working correctly!`n`nTest Details:`n- Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n- Backend: http://localhost:5000`n- Method: PowerShell Script"
        name = "Test User"
        company = "Excell-On Services"
    } | ConvertTo-Json
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Email Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API URL: $apiUrl" -ForegroundColor Gray
Write-Host "Sending test email..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    
    if ($response.success) {
        Write-Host "`n✅ Email sent successfully!" -ForegroundColor Green
        Write-Host "📧 Check inbox at: $($response.to)" -ForegroundColor Yellow
        Write-Host "📝 Subject: $($response.subject)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "`nError Message:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor White
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nResponse Body:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor White
    }
    
    Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure backend is running (dotnet run)" -ForegroundColor Gray
    Write-Host "2. Check SendGrid API key in appsettings.json" -ForegroundColor Gray
    Write-Host "3. Verify sender email in SendGrid dashboard" -ForegroundColor Gray
    Write-Host "4. Check backend console for detailed error messages" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan

