import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, planType = 'monthly', amount = 9900 } = req.body; // 99 INR = 9900 paise

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: `tutor_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        planType: planType,
        description: 'TUTOR.AI Monthly Subscription'
      }
    });

    // Create payment record in Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        razorpay_order_id: order.id,
        amount: amount,
        currency: 'INR',
        plan_type: planType,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (paymentError) {
      console.error('Payment record creation failed:', paymentError);
    }

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      error: 'Payment creation failed',
      message: error.message 
    });
  }
} 