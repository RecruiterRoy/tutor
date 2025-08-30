# Clear Browser Cache and Refresh Instructions
Write-Host "🔄 Clearing Browser Cache Instructions" -ForegroundColor Cyan
Write-Host ""

Write-Host "The index page has been updated with new SchoolEdu branding and styling." -ForegroundColor Yellow
Write-Host "If you're still seeing the old page, follow these steps:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Hard Refresh (Ctrl + F5 or Ctrl + Shift + R)" -ForegroundColor Green
Write-Host "2. Clear Browser Cache:" -ForegroundColor Green
Write-Host "   - Chrome: Ctrl + Shift + Delete"
Write-Host "   - Firefox: Ctrl + Shift + Delete"
Write-Host "   - Edge: Ctrl + Shift + Delete"
Write-Host ""

Write-Host "3. Or try opening in Incognito/Private mode" -ForegroundColor Green
Write-Host ""

Write-Host "4. Alternative: Add ?v=2 to the URL:" -ForegroundColor Green
Write-Host "   http://localhost:3000?v=2" -ForegroundColor White
Write-Host ""

Write-Host "✅ Server has been restarted and is running on http://localhost:3000" -ForegroundColor Green
Write-Host ""

Write-Host "New features you should see:" -ForegroundColor Cyan
Write-Host "• SchoolEdu branding instead of tution.app" -ForegroundColor White
Write-Host "• Updated hero section with school management focus" -ForegroundColor White
Write-Host "• New features section with school management tools" -ForegroundColor White
Write-Host "• Unified styling matching dashboard-working.html" -ForegroundColor White
Write-Host "• Mobile-responsive design" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
