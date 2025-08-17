Write-Host "Resetting progress and starting flexible batch processing..." -ForegroundColor Green

# First, get current progress to see what we're resetting
$body = @{ action = "get_progress" } | ConvertTo-Json
$currentProgress = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"

if ($currentProgress.success) {
    Write-Host "Current progress: $($currentProgress.data.completed)/$($currentProgress.data.total) completed" -ForegroundColor Yellow
}

# Start fresh batch processing
$body = @{ action = "start_all_batches" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"

if ($response.success) {
    Write-Host "Flexible batch processing started!" -ForegroundColor Green
    Write-Host "Total subjects to process: $($response.totalCombinations)" -ForegroundColor Cyan
    Write-Host "Now searching by topic only (no class restrictions)" -ForegroundColor Yellow
    Write-Host "Using all 60 channels for maximum coverage" -ForegroundColor Yellow
    Write-Host "Processing in background..." -ForegroundColor Yellow
    Write-Host "Check progress with: .\check.ps1" -ForegroundColor White
} else {
    Write-Host "Failed to start: $($response.error)" -ForegroundColor Red
}
