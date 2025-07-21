# PowerShell script to resolve all merge conflicts
# This script will choose the master branch version for all conflicts

Write-Host "🔧 Starting automatic conflict resolution..." -ForegroundColor Green

# Get all files with merge conflicts
$filesWithConflicts = @()
Get-ChildItem -Recurse -Include "*.html","*.json","*.yml","*.js" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match "<<<<<<< HEAD") {
        $filesWithConflicts += $_
    }
}

Write-Host "Found $($filesWithConflicts.Count) files with conflicts" -ForegroundColor Yellow

foreach ($file in $filesWithConflicts) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Cyan
    
    $content = Get-Content $file.FullName -Raw
    
    # Remove all conflict markers and keep master branch content
    $content = $content -replace '<<<<<<< HEAD[\s\S]*?=======\s*', ''
    $content = $content -replace '>>>>>>> master\s*', ''
    
    # Write the resolved content back
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "✅ Resolved conflicts in $($file.Name)" -ForegroundColor Green
}

Write-Host "🎉 All conflicts resolved!" -ForegroundColor Green
Write-Host "Files processed: $($filesWithConflicts.Count)" -ForegroundColor Yellow 