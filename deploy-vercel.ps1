# Vercel Deployment Script for tution.app
# This script helps deploy the application to Vercel with proper configuration

Write-Host "🚀 Starting Vercel Deployment for tution.app" -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if .vercel directory exists (indicating previous deployment)
if (Test-Path ".vercel") {
    Write-Host "📁 Found existing Vercel configuration" -ForegroundColor Yellow
    $redeploy = Read-Host "Do you want to redeploy to the same project? (y/n)"
    if ($redeploy -eq "y") {
        Write-Host "🔄 Redeploying to existing project..." -ForegroundColor Yellow
        vercel --prod
    } else {
        Write-Host "🆕 Creating new deployment..." -ForegroundColor Yellow
        Remove-Item ".vercel" -Recurse -Force -ErrorAction SilentlyContinue
        vercel
    }
} else {
    Write-Host "🆕 Creating new Vercel deployment..." -ForegroundColor Yellow
    vercel
}

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your sites should be available at:" -ForegroundColor Cyan
Write-Host "   - https://tution.app" -ForegroundColor White
Write-Host "   - https://tutor-omega-seven.vercel.app" -ForegroundColor White

Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Check your Vercel dashboard for deployment status" -ForegroundColor White
Write-Host "2. Verify both domains are working correctly" -ForegroundColor White
Write-Host "3. Test the APK download functionality" -ForegroundColor White
Write-Host "4. Check that all API endpoints are working" -ForegroundColor White 