Write-Host "Restarting batch processing with real channel IDs..." -ForegroundColor Green

# Start fresh batch processing
$body = @{ action = "start_all_batches" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"

if ($response.success) {
    Write-Host "Batch processing started!" -ForegroundColor Green
    Write-Host "Total subjects to process: $($response.totalCombinations)" -ForegroundColor Cyan
    Write-Host "Now using only 10 real channel IDs (no placeholders)" -ForegroundColor Yellow
    Write-Host "Processing in background..." -ForegroundColor Yellow
    Write-Host "Check progress with: .\check.ps1" -ForegroundColor White
} else {
    Write-Host "Failed to start: $($response.error)" -ForegroundColor Red
}
