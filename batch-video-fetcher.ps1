# Batch Video Fetcher PowerShell Script
# Fetches 20 unique videos for each subject and class combination

param(
    [string]$Action = "start_all",
    [string]$Subject = "",
    [string]$ClassLevel = "",
    [int]$TargetCount = 20
)

$BaseUrl = "http://localhost:3000/api"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Start-BatchProcessing {
    Write-ColorOutput "🚀 Starting comprehensive batch video processing..." "Green"
    
    $body = @{
        action = "start_all_batches"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success) {
            Write-ColorOutput "✅ Batch processing started successfully!" "Green"
            Write-ColorOutput "📋 Total combinations to process: $($response.totalCombinations)" "Cyan"
            Write-ColorOutput "⏳ Processing in background... Check progress with: .\batch-video-fetcher.ps1 -Action get_progress" "Yellow"
        } else {
            Write-ColorOutput "❌ Failed to start batch processing: $($response.error)" "Red"
        }
    } catch {
        Write-ColorOutput "❌ Error starting batch processing: $($_.Exception.Message)" "Red"
    }
}

function Get-BatchProgress {
    Write-ColorOutput "📊 Getting batch processing progress..." "Cyan"
    
    $body = @{
        action = "get_progress"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success) {
            $progress = $response.data
            Write-ColorOutput "📈 Progress Report:" "Green"
            Write-ColorOutput "   Total: $($progress.total)" "White"
            Write-ColorOutput "   Completed: $($progress.completed)" "Green"
            Write-ColorOutput "   Failed: $($progress.failed)" "Red"
            Write-ColorOutput "   Remaining: $($progress.total - $progress.completed)" "Yellow"
            
            if ($progress.results.Count -gt 0) {
                Write-ColorOutput "`n📋 Recent Results:" "Cyan"
                $progress.results | Select-Object -Last 5 | ForEach-Object {
                    $status = if ($_.success) { "✅" } else { "❌" }
                    Write-ColorOutput "   $status $($_.subject) class $($_.classLevel): $($_.message)" "White"
                }
            }
        } else {
            Write-ColorOutput "❌ Failed to get progress: $($response.error)" "Red"
        }
    } catch {
        Write-ColorOutput "❌ Error getting progress: $($_.Exception.Message)" "Red"
    }
}

function Get-DatabaseStats {
    Write-ColorOutput "📊 Getting database statistics..." "Cyan"
    
    $body = @{
        action = "get_stats"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success) {
            $stats = $response.data
            Write-ColorOutput "📈 Database Statistics:" "Green"
            Write-ColorOutput "   Total Videos: $($stats.stats.total)" "White"
            Write-ColorOutput "   Validated: $($stats.stats.validated)" "Green"
            Write-ColorOutput "   Pending: $($stats.stats.pending)" "Yellow"
            Write-ColorOutput "   Validation Rate: $($stats.stats.validationRate)%" "Cyan"
            
            Write-ColorOutput "`n📋 Breakdown by Subject and Class:" "Cyan"
            $subjects = @("english", "hindi", "mathematics", "science", "social_studies")
            $classLevels = @("1-3", "4-6", "7-8", "9-10")
            
            foreach ($subject in $subjects) {
                Write-ColorOutput "   $($subject.ToUpper()):" "Yellow"
                foreach ($classLevel in $classLevels) {
                    $count = $stats.breakdown.$subject.$classLevel
                    $status = if ($count -ge 20) { "✅" } elseif ($count -ge 10) { "⚠️" } else { "❌" }
                    Write-ColorOutput "     Class ${classLevel}: $count videos $status" "White"
                }
            }
        } else {
            Write-ColorOutput "❌ Failed to get stats: $($response.error)" "Red"
        }
    } catch {
        Write-ColorOutput "❌ Error getting stats: $($_.Exception.Message)" "Red"
    }
}

