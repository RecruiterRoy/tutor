# Setup Environment Variables for School Management System
# This script helps you create the .env file with the correct Supabase credentials

Write-Host "🔧 Setting up environment variables for School Management System" -ForegroundColor Green
Write-Host ""

# Check if .env file already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists. Do you want to overwrite it? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Setup cancelled." -ForegroundColor Red
        exit
    }
}

# Create .env file content
$envContent = @"
# Supabase Configuration
SUPABASE_URL=https://vfqdjpiyaabufpaofysz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWRqcGl5YWFidWZwYW9meXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNzE5NzQsImV4cCI6MjA0Nzc0Nzk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8

# For Next.js compatibility (if needed)
NEXT_PUBLIC_SUPABASE_URL=https://vfqdjpiyaabufpaofysz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcWRqcGl5YWFidWZwYW9meXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNzE5NzQsImV4cCI6MjA0Nzc0Nzk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8

# Service Role Key (for admin operations)
# Get this from your Supabase dashboard: Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI API Key (for AI features)
# Get this from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Environment
NODE_ENV=development
"@

# Write the content to .env file
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Get your Supabase service role key from:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/vfqdjpiyaabufpaofysz/settings/api" -ForegroundColor Yellow
Write-Host "2. Get your OpenAI API key from:" -ForegroundColor White
Write-Host "   https://platform.openai.com/api-keys" -ForegroundColor Yellow
Write-Host "3. Update the .env file with your actual keys" -ForegroundColor White
Write-Host "4. Run 'npm start' or 'node server.js' to start the server" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Your school management system is ready to run!" -ForegroundColor Green
