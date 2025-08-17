# Setup Script for Batch Video System
# Installs dependencies and starts the server

Write-Host "🚀 Setting up Batch Video System..." -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta

# Step 1: Install dependencies
Write-Host "`n📦 Step 1: Installing dependencies..." -ForegroundColor Cyan
try {
    npm install
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error installing dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Check environment variables
Write-Host "`n🔧 Step 2: Checking environment variables..." -ForegroundColor Cyan
$requiredVars = @("YOUTUBE_DATA_API_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY")
$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not (Get-ChildItem Env: | Where-Object { $_.Name -eq $var })) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  Missing environment variables:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Yellow
    }
    Write-Host "`n📝 Please set these in your .env file:" -ForegroundColor Cyan
    Write-Host "   YOUTUBE_DATA_API_KEY=your_youtube_api_key" -ForegroundColor White
    Write-Host "   SUPABASE_URL=your_supabase_url" -ForegroundColor White
    Write-Host "   SUPABASE_ANON_KEY=your_supabase_anon_key" -ForegroundColor White
} else {
    Write-Host "✅ All required environment variables are set!" -ForegroundColor Green
}

# Step 3: Start the server
Write-Host "`n🌐 Step 3: Starting the server..." -ForegroundColor Cyan
Write-Host "Starting server on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

try {
    npm run dev
} catch {
    Write-Host "❌ Error starting server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running manually: npm run dev" -ForegroundColor Yellow
}
