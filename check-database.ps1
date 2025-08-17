# Simple Database Check Script
Write-Host "🔍 Checking database status..." -ForegroundColor Cyan

$BaseUrl = "http://localhost:3000/api"

try {
    $body = @{
        action = "get_stats"
    } | ConvertTo-Json
    
    Write-Host "📡 Calling API..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        $stats = $response.data
        Write-Host "✅ Database Statistics:" -ForegroundColor Green
        Write-Host "   Total Videos: $($stats.stats.total)" -ForegroundColor White
        Write-Host "   Validated: $($stats.stats.validated)" -ForegroundColor Green
        Write-Host "   Pending: $($stats.stats.pending)" -ForegroundColor Yellow
        Write-Host "   Validation Rate: $($stats.stats.validationRate)%" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to get stats: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure your server is running on http://localhost:3000" -ForegroundColor Yellow
}

Write-Host "✨ Check completed!" -ForegroundColor Green
