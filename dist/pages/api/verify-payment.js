import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update payment status in Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        completed_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (updateError) {
      console.error('Payment update failed:', updateError);
      return res.status(500).json({ error: 'Payment update failed' });
    }

    // Get user ID from payment record
    const { data: paymentData, error: fetchError } = await supabase
      .from('payments')
      .select('user_id, plan_type')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (fetchError || !paymentData) {
      console.error('Payment data fetch failed:', fetchError);
      return res.status(500).json({ error: 'Payment data fetch failed' });
    }

    // Update user subscription status
    const { error: userUpdateError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: paymentData.plan_type,
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentData.user_id);

    if (userUpdateError) {
      console.error('User subscription update failed:', userUpdateError);
    }

    res.status(200).json({ 
      success: true,
      message: 'Payment verified and subscription activated'
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      error: 'Payment verification failed',
      message: error.message 
    });
  }
} 