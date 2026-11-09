-- =============================================
-- Migration 002: Row Level Security Policies
-- DataInsight Mini — Phase 7
-- =============================================
-- ⚠️ Review sebelum apply ke Supabase.

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- ── profiles ──────────────────────────────────
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── analyses ──────────────────────────────────
CREATE POLICY "Users can read own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON public.analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON public.analyses FOR DELETE
  USING (auth.uid() = user_id);

-- ── report_orders ─────────────────────────────
-- Users can only READ their own orders
CREATE POLICY "Users can read own orders"
  ON public.report_orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can INSERT orders ONLY with 'pending' status
CREATE POLICY "Users can create pending orders"
  ON public.report_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id AND payment_status = 'pending');

-- ⚠️ NO UPDATE policy — only service_role can update payment_status
-- ⚠️ NO DELETE policy — orders are permanent records

-- ── payment_events ────────────────────────────
-- Users can READ events for their own orders (read-only audit trail)
CREATE POLICY "Users can read own payment events"
  ON public.payment_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.report_orders
      WHERE report_orders.id = payment_events.order_id
      AND report_orders.user_id = auth.uid()
    )
  );

-- ⚠️ NO INSERT/UPDATE/DELETE for users
-- Only service_role can manage payment events

-- ── generated_reports ─────────────────────────
CREATE POLICY "Users can read own reports"
  ON public.generated_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.generated_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);
