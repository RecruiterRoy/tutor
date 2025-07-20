-- Payment System Database Schema for TUTOR.AI

-- Payments table to track all transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    amount INTEGER NOT NULL, -- Amount in paise
    currency VARCHAR(10) DEFAULT 'INR',
    plan_type VARCHAR(50) DEFAULT 'monthly',
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add subscription fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50),
ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments table
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies for payment management
CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all payments" ON public.payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add role column to user_profiles if not exists
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_status(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
    is_active BOOLEAN,
    plan_type VARCHAR(50),
    days_remaining INTEGER,
    subscription_end TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN up.subscription_status = 'active' 
            AND up.subscription_end > NOW() 
            THEN true 
            ELSE false 
        END as is_active,
        up.subscription_plan as plan_type,
        CASE 
            WHEN up.subscription_end > NOW() 
            THEN EXTRACT(DAY FROM (up.subscription_end - NOW()))
            ELSE 0 
        END as days_remaining,
        up.subscription_end
    FROM public.user_profiles up
    WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get payment history
CREATE OR REPLACE FUNCTION get_payment_history(user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
    payment_id UUID,
    order_id VARCHAR(255),
    amount INTEGER,
    currency VARCHAR(10),
    plan_type VARCHAR(50),
    status VARCHAR(20),
    created_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.razorpay_order_id,
        p.amount,
        p.currency,
        p.plan_type,
        p.status,
        p.created_at,
        p.completed_at
    FROM public.payments p
    WHERE p.user_id = get_payment_history.user_id
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.payments TO authenticated;
GRANT EXECUTE ON FUNCTION check_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_history(UUID) TO authenticated;

-- Insert sample subscription plans
INSERT INTO public.subscription_plans (name, price, duration_days, features) VALUES
('Free', 0, 0, '{"basic_chat": true, "limited_queries": true}'),
('Monthly Premium', 9900, 30, '{"unlimited_chat": true, "voice_features": true, "priority_support": true, "advanced_ai": true}'),
('Yearly Premium', 99000, 365, '{"unlimited_chat": true, "voice_features": true, "priority_support": true, "advanced_ai": true, "discount": true}')
ON CONFLICT (name) DO NOTHING;

-- Show final status
SELECT 
    'Payment System Setup Complete' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active_subscriptions,
    COUNT(CASE WHEN subscription_status = 'free' THEN 1 END) as free_users
FROM public.user_profiles; 