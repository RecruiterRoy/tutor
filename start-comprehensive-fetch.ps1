Write-Host "🚀 Starting Comprehensive Video Fetching for 1000+ Videos..." -ForegroundColor Green
Write-Host "📚 Subjects: English, Hindi, Mathematics, Science, Social Studies, Environmental Science, Geography, History, Civics" -ForegroundColor Cyan
Write-Host "📺 Channels: 20 Indian Educational Channels (English + Hindi Medium)" -ForegroundColor Cyan
Write-Host "🎯 Target: 1,060 videos total" -ForegroundColor Yellow

try {
    $body = @{ 
        action = "start_all_batches"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Comprehensive batch processing started!" -ForegroundColor Green
        Write-Host "📋 Total subjects to process: $($response.totalCombinations)" -ForegroundColor Cyan
        Write-Host "🎯 Target videos: $($response.totalTargetVideos)" -ForegroundColor Yellow
        Write-Host "📺 Using 20 verified Indian educational channels" -ForegroundColor Yellow
        Write-Host "🌐 Both English and Hindi medium content" -ForegroundColor Yellow
        Write-Host "⏳ Processing in background..." -ForegroundColor Yellow
        Write-Host "`n📊 Check progress with: .\check.ps1" -ForegroundColor White
        Write-Host "📈 Check database stats with: .\check-database.ps1" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to start: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error starting batch: $($_.Exception.Message)" -ForegroundColor Red
}
