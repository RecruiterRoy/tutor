Write-Host "Restarting server for language learning focus..." -ForegroundColor Green

# Stop the current server (if running)
Write-Host "Stopping current server..." -ForegroundColor Yellow
try {
    $process = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($process) {
        $process | Stop-Process -Force
        Write-Host "Server stopped" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Host "No server running or already stopped" -ForegroundColor Yellow
}

# Start the server in background
Write-Host "Starting server..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test if server is running and start batch processing
Write-Host "Testing server and starting language learning batch..." -ForegroundColor Yellow
try {
    $body = @{ action = "get_combinations" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    
    if ($response.success) {
        Write-Host "Server is running! Total combinations: $($response.data.total)" -ForegroundColor Green
        
        # Start batch processing
        Write-Host "Starting language learning batch processing..." -ForegroundColor Green
        $body = @{ action = "start_all_batches" } | ConvertTo-Json
        $batchResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
        
        if ($batchResponse.success) {
            Write-Host "Language learning batch processing started!" -ForegroundColor Green
            Write-Host "Total subjects to process: $($batchResponse.totalCombinations)" -ForegroundColor Cyan
            Write-Host "Focus: English & Hindi (70 videos each) + Math (50 videos)" -ForegroundColor Yellow
            Write-Host "Including: Nursery rhymes, poems, animated stories" -ForegroundColor Yellow
            Write-Host "Target: Language learning for KG/Nursery level" -ForegroundColor Yellow
            Write-Host "Check progress with: .\check.ps1" -ForegroundColor White
        } else {
            Write-Host "Failed to start batch: $($batchResponse.error)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Server not ready yet. Please wait a moment and try again." -ForegroundColor Red
    Write-Host "You can manually start the server with: npm run dev" -ForegroundColor Yellow
    Write-Host "Then run: .\start-junior-section.ps1" -ForegroundColor Yellow
}
