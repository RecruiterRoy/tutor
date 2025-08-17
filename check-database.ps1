Write-Host "Checking database statistics..." -ForegroundColor Green

try {
    $body = @{ 
        action = "get_stats"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "Database Statistics:" -ForegroundColor Green
        Write-Host "Total Videos: $($response.data.stats.totalVideos)" -ForegroundColor Cyan
        Write-Host "Total Subjects: $($response.data.stats.totalSubjects)" -ForegroundColor Cyan
        Write-Host "Total Classes: $($response.data.stats.totalClasses)" -ForegroundColor Cyan
        
        Write-Host "`nBreakdown by Subject:" -ForegroundColor Yellow
        if ($response.data.breakdown) {
            $response.data.breakdown | Get-Member -MemberType NoteProperty | ForEach-Object {
                $subject = $_.Name
                $subjectData = $response.data.breakdown.$subject
                Write-Host "  ${subject}:" -ForegroundColor White
                $subjectData | Get-Member -MemberType NoteProperty | ForEach-Object {
                    $class = $_.Name
                    $count = $subjectData.$class
                    Write-Host "    Class $class`: $count videos" -ForegroundColor Gray
                }
            }
        }
    } else {
        Write-Host "Failed to get stats: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error checking database: $($_.Exception.Message)" -ForegroundColor Red
}
