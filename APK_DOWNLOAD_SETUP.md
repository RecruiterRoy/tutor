# APK Download Setup for tution.app

## Overview
This document explains how the APK download functionality is set up and how to deploy the actual APK file.

## Current Implementation

### 1. Download Button
- **Location**: Navigation bar on `index.html` and `public/index.html`
- **Replaces**: The old "Dashboard" button
- **Functionality**: 
  - If user is logged in → Direct download
  - If user is not logged in → Redirect to registration

### 2. Registration Flow
- **Modified Files**: `register.html`
- **New Behavior**: After successful registration, checks if user wants to download app
- **Redirect Logic**: 
  - If `downloadAfterRegister` flag is set → Redirect to `download.html`
  - Otherwise → Redirect to `dashboard.html` or `login.html`

### 3. Download Page
- **New File**: `download.html`
- **Features**:
  - Beautiful download interface
  - Progress bar simulation
  - Installation instructions
  - App features showcase
  - Auto-download for users coming from registration

### 4. Login Verification
- **Modified File**: `login.html`
- **New Feature**: Email verification check
- **Behavior**: Shows specific message if email is not verified

## File Structure

```
tutor/
├── index.html (main landing page with download button)
├── public/
│   ├── index.html (public version with download button)
│   └── app-release.apk (placeholder - replace with actual APK)
├── download.html (dedicated download page)
├── register.html (modified for download flow)
├── login.html (modified for verification checks)
└── APK_DOWNLOAD_SETUP.md (this file)
```

## Deployment Steps

### 1. Replace Placeholder APK
```bash
# Replace the placeholder file with your actual APK
cp /path/to/your/tution-app.apk public/app-release.apk
```

### 2. APK File Requirements
- **Location**: `public/app-release.apk`
- **Access URL**: `https://tution.app/app-release.apk`
- **File Size**: Should be optimized for web download
- **Version**: Include version info in filename if needed

### 3. Vercel Deployment
The APK will be automatically served by Vercel when placed in the `public/` directory.

### 4. Alternative Hosting Options

#### Option A: Firebase Storage
```javascript
// Update download links to use Firebase Storage URL
const firebaseUrl = 'https://storage.googleapis.com/your-bucket/tution-app.apk';
```

#### Option B: Cloudflare R2
```javascript
// Update download links to use R2 URL
const r2Url = 'https://your-bucket.your-subdomain.r2.cloudflarestorage.com/tution-app.apk';
```

## User Flow

### Scenario 1: Logged-in User
1. User clicks "Download App"
2. Direct download starts with progress bar
3. APK file downloads automatically

### Scenario 2: Non-registered User
1. User clicks "Download App"
2. Modal appears asking to register first
3. User clicks "Register Now"
4. Registration process with OAuth/email verification
5. After successful registration → Redirect to download page
6. Auto-download starts

### Scenario 3: Email Verification Required
1. User tries to login without verifying email
2. Specific error message shown
3. User must verify email before login

## Analytics and Tracking

### Download Tracking
Consider implementing:
- Google Analytics for download tracking
- Firebase Analytics for mobile app insights
- Custom tracking for conversion rates

### Example Implementation
```javascript
// Track download clicks
function trackDownload() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'download', {
            'event_category': 'app',
            'event_label': 'tution-app-apk'
        });
    }
}
```

## Testing Checklist

- [ ] Download button appears in navigation
- [ ] Modal shows for non-registered users
- [ ] Registration flow works correctly
- [ ] Download page loads properly
- [ ] APK file downloads successfully
- [ ] Email verification messages work
- [ ] Mobile responsive design
- [ ] Progress bar animation works

## Future Enhancements

1. **Version Management**: Implement version checking and update notifications
2. **Platform Detection**: Detect Android/iOS and show appropriate download
3. **Download Analytics**: Track download success/failure rates
4. **QR Code**: Add QR code for easy mobile download
5. **Release Notes**: Show what's new in each version

## Troubleshooting

### Common Issues

1. **APK not downloading**
   - Check file permissions
   - Verify file exists in `public/` directory
   - Check Vercel deployment

2. **Download button not working**
   - Check JavaScript console for errors
   - Verify function names match
   - Check localStorage access

3. **Registration flow broken**
   - Verify localStorage flags
   - Check redirect URLs
   - Test OAuth flow

### Debug Commands
```javascript
// Check if download flag is set
console.log(localStorage.getItem('downloadAfterRegister'));

// Clear download flag
localStorage.removeItem('downloadAfterRegister');

// Test download function
handleDownloadApp();
```

## Security Considerations

1. **APK Integrity**: Consider signing APK and providing checksums
2. **Download Limits**: Implement rate limiting if needed
3. **User Verification**: Ensure only verified users can download
4. **HTTPS**: Always serve APK over HTTPS

## Support

For issues or questions about the APK download setup, check:
1. Browser console for JavaScript errors
2. Network tab for download issues
3. Vercel deployment logs
4. Supabase authentication logs 