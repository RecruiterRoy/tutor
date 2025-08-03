# Supabase Email Confirmation 500 Error Fix

## The Problem
You're getting a 500 error "Error confirming user" when clicking the email confirmation link from Supabase.

## Root Cause
This is likely a Supabase configuration issue, not a code issue. The email confirmation URL or settings may not be properly configured.

## Steps to Fix in Supabase Dashboard

### 1. Check Site URL Configuration
1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Under **Site URL**, make sure it's set to your domain:
   - For local development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
   - For Vercel: `https://your-app.vercel.app`

### 2. Check Redirect URLs
1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   ```
   http://localhost:3000/register.html
   http://localhost:3000/login.html
   https://yourdomain.com/register.html
   https://yourdomain.com/login.html
   https://your-app.vercel.app/register.html
   https://your-app.vercel.app/login.html
   ```

### 3. Check Email Templates
1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Check **Confirm signup** template
3. Make sure the confirmation URL is correct
4. Test the email template

### 4. Check Email Provider Settings
1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Under **SMTP Settings**, check if email provider is configured
3. If using custom SMTP, verify settings

### 5. Check Project Settings
1. Go to **Supabase Dashboard** → **Settings** → **General**
2. Verify project URL and API keys
3. Check if project is in correct region

## Alternative Solution (Code Fix)
If the above doesn't work, the code now handles the 500 error gracefully:
- Shows user-friendly message
- Redirects to login page
- User can log in directly (email may already be confirmed)

## Testing Steps
1. Register a new user
2. Check email for confirmation link
3. Click the link
4. If 500 error occurs, try logging in directly
5. Check if user can access dashboard

## Common Issues
- **Wrong Site URL**: Most common cause
- **Missing redirect URLs**: Email confirmation can't redirect back
- **Email provider issues**: SMTP not configured properly
- **Project region**: Wrong region causing delays

## Contact Supabase Support
If the issue persists after checking all settings, contact Supabase support with:
- Project ID
- Error message
- Steps to reproduce
- Email confirmation URL that's failing 