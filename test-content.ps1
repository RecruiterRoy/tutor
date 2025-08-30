# Test Current Content Being Served
Write-Host "Testing Current Content Being Served" -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/index.html" -TimeoutSec 10
    $content = $response.Content
    
    Write-Host "Server responded successfully" -ForegroundColor Green
    Write-Host "Content length: $($content.Length) characters" -ForegroundColor White
    
    # Check for key content indicators
    if ($content -match "Complete School Management") {
        Write-Host "Found 'Complete School Management' - NEW CONTENT" -ForegroundColor Green
    } else {
        Write-Host "'Complete School Management' NOT found" -ForegroundColor Red
    }
    
    if ($content -match "Register Your School") {
        Write-Host "Found 'Register Your School' button - NEW CONTENT" -ForegroundColor Green
    } else {
        Write-Host "'Register Your School' button NOT found" -ForegroundColor Red
    }
    
    if ($content -match "SchoolEdu") {
        Write-Host "Found 'SchoolEdu' - OLD CONTENT" -ForegroundColor Red
    } else {
        Write-Host "'SchoolEdu' NOT found - GOOD" -ForegroundColor Green
    }
    
    if ($content -match "tution\.app") {
        Write-Host "Found 'tution.app' - NEW BRANDING" -ForegroundColor Green
    } else {
        Write-Host "'tution.app' NOT found" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "First 200 characters of content:" -ForegroundColor Yellow
    Write-Host $content.Substring(0, [Math]::Min(200, $content.Length)) -ForegroundColor Gray
    
} catch {
    Write-Host "Failed to get content: $($_.Exception.Message)" -ForegroundColor Red
}
