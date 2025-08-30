# Find Index Source
Write-Host "Finding which index.html file is being served..." -ForegroundColor Green

# Check what's being served
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 10
    $content = $response.Content
    
    Write-Host "Content length: $($content.Length) characters" -ForegroundColor White
    
    if ($content -match "Complete School Management") {
        Write-Host "✅ Server is serving NEW content" -ForegroundColor Green
    } elseif ($content -match "Your Personal AI Teacher") {
        Write-Host "❌ Server is serving OLD content" -ForegroundColor Red
    } else {
        Write-Host "⚠️  Unknown content being served" -ForegroundColor Yellow
    }
    
    Write-Host "First 200 chars: $($content.Substring(0, 200))" -ForegroundColor Gray
    
} catch {
    Write-Host "Failed to get content: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "All index.html files in project:" -ForegroundColor Yellow

$indexFiles = Get-ChildItem -Recurse -Filter "index.html"
foreach ($file in $indexFiles) {
    Write-Host "File: $($file.FullName)" -ForegroundColor Cyan
    Write-Host "Size: $($file.Length) bytes" -ForegroundColor Gray
    
    try {
        $fileContent = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($fileContent -match "Complete School Management") {
            Write-Host "  ✅ Contains NEW content" -ForegroundColor Green
        } elseif ($fileContent -match "Your Personal AI Teacher") {
            Write-Host "  ❌ Contains OLD content" -ForegroundColor Red
        } else {
            Write-Host "  ⚠️  Unknown content" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Could not read" -ForegroundColor Red
    }
    Write-Host ""
}
