# 🚀 Vercel Deployment Checklist for tution.app

## Pre-Deployment Checklist

### ✅ Domain Configuration
- [x] **Primary Domain**: `tution.app` configured in Vercel
- [x] **Secondary Domain**: `tutor-omega-seven.vercel.app` (auto-generated)
- [x] **SSL Certificates**: Both domains have valid SSL certificates
- [x] **DNS Configuration**: Proper DNS records for tution.app

### ✅ Code Configuration
- [x] **API Endpoints**: Updated to use dynamic host detection
- [x] **Config Files**: `public/js/config.js` updated with domain logic
- [x] **Vercel Config**: `vercel.json` properly configured
- [x] **Localhost References**: Removed hardcoded localhost URLs
- [x] **Download Routes**: Added `/download` route to vercel.json

### ✅ File Structure
- [x] **Public Files**: All static files in `/public` directory
- [x] **API Routes**: All API files in `/pages/api` directory
- [x] **HTML Files**: All HTML files in root directory
- [x] **Assets**: Images and other assets properly referenced

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy the Application
```bash
# Option 1: Use the deployment script
./deploy-vercel.ps1

# Option 2: Manual deployment
vercel --prod
```

### 4. Configure Domains
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Domains
4. Add `tution.app` as custom domain
5. Verify DNS configuration

## Post-Deployment Verification

### ✅ Domain Testing
- [ ] **tution.app**: https://tution.app loads correctly
- [ ] **tutor-omega-seven.vercel.app**: https://tutor-omega-seven.vercel.app loads correctly
- [ ] **SSL**: Both sites use HTTPS
- [ ] **Redirects**: www.tution.app redirects to tution.app

### ✅ Functionality Testing
- [ ] **Landing Page**: index.html loads with proper branding
- [ ] **Registration**: register.html works correctly
- [ ] **Login**: login.html works correctly
- [ ] **Dashboard**: dashboard.html loads for authenticated users
- [ ] **APK Download**: /download route works correctly
- [ ] **API Endpoints**: All API calls work from both domains

### ✅ API Testing
- [ ] **Chat API**: `/api/chat` responds correctly
- [ ] **Claude API**: `/api/claude` responds correctly
- [ ] **Health Check**: `/api/health` returns 200
- [ ] **Knowledge Search**: `/api/knowledge-search` works
- [ ] **Payment APIs**: Payment endpoints work correctly

### ✅ Mobile App Integration
- [ ] **APK Download**: app-release.apk accessible at both domains
- [ ] **PWA Manifest**: manifest.json loads correctly
- [ ] **Service Worker**: sw.js works for offline functionality
- [ ] **Mobile UI**: Responsive design works on mobile devices

## Troubleshooting

### Common Issues

#### 1. Old Dashboard Still Showing
**Solution**: Clear browser cache and Vercel cache
```bash
# Clear Vercel cache
vercel --force
```

#### 2. API Endpoints Not Working
**Check**: 
- Environment variables are set in Vercel dashboard
- API routes are in correct location (`/pages/api/`)
- CORS configuration is correct

#### 3. Domain Not Working
**Check**:
- DNS records are properly configured
- Domain is added in Vercel dashboard
- SSL certificate is valid

#### 4. Static Files Not Loading
**Check**:
- Files are in `/public` directory
- Routes are configured in `vercel.json`
- File permissions are correct

### Environment Variables Required
Make sure these are set in Vercel dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## Monitoring

### Performance Monitoring
- [ ] **Page Load Times**: Under 3 seconds
- [ ] **API Response Times**: Under 1 second
- [ ] **Error Rates**: Less than 1%
- [ ] **Uptime**: 99.9% availability

### Analytics
- [ ] **Google Analytics**: Properly configured
- [ ] **Vercel Analytics**: Enabled
- [ ] **Error Tracking**: Set up error monitoring

## Security Checklist

### ✅ Security Headers
- [x] **X-Frame-Options**: DENY
- [x] **X-Content-Type-Options**: nosniff
- [x] **Referrer-Policy**: strict-origin-when-cross-origin
- [ ] **Content-Security-Policy**: Configure if needed

### ✅ API Security
- [x] **Rate Limiting**: Implemented in API routes
- [x] **CORS**: Properly configured
- [x] **Authentication**: Supabase auth working
- [x] **Input Validation**: All inputs validated

## Final Verification

Before marking deployment as complete:

1. **Test on Multiple Devices**: Desktop, tablet, mobile
2. **Test on Multiple Browsers**: Chrome, Firefox, Safari, Edge
3. **Test All User Flows**: Registration → Login → Dashboard → Download
4. **Test API Integration**: All features working end-to-end
5. **Performance Test**: Load testing with multiple users
6. **Security Test**: Basic security audit

## Contact Information

If issues persist:
- **Vercel Support**: https://vercel.com/support
- **Domain Provider**: Check DNS configuration
- **Development Team**: Review logs and configurations

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Deployment Version**: 1.0.0
**Status**: Ready for Deployment 