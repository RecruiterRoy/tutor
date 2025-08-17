Write-Host "Testing API..." -ForegroundColor Green

$body = @{ action = "get_stats" } | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Success: $($response.success)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
