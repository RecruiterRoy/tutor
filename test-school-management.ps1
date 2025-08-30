# Test School Management System
Write-Host "🧪 Testing School Management System" -ForegroundColor Green
Write-Host ""

# Check if server is running
Write-Host "1. Checking server status..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server is running on http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "❌ Server returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Server is not running. Please start with: npm start" -ForegroundColor Red
    exit 1
}

# Test API config endpoint
Write-Host "`n2. Testing API config endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/config" -Method GET -TimeoutSec 5
    $config = $response.Content | ConvertFrom-Json
    
    if ($config.supabaseUrl -and $config.supabaseAnonKey) {
        Write-Host "✅ API config endpoint working" -ForegroundColor Green
        Write-Host "   Supabase URL: $($config.supabaseUrl)" -ForegroundColor Gray
    } else {
        Write-Host "❌ API config missing credentials" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API config endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test school management API
Write-Host "`n3. Testing school management API..." -ForegroundColor Cyan
try {
    $testData = @{
        action = "get_school_dashboard_stats"
        data = @{
            school_id = "test-id"
        }
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/school-management" -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 10
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success -eq $false) {
        Write-Host "✅ School management API responding (expected error for test data)" -ForegroundColor Green
    } else {
        Write-Host "✅ School management API working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ School management API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Check database connection
Write-Host "`n4. Testing database connection..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/supabase-config" -Method GET -TimeoutSec 5
    $dbConfig = $response.Content | ConvertFrom-Json
    
    if ($dbConfig.status -eq "connected") {
        Write-Host "✅ Database connection working" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Database connection status: $($dbConfig.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Database connection test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test frontend pages
Write-Host "`n5. Testing frontend pages..." -ForegroundColor Cyan
$pages = @(
    "index.html",
    "school-register.html", 
    "teacher-register.html",
    "admin-dashboard.html",
    "teacher-dashboard.html",
    "dashboard-working.html"
)

foreach ($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/$page" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $page - OK" -ForegroundColor Green
        } else {
            Write-Host "❌ $page - Status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $page - Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Testing completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Register a new school" -ForegroundColor White
Write-Host "3. Test the admin dashboard" -ForegroundColor White
Write-Host "4. Register teachers and students" -ForegroundColor White
Write-Host "5. Test the approval workflow" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed setup instructions, see: SCHOOL_MANAGEMENT_SETUP_GUIDE.md" -ForegroundColor Yellow
