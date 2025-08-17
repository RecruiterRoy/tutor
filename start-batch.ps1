# Start Batch Processing
Write-Host "🚀 Starting batch video processing..." -ForegroundColor Green

try {
    $body = @{ action = "start_all_batches" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Batch processing started successfully!" -ForegroundColor Green
        Write-Host "📋 Total combinations to process: $($response.totalCombinations)" -ForegroundColor Cyan
        Write-Host "⏳ Processing in background..." -ForegroundColor Yellow
        Write-Host "`n📊 Check progress with: .\check-progress.ps1" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to start batch processing: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error starting batch processing: $($_.Exception.Message)" -ForegroundColor Red
}
