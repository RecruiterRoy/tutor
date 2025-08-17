# API Endpoint Test Script
# Tests the batch video processor API endpoints

Write-Host "🧪 Testing API Endpoints..." -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta

$BaseUrl = "http://localhost:3000/api"

# Test 1: Get combinations
Write-Host "`n📋 Test 1: Getting combinations..." -ForegroundColor Cyan
try {
    $body = @{ action = "get_combinations" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Combinations endpoint working!" -ForegroundColor Green
        Write-Host "Total combinations: $($response.data.total)" -ForegroundColor White
    } else {
        Write-Host "❌ Combinations endpoint failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing combinations: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get stats
Write-Host "`n📊 Test 2: Getting stats..." -ForegroundColor Cyan
try {
    $body = @{ action = "get_stats" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Stats endpoint working!" -ForegroundColor Green
        Write-Host "Total videos: $($response.data.stats.total)" -ForegroundColor White
    } else {
        Write-Host "❌ Stats endpoint failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing stats: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get progress
Write-Host "`n📈 Test 3: Getting progress..." -ForegroundColor Cyan
try {
    $body = @{ action = "get_progress" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Progress endpoint working!" -ForegroundColor Green
        Write-Host "Total: $($response.data.total), Completed: $($response.data.completed)" -ForegroundColor White
    } else {
        Write-Host "❌ Progress endpoint failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing progress: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ API tests completed!" -ForegroundColor Green
