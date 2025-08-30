# Test Local vs Deployed
Write-Host "Testing if localhost is serving local or deployed content..." -ForegroundColor Green

# Test localhost:3000
Write-Host ""
Write-Host "🔍 Testing localhost:3000:" -ForegroundColor Yellow
try {
    $localResponse = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 10
    $localContent = $localResponse.Content
    
    Write-Host "✅ localhost:3000 responded" -ForegroundColor Green
    Write-Host "Content length: $($localContent.Length) characters" -ForegroundColor White
    
    if ($localContent -match "Complete School Management") {
        Write-Host "✅ Contains NEW content (local)" -ForegroundColor Green
    } elseif ($localContent -match "Your Personal AI Teacher") {
        Write-Host "❌ Contains OLD content (deployed)" -ForegroundColor Red
    } else {
        Write-Host "⚠️  Unknown content" -ForegroundColor Yellow
    }
    
    # Check for server-specific headers
    Write-Host "Server headers:" -ForegroundColor White
    $localResponse.Headers | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
} catch {
    Write-Host "❌ localhost:3000 failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test deployed site (if accessible)
Write-Host ""
Write-Host "🔍 Testing deployed site (tution.app):" -ForegroundColor Yellow
try {
    $deployedResponse = Invoke-WebRequest -Uri "https://tution.app" -TimeoutSec 10
    $deployedContent = $deployedResponse.Content
    
    Write-Host "✅ tution.app responded" -ForegroundColor Green
    Write-Host "Content length: $($deployedContent.Length) characters" -ForegroundColor White
    
    if ($deployedContent -match "Complete School Management") {
        Write-Host "✅ Contains NEW content" -ForegroundColor Green
    } elseif ($deployedContent -match "Your Personal AI Teacher") {
        Write-Host "❌ Contains OLD content" -ForegroundColor Red
    } else {
        Write-Host "⚠️  Unknown content" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ tution.app failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Analysis:" -ForegroundColor Yellow
Write-Host "If both show the same content, you might be hitting the deployed site" -ForegroundColor White
Write-Host "If localhost shows different content, it's serving local files" -ForegroundColor White
Write-Host "Try visiting http://127.0.0.1:3000 instead of localhost:3000" -ForegroundColor White
