-- =============================================
-- Migration 003: Private Storage Bucket
-- DataInsight Mini — Phase 7
-- =============================================
-- ⚠️ Review sebelum apply ke Supabase.

-- Create private bucket for paid reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false);

-- Users can upload reports to their own folder: {user_id}/...
CREATE POLICY "Users can upload own reports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own reports
CREATE POLICY "Users can delete own reports"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
