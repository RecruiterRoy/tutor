Write-Host "Checking Supabase videos table..." -ForegroundColor Green

try {
    $body = @{ 
        action = "check_table"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "Supabase Table Check Results:" -ForegroundColor Green
        Write-Host "Table Exists: $($response.tableExists)" -ForegroundColor Cyan
        Write-Host "Table Name: $($response.tableName)" -ForegroundColor Cyan
        Write-Host "Row Count: $($response.rowCount)" -ForegroundColor Cyan
        if ($response.error) {
            Write-Host "Error: $($response.error)" -ForegroundColor Red
        }
    } else {
        Write-Host "Failed to check table: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error checking table: $($_.Exception.Message)" -ForegroundColor Red
}
