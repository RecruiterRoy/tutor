# Debug Index Source - Find which file is being served
Write-Host "🔍 Debugging Index Page Source" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Step 1: Check what content is being served:" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 10
    $content = $response.Content
    
    Write-Host "✅ Server responded successfully" -ForegroundColor Green
    Write-Host "📄 Content length: $($content.Length) characters" -ForegroundColor White
    
    # Check for key content indicators
    if ($content -match "Complete School Management") {
        Write-Host "✅ Found 'Complete School Management' - NEW CONTENT" -ForegroundColor Green
    } else {
        Write-Host "❌ 'Complete School Management' NOT found" -ForegroundColor Red
    }
    
    if ($content -match "Your Personal AI Teacher") {
        Write-Host "❌ Found 'Your Personal AI Teacher' - OLD CONTENT" -ForegroundColor Red
    } else {
        Write-Host "✅ 'Your Personal AI Teacher' NOT found - GOOD" -ForegroundColor Green
    }
    
    if ($content -match "tution\.com") {
        Write-Host "❌ Found 'tution.com' - OLD CONTENT" -ForegroundColor Red
    } else {
        Write-Host "✅ 'tution.com' NOT found - GOOD" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "📄 First 300 characters of content:" -ForegroundColor Yellow
    Write-Host $content.Substring(0, [Math]::Min(300, $content.Length)) -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Failed to get content: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Step 2: Check all index.html files in project:" -ForegroundColor Yellow

$indexFiles = Get-ChildItem -Recurse -Filter "index.html" | Select-Object FullName, Length, LastWriteTime
Write-Host "Found $($indexFiles.Count) index.html files:" -ForegroundColor White

foreach ($file in $indexFiles) {
    Write-Host "  📁 $($file.FullName)" -ForegroundColor Cyan
    Write-Host "     Size: $($file.Length) bytes, Modified: $($file.LastWriteTime)" -ForegroundColor Gray
    
    # Check content of each file
    try {
        $fileContent = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($fileContent -match "Complete School Management") {
            Write-Host "     ✅ Contains NEW content" -ForegroundColor Green
        } elseif ($fileContent -match "Your Personal AI Teacher") {
            Write-Host "     ❌ Contains OLD content" -ForegroundColor Red
        } else {
            Write-Host "     ⚠️  Unknown content" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "     ❌ Could not read file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Step 3: Check server configuration:" -ForegroundColor Yellow

# Check if there are any other servers running
Write-Host "Checking for other Node.js processes:" -ForegroundColor White
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        Write-Host "  Process ID: $($proc.Id), Start Time: $($proc.StartTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "  No Node.js processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. If you see OLD content being served, check the file paths above" -ForegroundColor White
Write-Host "2. If you see NEW content but browser shows OLD, it's a browser cache issue" -ForegroundColor White
Write-Host "3. Try visiting http://localhost:3000/index.html?v=1 to bypass cache" -ForegroundColor White
