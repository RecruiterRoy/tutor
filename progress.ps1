Write-Host "📊 Checking progress..." -ForegroundColor Cyan

$body = @{ action = "get_progress" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"

if ($response.success) {
    $progress = $response.data
    Write-Host "📈 Progress:" -ForegroundColor Green
    Write-Host "   Total: $($progress.total)" -ForegroundColor White
    Write-Host "   Completed: $($progress.completed)" -ForegroundColor Green
    Write-Host "   Failed: $($progress.failed)" -ForegroundColor Red
    Write-Host "   Remaining: $($progress.total - $progress.completed)" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed: $($response.error)" -ForegroundColor Red
}
