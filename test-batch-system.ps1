# Simple Test Script for Batch Video System
# Tests the basic functionality

$BaseUrl = "http://localhost:3000/api"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "🧪 Testing Batch Video System..." "Magenta"
Write-ColorOutput "=================================" "Magenta"

# Test 1: Get combinations
Write-ColorOutput "`n📋 Test 1: Getting combinations..." "Cyan"
try {
    $body = @{ action = "get_combinations" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-ColorOutput "✅ Combinations test passed!" "Green"
        Write-ColorOutput "   Total combinations: $($response.data.total)" "White"
    } else {
        Write-ColorOutput "❌ Combinations test failed: $($response.error)" "Red"
    }
} catch {
    Write-ColorOutput "❌ Combinations test error: $($_.Exception.Message)" "Red"
}

# Test 2: Get stats
Write-ColorOutput "`n📊 Test 2: Getting database stats..." "Cyan"
try {
    $body = @{ action = "get_stats" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-ColorOutput "✅ Stats test passed!" "Green"
        Write-ColorOutput "   Total videos: $($response.data.stats.total)" "White"
    } else {
        Write-ColorOutput "❌ Stats test failed: $($response.error)" "Red"
    }
} catch {
    Write-ColorOutput "❌ Stats test error: $($_.Exception.Message)" "Red"
}

# Test 3: Get progress
Write-ColorOutput "`n📈 Test 3: Getting progress..." "Cyan"
try {
    $body = @{ action = "get_progress" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-ColorOutput "✅ Progress test passed!" "Green"
        Write-ColorOutput "   Total: $($response.data.total), Completed: $($response.data.completed)" "White"
    } else {
        Write-ColorOutput "❌ Progress test failed: $($response.error)" "Red"
    }
} catch {
    Write-ColorOutput "❌ Progress test error: $($_.Exception.Message)" "Red"
}

Write-ColorOutput "`n✨ Test completed!" "Green"
