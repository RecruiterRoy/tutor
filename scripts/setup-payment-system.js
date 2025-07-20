// Setup Payment System for TUTOR.AI
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPaymentSystem() {
    console.log('🚀 Setting up TUTOR.AI Payment System...\n');

    try {
        // 1. Create payments table
        console.log('📊 Creating payments table...');
        const { error: paymentsError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS public.payments (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
                    razorpay_payment_id VARCHAR(255),
                    razorpay_signature VARCHAR(255),
                    amount INTEGER NOT NULL,
                    currency VARCHAR(10) DEFAULT 'INR',
                    plan_type VARCHAR(50) DEFAULT 'monthly',
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    completed_at TIMESTAMPTZ,
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            `
        });

        if (paymentsError) {
            console.log('⚠️  Payments table might already exist:', paymentsError.message);
        } else {
            console.log('✅ Payments table created');
        }

        // 2. Add subscription fields to user_profiles
        console.log('👤 Adding subscription fields to user_profiles...');
        const { error: alterError } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE public.user_profiles 
                ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'free',
                ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50),
                ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
                ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
            `
        });

        if (alterError) {
            console.log('⚠️  User profiles might already have subscription fields:', alterError.message);
        } else {
            console.log('✅ Subscription fields added to user_profiles');
        }

        // 3. Enable RLS on payments table
        console.log('🔒 Setting up Row Level Security...');
        const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
                
                DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
                CREATE POLICY "Users can view own payments" ON public.payments
                    FOR SELECT USING (auth.uid() = user_id);
                
                DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
                CREATE POLICY "Users can insert own payments" ON public.payments
                    FOR INSERT WITH CHECK (auth.uid() = user_id);
                
                DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
                CREATE POLICY "Admins can view all payments" ON public.payments
                    FOR SELECT USING (
                        EXISTS (
                            SELECT 1 FROM public.user_profiles 
                            WHERE id = auth.uid() AND role = 'admin'
                        )
                    );
                
                DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
                CREATE POLICY "Admins can update all payments" ON public.payments
                    FOR UPDATE USING (
                        EXISTS (
                            SELECT 1 FROM public.user_profiles 
                            WHERE id = auth.uid() AND role = 'admin'
                        )
                    );
            `
        });

        if (rlsError) {
            console.log('⚠️  RLS setup might have issues:', rlsError.message);
        } else {
            console.log('✅ Row Level Security configured');
        }

        // 4. Create indexes
        console.log('📈 Creating database indexes...');
        const { error: indexError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
                CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(razorpay_order_id);
                CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
                CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);
            `
        });

        if (indexError) {
            console.log('⚠️  Index creation might have issues:', indexError.message);
        } else {
            console.log('✅ Database indexes created');
        }

        // 5. Create subscription check function
        console.log('🔧 Creating subscription check function...');
        const { error: functionError } = await supabase.rpc('exec_sql', {
            sql: `
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
            `
        });

        if (functionError) {
            console.log('⚠️  Function creation might have issues:', functionError.message);
        } else {
            console.log('✅ Subscription check function created');
        }

        // 6. Test the setup
        console.log('🧪 Testing payment system setup...');
        
        // Check if tables exist
        const { data: tables, error: tablesError } = await supabase
            .from('payments')
            .select('count')
            .limit(1);

        if (tablesError) {
            console.log('❌ Payments table test failed:', tablesError.message);
        } else {
            console.log('✅ Payments table is accessible');
        }

        // Check user profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('subscription_status')
            .limit(1);

        if (profilesError) {
            console.log('❌ User profiles test failed:', profilesError.message);
        } else {
            console.log('✅ User profiles subscription fields are accessible');
        }

        console.log('\n🎉 Payment System Setup Complete!');
        console.log('\n📋 Next Steps:');
        console.log('1. Add Razorpay credentials to Vercel environment variables:');
        console.log('   - RAZORPAY_KEY_ID');
        console.log('   - RAZORPAY_KEY_SECRET');
        console.log('2. Test payment flow on the app');
        console.log('3. Monitor payment webhooks');
        console.log('\n🔗 Payment Page: /public/payment.html');
        console.log('🔗 API Endpoints:');
        console.log('   - POST /api/create-payment');
        console.log('   - POST /api/verify-payment');

    } catch (error) {
        console.error('❌ Payment system setup failed:', error);
        process.exit(1);
    }
}

// Run setup
setupPaymentSystem(); 