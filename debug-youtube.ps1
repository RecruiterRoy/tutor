Write-Host "Debugging YouTube API issues..." -ForegroundColor Green

try {
    # Test 1: Check if API key is working with a simple search
    $body = @{ 
        action = "debug_youtube"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "YouTube API Debug Results:" -ForegroundColor Green
        Write-Host "API Key Valid: $($response.apiKeyValid)" -ForegroundColor Cyan
        Write-Host "Channels Tested: $($response.channelsTested)" -ForegroundColor Cyan
        Write-Host "Total Videos Found: $($response.totalVideos)" -ForegroundColor Cyan
        Write-Host "Sample Channel Results:" -ForegroundColor Yellow
        if ($response.channelResults) {
            $response.channelResults | ForEach-Object {
                Write-Host "  $($_.channel): $($_.videoCount) videos" -ForegroundColor White
            }
        }
    } else {
        Write-Host "Debug Failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error debugging API: $($_.Exception.Message)" -ForegroundColor Red
}
