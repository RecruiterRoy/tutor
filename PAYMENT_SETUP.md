# 💰 TUTOR.AI Payment System Setup

## Overview
TUTOR.AI now includes a complete UPI payment system using Razorpay for monthly subscriptions at ₹99/month.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install razorpay
```

### 2. Set Up Environment Variables
Add these to your Vercel environment variables:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key

# For production, use live keys:
# RAZORPAY_KEY_ID=rzp_live_your_live_key_id
# RAZORPAY_KEY_SECRET=your_live_secret_key
```

### 3. Initialize Database
```bash
node scripts/setup-payment-system.js
```

### 4. Deploy to Vercel
```bash
git add .
git commit -m "Add payment system"
git push origin master
```

## 📋 Payment Flow

### User Journey:
1. **User clicks "Upgrade"** → Redirected to `/public/payment.html`
2. **Selects plan** → Monthly Premium (₹99) or Yearly Premium (₹990)
3. **Clicks "Upgrade"** → Creates Razorpay order via `/api/create-payment`
4. **UPI payment** → User pays via any UPI app (Google Pay, PhonePe, Paytm)
5. **Payment verification** → Webhook verifies payment via `/api/verify-payment`
6. **Access granted** → User gets premium features for 30 days

### Technical Flow:
```
Frontend → /api/create-payment → Razorpay Order → UPI Payment → 
Webhook → /api/verify-payment → Update Database → Grant Access
```

## 🔧 API Endpoints

### Create Payment
```http
POST /api/create-payment
Content-Type: application/json

{
  "userId": "user-uuid",
  "planType": "monthly",
  "amount": 9900
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_xyz123",
  "amount": 9900,
  "currency": "INR",
  "key": "rzp_test_..."
}
```

### Verify Payment
```http
POST /api/verify-payment
Content-Type: application/json

{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash"
}
```

## 🗄️ Database Schema

### Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    razorpay_order_id VARCHAR(255) UNIQUE,
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    amount INTEGER, -- Amount in paise
    currency VARCHAR(10) DEFAULT 'INR',
    plan_type VARCHAR(50) DEFAULT 'monthly',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

### User Profiles (Updated)
```sql
ALTER TABLE user_profiles ADD COLUMN:
- subscription_status VARCHAR(20) DEFAULT 'free'
- subscription_plan VARCHAR(50)
- subscription_start TIMESTAMPTZ
- subscription_end TIMESTAMPTZ
- payment_method VARCHAR(50)
- last_payment_date TIMESTAMPTZ
- role VARCHAR(20) DEFAULT 'user'
```

## 💳 Payment Plans

### Monthly Premium - ₹99/month
- ✅ Unlimited AI Chat
- ✅ Voice Input & Output
- ✅ Advanced AI Models
- ✅ Priority Support
- ✅ Personalized Learning
- ✅ No Advertisements
- ✅ Early Access to Features

### Yearly Premium - ₹990/year (2 months free)
- ✅ All Monthly Features
- ✅ 2 Months Free
- ✅ Exclusive Content Access

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only view their own payments
- Users can only insert their own payments
- Admins can view and update all payments

### Payment Verification
- Razorpay signature verification
- Server-side payment validation
- Secure webhook handling

### Environment Variables
- API keys stored securely in Vercel
- No sensitive data in client-side code
- Service key for admin operations only

## 🧪 Testing

### Test Mode
Use Razorpay test credentials:
- Test UPI: `success@razorpay`
- Test Cards: Available in Razorpay dashboard

### Test Payment Flow
1. Go to `/public/payment.html`
2. Click "Upgrade to Premium"
3. Use test UPI ID: `success@razorpay`
4. Verify subscription activation

## 📱 Mobile Integration

### UPI Deep Links
The system supports UPI deep links for mobile apps:
```
upi://pay?pa=merchant@upi&pn=TUTOR.AI&am=9900&tn=Premium+Subscription&cu=INR
```

### Mobile App Features
- Responsive payment UI
- Touch-optimized buttons
- Native UPI app integration
- Offline payment support

## 🔄 Subscription Management

### Automatic Renewal
- Manual renewal required (no auto-charging)
- Email reminders before expiry
- Grace period for expired subscriptions

### Subscription Status Check
```javascript
// Check if user has active subscription
const { data } = await supabase.rpc('check_subscription_status');
const isActive = data[0]?.is_active;
```

## 📊 Analytics & Monitoring

### Payment Analytics
- Track payment success rates
- Monitor subscription conversions
- Analyze user payment patterns

### Error Monitoring
- Failed payment tracking
- Webhook error logging
- User support ticket integration

## 🛠️ Troubleshooting

### Common Issues

1. **Payment Creation Fails**
   - Check Razorpay API keys
   - Verify environment variables
   - Check network connectivity

2. **Payment Verification Fails**
   - Verify webhook signature
   - Check database connectivity
   - Monitor server logs

3. **Subscription Not Activated**
   - Check payment status in database
   - Verify user profile update
   - Check RLS policies

### Debug Commands
```bash
# Test payment system setup
node scripts/setup-payment-system.js

# Check database connectivity
node scripts/testSupabaseConnection.js

# Monitor payment logs
tail -f logs/payment.log
```

## 📞 Support

### Payment Issues
- Contact Razorpay support for payment gateway issues
- Check Razorpay dashboard for transaction status
- Monitor webhook delivery in Razorpay logs

### Technical Issues
- Check Vercel function logs
- Monitor Supabase database logs
- Review application error logs

## 🔄 Updates & Maintenance

### Regular Tasks
- Monitor payment success rates
- Update subscription expiry dates
- Clean up old payment records
- Backup payment data

### Security Updates
- Rotate API keys periodically
- Update dependencies regularly
- Monitor for security vulnerabilities
- Review access logs

---

## 🎉 Ready to Go!

Your TUTOR.AI payment system is now ready for production. Users can upgrade to premium and enjoy unlimited access to advanced AI tutoring features!

**Next Steps:**
1. Test the payment flow thoroughly
2. Set up monitoring and alerts
3. Prepare customer support documentation
4. Launch premium features to users 