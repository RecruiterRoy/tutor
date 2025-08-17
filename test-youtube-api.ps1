Write-Host "Testing YouTube API directly..." -ForegroundColor Green

try {
    $body = @{ 
        action = "test_youtube_api"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "YouTube API Test Results:" -ForegroundColor Green
        Write-Host "API Key Status: $($response.apiStatus)" -ForegroundColor Cyan
        Write-Host "Test Videos Found: $($response.videoCount)" -ForegroundColor Cyan
        if ($response.sampleVideos) {
            Write-Host "Sample Videos:" -ForegroundColor Yellow
            $response.sampleVideos | ForEach-Object {
                Write-Host "  - $($_.title)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "API Test Failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error testing API: $($_.Exception.Message)" -ForegroundColor Red
}
