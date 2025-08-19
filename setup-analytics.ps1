# PowerShell script to help set up user analytics system

Write-Host "🚀 User Analytics Setup Helper" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you set up the user analytics system." -ForegroundColor White
Write-Host "You need to run the SQL file in your Supabase database." -ForegroundColor White
Write-Host ""

# Check if SQL file exists
if (-not (Test-Path "create_user_analytics_system.sql")) {
    Write-Host "❌ ERROR: create_user_analytics_system.sql not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the correct directory." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✅ Found SQL file: create_user_analytics_system.sql" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Setup Instructions:" -ForegroundColor Yellow
Write-Host "1. Open your Supabase dashboard" -ForegroundColor White
Write-Host "2. Go to SQL Editor" -ForegroundColor White
Write-Host "3. Copy and paste the SQL content below" -ForegroundColor White
Write-Host "4. Run the SQL commands" -ForegroundColor White
Write-Host ""

Write-Host "📄 SQL Content to copy:" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

# Read and display the SQL content
$sqlContent = Get-Content "create_user_analytics_system.sql" -Raw
Write-Host $sqlContent -ForegroundColor Cyan

Write-Host ""
Write-Host "========================" -ForegroundColor Yellow
Write-Host ""

Write-Host "🎯 After running the SQL:" -ForegroundColor Green
Write-Host "• Analytics tables will be created" -ForegroundColor White
Write-Host "• User sessions will be automatically tracked" -ForegroundColor White
Write-Host "• You can view analytics in your admin dashboard" -ForegroundColor White
Write-Host "• Go to /admin.html and click the Analytics tab" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Testing the setup:" -ForegroundColor Yellow
Write-Host "After running the SQL, you can test with this query:" -ForegroundColor White
Write-Host "SELECT * FROM get_active_users();" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 To view analytics:" -ForegroundColor Green
Write-Host "Visit: https://yourdomain.com/admin.html" -ForegroundColor White
Write-Host "Click on the 'Analytics' tab" -ForegroundColor White
Write-Host ""

# Option to copy SQL to clipboard (Windows only)
if ($IsWindows -or $env:OS -like "*Windows*") {
    $choice = Read-Host "Do you want to copy the SQL to your clipboard? (y/n)"
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        $sqlContent | Set-Clipboard
        Write-Host "✅ SQL copied to clipboard! You can now paste it in Supabase." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🚀 Once setup is complete, your analytics will be live!" -ForegroundColor Green
Write-Host "Users logging in will automatically be tracked." -ForegroundColor Green

pause
