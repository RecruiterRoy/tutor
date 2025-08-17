# Simple Batch Test Script
Write-Host "🧪 Simple Batch Test" -ForegroundColor Magenta

# Test 1: Get combinations
Write-Host "`n📋 Test 1: Getting combinations..." -ForegroundColor Cyan
try {
    $body = @{ action = "get_combinations" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Combinations test passed! Total: $($response.data.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Combinations test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get stats
Write-Host "`n📊 Test 2: Getting database stats..." -ForegroundColor Cyan
try {
    $body = @{ action = "get_stats" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Stats test passed! Total videos: $($response.data.stats.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Stats test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ All tests completed!" -ForegroundColor Green
