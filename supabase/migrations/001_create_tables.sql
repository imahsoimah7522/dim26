-- =============================================
-- Migration 001: Create Tables
-- DataInsight Mini — Phase 7
-- =============================================
-- ⚠️ Review sebelum apply ke Supabase.
-- Jalankan di Supabase SQL Editor secara berurutan.

-- 1. profiles — extends auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  business_name TEXT,
  business_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'User profile — extends auth.users';

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. analyses — saved analysis metadata + summary
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  row_count INTEGER NOT NULL,
  column_count INTEGER NOT NULL,
  column_mapping JSONB,
  summary JSONB NOT NULL,
  has_ai_insights BOOLEAN DEFAULT false NOT NULL,
  ai_insights JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.analyses IS 'Saved analysis metadata and summaries';

CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);

-- 3. report_orders — payment/order tracking
CREATE TABLE public.report_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free_demo', 'paid_report', 'business_pack')),
  price INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.report_orders IS 'Report purchase orders — payment_status only changeable by service_role';

CREATE INDEX idx_report_orders_user_id ON public.report_orders(user_id);
CREATE INDEX idx_report_orders_analysis_id ON public.report_orders(analysis_id);

-- 4. payment_events — server-controlled audit log
CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.report_orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('initiated', 'callback', 'webhook', 'verified', 'failed')),
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.payment_events IS 'Payment event audit log — only service_role can INSERT/UPDATE';

CREATE INDEX idx_payment_events_order_id ON public.payment_events(order_id);

-- 5. generated_reports — report file references
CREATE TABLE public.generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.report_orders(id),
  storage_path TEXT NOT NULL,
  is_demo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.generated_reports IS 'Generated PDF report file references';

CREATE INDEX idx_generated_reports_user_id ON public.generated_reports(user_id);
