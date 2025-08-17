Write-Host "Starting batch processing for Junior Section (Class 1-4)..." -ForegroundColor Green

# Start fresh batch processing
$body = @{ action = "start_all_batches" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"

if ($response.success) {
    Write-Host "Junior Section batch processing started!" -ForegroundColor Green
    Write-Host "Total subjects to process: $($response.totalCombinations)" -ForegroundColor Cyan
    Write-Host "Focusing on: English, Hindi, Mathematics" -ForegroundColor Yellow
    Write-Host "Target audience: KG/Nursery level (Class 1)" -ForegroundColor Yellow
    Write-Host "Using 10 verified kids educational channels" -ForegroundColor Yellow
    Write-Host "Processing in background..." -ForegroundColor Yellow
    Write-Host "Check progress with: .\check.ps1" -ForegroundColor White
} else {
    Write-Host "Failed to start: $($response.error)" -ForegroundColor Red
}
