# Check Batch Progress
Write-Host "📊 Getting batch processing progress..." -ForegroundColor Cyan

try {
    $body = @{ action = "get_progress" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        $progress = $response.data
        Write-Host "📈 Progress Report:" -ForegroundColor Green
        Write-Host "   Total: $($progress.total)" -ForegroundColor White
        Write-Host "   Completed: $($progress.completed)" -ForegroundColor Green
        Write-Host "   Failed: $($progress.failed)" -ForegroundColor Red
        Write-Host "   Remaining: $($progress.total - $progress.completed)" -ForegroundColor Yellow
        
        if ($progress.results.Count -gt 0) {
            Write-Host "`n📋 Recent Results:" -ForegroundColor Cyan
            $progress.results | Select-Object -Last 5 | ForEach-Object {
                $status = if ($_.success) { "✅" } else { "❌" }
                Write-Host "   $status $($_.subject) class $($_.classLevel): $($_.message)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "❌ Failed to get progress: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error getting progress: $($_.Exception.Message)" -ForegroundColor Red
}
