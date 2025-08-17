Write-Host "🔍 Checking database statistics..." -ForegroundColor Cyan

$body = @{ action = "get_stats" } | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        $stats = $response.data
        Write-Host "✅ Database Statistics:" -ForegroundColor Green
        Write-Host "   Total Videos: $($stats.stats.total)" -ForegroundColor White
        Write-Host "   Validated: $($stats.stats.validated)" -ForegroundColor Green
        Write-Host "   Pending: $($stats.stats.pending)" -ForegroundColor Yellow
        Write-Host "   Validation Rate: $($stats.stats.validationRate)%" -ForegroundColor Cyan
        
        Write-Host "`n📋 Subject Breakdown:" -ForegroundColor Cyan
        $subjects = @("english", "hindi", "mathematics", "science", "social_studies")
        foreach ($subject in $subjects) {
            $count = $stats.breakdown.$subject.total
            Write-Host "   $($subject.ToUpper()): $count videos" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ Check completed!" -ForegroundColor Green