function Process-SpecificBatch {
    param(
        [string]$Subject,
        [string]$ClassLevel,
        [int]$TargetCount
    )
    
    Write-ColorOutput "🎯 Processing specific batch: $Subject class $ClassLevel..." "Green"
    
    $body = @{
        action = "process_specific"
        subject = $Subject
        classLevel = $ClassLevel
        targetCount = $TargetCount
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success) {
            $result = $response.data.result
            Write-ColorOutput "✅ Batch completed successfully!" "Green"
            Write-ColorOutput "   Subject: $($result.subject)" "White"
            Write-ColorOutput "   Class: $($result.classLevel)" "White"
            Write-ColorOutput "   Existing: $($result.existing)" "Cyan"
            Write-ColorOutput "   Fetched: $($result.fetched)" "Yellow"
            Write-ColorOutput "   Saved: $($result.saved)" "Green"
            Write-ColorOutput "   Total: $($result.total)" "White"
            Write-ColorOutput "   Message: $($result.message)" "White"
        } else {
            Write-ColorOutput "❌ Failed to process batch: $($response.error)" "Red"
        }
    } catch {
        Write-ColorOutput "❌ Error processing batch: $($_.Exception.Message)" "Red"
    }
}

function Get-Combinations {
    Write-ColorOutput "📋 Getting all subject-class combinations..." "Cyan"
    
    $body = @{
        action = "get_combinations"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/batch-video-processor" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success) {
            Write-ColorOutput "📋 Total Combinations: $($response.data.total)" "Green"
            Write-ColorOutput "`n📝 Combinations:" "Cyan"
            $response.data.combinations | ForEach-Object {
                Write-ColorOutput "   $($_.subject) class $($_.classLevel) (target: $($_.targetCount) videos)" "White"
            }
        } else {
            Write-ColorOutput "❌ Failed to get combinations: $($response.error)" "Red"
        }
    } catch {
        Write-ColorOutput "❌ Error getting combinations: $($_.Exception.Message)" "Red"
    }
}

# Main script logic
Write-ColorOutput "🎬 Batch Video Fetcher Script" "Magenta"
Write-ColorOutput "=================================" "Magenta"

switch ($Action.ToLower()) {
    "start_all" {
        Start-BatchProcessing
    }
    "get_progress" {
        Get-BatchProgress
    }
    "get_stats" {
        Get-DatabaseStats
    }
    "process_specific" {
        if (-not $Subject -or -not $ClassLevel) {
            Write-ColorOutput "❌ Error: Subject and ClassLevel are required for process_specific action" "Red"
            Write-ColorOutput "Usage: .\batch-video-fetcher.ps1 -Action process_specific -Subject english -ClassLevel 1-3" "Yellow"
            exit 1
        }
        Process-SpecificBatch -Subject $Subject -ClassLevel $ClassLevel -TargetCount $TargetCount
    }
    "get_combinations" {
        Get-Combinations
    }
    default {
        Write-ColorOutput "❌ Invalid action: $Action" "Red"
        Write-ColorOutput "`n📖 Available Actions:" "Cyan"
        Write-ColorOutput "   start_all          - Start processing all subject-class combinations" "White"
        Write-ColorOutput "   get_progress       - Get current batch processing progress" "White"
        Write-ColorOutput "   get_stats          - Get database statistics" "White"
        Write-ColorOutput "   process_specific   - Process specific subject and class" "White"
        Write-ColorOutput "   get_combinations   - Get all subject-class combinations" "White"
        Write-ColorOutput "`n📖 Examples:" "Cyan"
        Write-ColorOutput "   .\batch-video-fetcher.ps1 -Action start_all" "White"
        Write-ColorOutput "   .\batch-video-fetcher.ps1 -Action get_progress" "White"
        Write-ColorOutput "   .\batch-video-fetcher.ps1 -Action process_specific -Subject english -ClassLevel 1-3" "White"
    }
}

Write-ColorOutput "`n✨ Script completed!" "Green"
