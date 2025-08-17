Write-Host "Adding video_url column to videos table..." -ForegroundColor Green

try {
    $body = @{ 
        action = "add_video_url_column"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "Column Addition Results:" -ForegroundColor Green
        Write-Host "Column Added: $($response.columnAdded)" -ForegroundColor Cyan
        Write-Host "Message: $($response.message)" -ForegroundColor Yellow
    } else {
        Write-Host "Failed to add column: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error adding column: $($_.Exception.Message)" -ForegroundColor Red
}
