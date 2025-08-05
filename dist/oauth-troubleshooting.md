# 🔧 Google OAuth 500 Error Troubleshooting Guide

## 🚨 Error: `{"code":500,"error_code":"unexpected_failure","msg":"Unexpected failure, please check server logs for more information"}`

This error indicates a server-side configuration issue with Google OAuth in Supabase.

## 🔍 Step-by-Step Diagnosis

### 1. **Check Supabase OAuth Configuration**

**In Supabase Dashboard:**
1. Go to Authentication → Providers
2. Check if Google provider is enabled
3. Verify Google OAuth credentials are configured

**Required Google OAuth Settings:**
- Client ID: `your-google-client-id.apps.googleusercontent.com`
- Client Secret: `your-google-client-secret`
- Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 2. **Verify Google Cloud Console Configuration**

**In Google Cloud Console:**
1. Go to APIs & Services → Credentials
2. Check your OAuth 2.0 Client ID
3. Verify authorized redirect URIs include:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

### 3. **Check Domain Configuration**

**Authorized JavaScript origins should include:**
```
https://tution.app
https://www.tution.app
http://localhost:3000 (for development)
```

**Authorized redirect URIs should include:**
```
https://your-project.supabase.co/auth/v1/callback
```

### 4. **Common Issues & Solutions**

#### **Issue 1: Missing or Invalid OAuth Credentials**
**Solution:**
- Regenerate Google OAuth credentials
- Update Supabase with new credentials
- Clear browser cache and cookies

#### **Issue 2: Incorrect Redirect URLs**
**Solution:**
- Ensure redirect URL matches exactly: `https://your-project.supabase.co/auth/v1/callback`
- Check for trailing slashes or typos
- Verify HTTPS protocol

#### **Issue 3: OAuth Consent Screen Issues**
**Solution:**
- Configure OAuth consent screen in Google Cloud Console
- Add necessary scopes (email, profile)
- Publish app if needed

#### **Issue 4: Domain Verification**
**Solution:**
- Verify domain ownership in Google Cloud Console
- Add domain to authorized origins
- Wait for domain verification to complete

### 5. **Testing Steps**

1. **Use the Diagnostic Tool:**
   ```
   https://tution.app/oauth-diagnostic.html
   ```

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for detailed error messages
   - Check Network tab for failed requests

3. **Test with Different Browsers:**
   - Try Chrome, Firefox, Safari
   - Clear browser cache and cookies
   - Test in incognito/private mode

### 6. **Temporary Workaround**

If OAuth continues to fail, users can:
1. Use email registration instead
2. Contact support for manual account creation
3. Try again later (server issues may be temporary)

### 7. **Contact Support**

If the issue persists, provide:
- Error message details
- Browser and version
- Steps to reproduce
- Screenshots of error

## 🔧 Quick Fix Checklist

- [ ] Google OAuth enabled in Supabase
- [ ] Valid Google OAuth credentials
- [ ] Correct redirect URLs configured
- [ ] Domain added to authorized origins
- [ ] OAuth consent screen configured
- [ ] HTTPS protocol used
- [ ] Browser cache cleared
- [ ] Tested in incognito mode

## 📞 Support Information

For immediate assistance:
- Email: support@tution.app
- Include error details and browser information
- Provide steps to reproduce the issue 