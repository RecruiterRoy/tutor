# Simple Test for Batch Video System
Write-Host "🧪 Testing Batch Video System..." -ForegroundColor Magenta

# Test 1: Get combinations
Write-Host "`n📋 Test 1: Getting combinations..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body '{"action":"get_combinations"}' -ContentType "application/json"
    Write-Host "✅ Combinations test passed! Total: $($response.data.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Combinations test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get stats
Write-Host "`n📊 Test 2: Getting database stats..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body '{"action":"get_stats"}' -ContentType "application/json"
    Write-Host "✅ Stats test passed! Total videos: $($response.data.stats.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Stats test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ All tests completed!" -ForegroundColor Green
