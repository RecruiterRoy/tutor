// Payment System for TUTOR.AI
class PaymentSystem {
    constructor() {
        this.razorpayKey = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Get Razorpay key from config
            this.razorpayKey = window.TUTOR_CONFIG?.RAZORPAY_KEY_ID;
            this.currentUser = window.currentUser;
            
            console.log('✅ Payment system initialized');
        } catch (error) {
            console.error('❌ Payment system init failed:', error);
        }
    }

    async createPayment(planType = 'monthly', amount = 9900) {
        try {
            console.log('Creating payment for plan:', planType);
            
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser?.id,
                    planType: planType,
                    amount: amount
                })
            });

            if (!response.ok) {
                throw new Error('Payment creation failed');
            }

            const paymentData = await response.json();
            console.log('Payment created:', paymentData);

            return paymentData;
        } catch (error) {
            console.error('Payment creation error:', error);
            throw error;
        }
    }

    async initiateUPIPayment(planType = 'monthly') {
        try {
            const paymentData = await this.createPayment(planType);
            
            // Create UPI payment options
            const options = {
                key: paymentData.key,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: 'TUTOR.AI',
                description: 'Monthly Premium Subscription',
                order_id: paymentData.orderId,
                handler: (response) => {
                    this.handlePaymentSuccess(response);
                },
                prefill: {
                    name: this.currentUser?.user_metadata?.full_name || 'Student',
                    email: this.currentUser?.email,
                    contact: this.currentUser?.user_metadata?.phone || ''
                },
                notes: {
                    userId: this.currentUser?.id,
                    planType: planType
                },
                theme: {
                    color: '#667eea'
                },
                modal: {
                    ondismiss: () => {
                        console.log('Payment modal dismissed');
                    }
                }
            };

            // Initialize Razorpay
            const rzp = new Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('UPI payment initiation failed:', error);
            this.showPaymentError('Payment initiation failed. Please try again.');
        }
    }

    async handlePaymentSuccess(response) {
        try {
            console.log('Payment success response:', response);

            // Verify payment on server
            const verifyResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                })
            });

            if (!verifyResponse.ok) {
                throw new Error('Payment verification failed');
            }

            const verificationResult = await verifyResponse.json();
            console.log('Payment verified:', verificationResult);

            // Update UI and show success
            this.showPaymentSuccess();
            this.updateSubscriptionStatus();

        } catch (error) {
            console.error('Payment verification error:', error);
            this.showPaymentError('Payment verification failed. Please contact support.');
        }
    }

    async checkSubscriptionStatus() {
        try {
            const { data, error } = await window.supabaseClient
                .rpc('check_subscription_status');

            if (error) {
                console.error('Subscription status check failed:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Subscription status error:', error);
            return null;
        }
    }

    async updateSubscriptionStatus() {
        try {
            const status = await this.checkSubscriptionStatus();
            
            if (status && status.length > 0) {
                const subscription = status[0];
                
                // Update UI based on subscription status
                this.updateSubscriptionUI(subscription);
                
                // Update user data
                if (window.userData) {
                    window.userData.subscription_status = subscription.is_active ? 'active' : 'free';
                    window.userData.subscription_plan = subscription.plan_type;
                }
            }
        } catch (error) {
            console.error('Subscription status update failed:', error);
        }
    }

    updateSubscriptionUI(subscription) {
        // Update subscription badge
        const subscriptionBadge = document.getElementById('subscriptionBadge');
        if (subscriptionBadge) {
            if (subscription.is_active) {
                subscriptionBadge.textContent = 'Premium';
                subscriptionBadge.className = 'px-2 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs rounded-full';
            } else {
                subscriptionBadge.textContent = 'Free';
                subscriptionBadge.className = 'px-2 py-1 bg-gray-500 text-white text-xs rounded-full';
            }
        }

        // Update payment button
        const paymentButton = document.getElementById('upgradeButton');
        if (paymentButton) {
            if (subscription.is_active) {
                paymentButton.textContent = 'Premium Active';
                paymentButton.disabled = true;
                paymentButton.className = 'px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50';
            } else {
                paymentButton.textContent = 'Upgrade to Premium - ₹99/month';
                paymentButton.disabled = false;
                paymentButton.className = 'px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600';
            }
        }
    }

    showPaymentSuccess() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="glass-effect rounded-xl p-6 max-w-md w-full mx-4 text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h3 class="text-white text-xl font-bold mb-2">Payment Successful!</h3>
                <p class="text-gray-300 mb-4">Your premium subscription is now active. Enjoy unlimited access to TUTOR.AI!</p>
                <button onclick="this.closest('.fixed').remove(); location.reload();" 
                        class="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-medium">
                    Continue Learning
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showPaymentError(message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="glass-effect rounded-xl p-6 max-w-md w-full mx-4 text-center">
                <div class="text-6xl mb-4">❌</div>
                <h3 class="text-white text-xl font-bold mb-2">Payment Failed</h3>
                <p class="text-gray-300 mb-4">${message}</p>
                <button onclick="this.closest('.fixed').remove()" 
                        class="w-full bg-gray-600 text-white py-3 rounded-lg font-medium">
                    Try Again
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Generate UPI deep link for mobile apps
    generateUPIDeepLink(upiId, amount, name, description) {
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(description)}&cu=INR`;
        return upiUrl;
    }
}

// Initialize payment system
window.paymentSystem = new PaymentSystem();
console.log('✅ Payment system loaded'); 