# Quick Test Script
# Tests if the server and API are working

Write-Host "🧪 Quick System Test..." -ForegroundColor Magenta

# Test if server is running
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body '{"action":"get_combinations"}' -ContentType "application/json"
    Write-Host "✅ Server is running and API is working!" -ForegroundColor Green
    Write-Host "Total combinations: $($response.data.total)" -ForegroundColor White
} catch {
    Write-Host "❌ Server not running or API not working" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease start the server with: npm run dev" -ForegroundColor Yellow
}
