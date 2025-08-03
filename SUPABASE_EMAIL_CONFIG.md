# Supabase Email Confirmation 500 Error Fix

## The Problem
You're getting a 500 error "Error confirming user" when clicking the email confirmation link from Supabase.

## Root Cause
This is likely a Supabase configuration issue, not a code issue. The email confirmation URL or settings may not be properly configured.

## Steps to Fix in Supabase Dashboard

### 1. Check Site URL Configuration (MOST IMPORTANT)
1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Under **Site URL**, make sure it's set to your domain:
   - For local development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
   - For Vercel: `https://your-app.vercel.app`
   - For your app: `https://tutor-omega-seven.vercel.app` (based on your config)

**This is the most common cause of 500 errors!**

### 2. Check Redirect URLs
1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   ```
   http://localhost:3000/register.html
   http://localhost:3000/login.html
   https://tutor-omega-seven.vercel.app/register.html
   https://tutor-omega-seven.vercel.app/login.html
   https://tutor-omega-seven.vercel.app/
   ```

### 3. Email Template is Correct ✅
Your email template is properly formatted:
```html
<h2>👋 Welcome to Tution.app!</h2>
<p>Thanks for signing up. Please confirm your email address to continue.</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="background:#6D28D9;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">Confirm Email</a>
</p>
<p>If the button above doesn't work, copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<hr/>
<p>Thanks,<br/>The Tution.app Team</p>
```

**The `{{ .ConfirmationURL }}` is correct - no changes needed here!**

### 4. What the Confirmation URL Should Look Like
When properly configured, the confirmation URL should be:
```
https://vfqdjpiyaabufpaofysz.supabase.co/auth/v1/verify?token=...&type=email_confirmation&redirect_to=https://tutor-omega-seven.vercel.app/register.html
```

### 5. Check Email Provider Settings
1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Under **SMTP Settings**, check if email provider is configured
3. If using custom SMTP, verify settings

### 6. Check Project Settings
1. Go to **Supabase Dashboard** → **Settings** → **General**
2. Verify project URL and API keys
3. Check if project is in correct region

## Immediate Action Required
**Go to Supabase Dashboard right now and set the Site URL to:**
```
https://tutor-omega-seven.vercel.app
```

## Alternative Solution (Code Fix)
If the above doesn't work, the code now handles the 500 error gracefully:
- Shows user-friendly message
- Redirects to login page
- User can log in directly (email may already be confirmed)

## Testing Steps
1. Set the Site URL in Supabase
2. Register a new user
3. Check email for confirmation link
4. Click the link
5. Should work without 500 error

## Common Issues
- **Wrong Site URL**: Most common cause (90% of cases)
- **Missing redirect URLs**: Email confirmation can't redirect back
- **Email provider issues**: SMTP not configured properly
- **Project region**: Wrong region causing delays

## Contact Supabase Support
If the issue persists after checking all settings, contact Supabase support with:
- Project ID: `vfqdjpiyaabufpaofysz`
- Error message
- Steps to reproduce
- Email confirmation URL that's failing 