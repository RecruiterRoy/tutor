Write-Host "Adding video_url column to videos table..." -ForegroundColor Green

try {
    $body = @{ 
        action = "fix_video_url"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "Video URL Fix Results:" -ForegroundColor Green
        Write-Host "Column Added: $($response.columnAdded)" -ForegroundColor Cyan
        Write-Host "Videos Updated: $($response.videosUpdated)" -ForegroundColor Cyan
        Write-Host "Message: $($response.message)" -ForegroundColor Yellow
    } else {
        Write-Host "Failed to fix video URLs: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error fixing video URLs: $($_.Exception.Message)" -ForegroundColor Red
}
