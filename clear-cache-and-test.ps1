# Clear Browser Cache and Test New Content
Write-Host "🔧 Clearing Browser Cache and Testing New Content" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Steps to Clear Browser Cache:" -ForegroundColor Yellow
Write-Host "1. Open your browser (Chrome, Firefox, Edge, etc.)" -ForegroundColor White
Write-Host "2. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)" -ForegroundColor White
Write-Host "3. Select 'All time' for time range" -ForegroundColor White
Write-Host "4. Check all boxes (Cookies, Cache, etc.)" -ForegroundColor White
Write-Host "5. Click 'Clear data'" -ForegroundColor White
Write-Host ""

Write-Host "🔄 Alternative Methods:" -ForegroundColor Yellow
Write-Host "• Hard refresh: Ctrl+F5 (or Cmd+Shift+R on Mac)" -ForegroundColor White
Write-Host "• Incognito/Private browsing mode" -ForegroundColor White
Write-Host "• Add ?v=1 to URL: http://localhost:3000/index.html?v=1" -ForegroundColor White
Write-Host ""

Write-Host "✅ Server Status Check:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5
    Write-Host "✅ Server is running at http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running. Please start it with: npm start" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Testing New Content:" -ForegroundColor Yellow
Write-Host "After clearing cache, visit:" -ForegroundColor White
Write-Host "• http://localhost:3000/index.html" -ForegroundColor Cyan
Write-Host "• http://localhost:3000/login.html" -ForegroundColor Cyan
Write-Host "• http://localhost:3000/register.html" -ForegroundColor Cyan
Write-Host ""

Write-Host "📱 Expected New Features:" -ForegroundColor Yellow
Write-Host "• 'Complete School Management & AI Learning Platform' title" -ForegroundColor White
Write-Host "• 'Register Your School' button" -ForegroundColor White
Write-Host "• 'Teacher Registration' button" -ForegroundColor White
Write-Host "• 'Student Registration' button" -ForegroundColor White
Write-Host "• School management features section" -ForegroundColor White
Write-Host "• Pricing sections for schools and students" -ForegroundColor White
Write-Host ""

Write-Host "🎯 If you still see old content:" -ForegroundColor Yellow
Write-Host "1. Try a different browser" -ForegroundColor White
Write-Host "2. Try incognito/private mode" -ForegroundColor White
Write-Host "3. Add ?v=2 to URL: http://localhost:3000/index.html?v=2" -ForegroundColor White
Write-Host "4. Check if your browser has aggressive caching enabled" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Ready to test! Clear your cache and visit http://localhost:3000/index.html" -ForegroundColor Green
