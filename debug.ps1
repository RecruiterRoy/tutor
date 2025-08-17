Write-Host "Getting detailed error information..." -ForegroundColor Cyan

$body = @{ action = "get_progress" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"

if ($response.success) {
    $progress = $response.data
    Write-Host "Progress:" -ForegroundColor Green
    Write-Host "Total: $($progress.total)" -ForegroundColor White
    Write-Host "Completed: $($progress.completed)" -ForegroundColor Green
    Write-Host "Failed: $($progress.failed)" -ForegroundColor Red
    Write-Host "Remaining: $($progress.total - $progress.completed)" -ForegroundColor Yellow
    
    if ($progress.results.Count -gt 0) {
        Write-Host "`nRecent Results:" -ForegroundColor Cyan
        $progress.results | ForEach-Object {
            $status = if ($_.success) { "SUCCESS" } else { "FAILED" }
            Write-Host "$status - $($_.subject) class $($_.classLevel): $($_.message)" -ForegroundColor $(if ($_.success) { "Green" } else { "Red" })
        }
    }
} else {
    Write-Host "Failed: $($response.error)" -ForegroundColor Red
}
