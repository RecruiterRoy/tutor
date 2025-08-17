Write-Host "Testing server..." -ForegroundColor Green

try {
    $body = @{ action = "get_combinations" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    
    if ($response.success) {
        Write-Host "Server is working!" -ForegroundColor Green
        Write-Host "Total combinations: $($response.data.total)" -ForegroundColor Cyan
        
        if ($response.data.total -eq 5) {
            Write-Host "✅ Progress fixed! Now showing 5 subjects instead of 20" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Still showing $($response.data.total) combinations (should be 5)" -ForegroundColor Yellow
        }
        
        Write-Host "`nStarting batch processing..." -ForegroundColor Yellow
        $body = @{ action = "start_all_batches" } | ConvertTo-Json
        $batchResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
        
        if ($batchResponse.success) {
            Write-Host "✅ Batch processing started!" -ForegroundColor Green
            Write-Host "Total subjects to process: $($batchResponse.totalCombinations)" -ForegroundColor Cyan
            Write-Host "Check progress with: .\check.ps1" -ForegroundColor White
        } else {
            Write-Host "❌ Failed to start batch: $($batchResponse.error)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Server not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the server is running with: npm run dev" -ForegroundColor Yellow
}
