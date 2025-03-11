-- Add face verification columns to user_verification table
ALTER TABLE public.user_verification
ADD COLUMN IF NOT EXISTS face_image_url TEXT,
ADD COLUMN IF NOT EXISTS face_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS face_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS face_verification_attempts INTEGER DEFAULT 0;

-- Add composite status view for combined verification status
CREATE OR REPLACE VIEW public.verification_status AS
SELECT 
    user_id,
    CASE 
        WHEN status = 'success' AND face_verified = TRUE THEN 'complete'
        WHEN status = 'success' AND face_verified = FALSE THEN 'plaid_only'
        WHEN status = 'pending' AND face_verified = TRUE THEN 'face_only'
        ELSE 'pending'
    END as combined_status,
    status as plaid_status,
    face_verified,
    verified_at as plaid_verified_at,
    face_verified_at,
    face_verification_attempts
FROM public.user_verification;

-- Add RLS policy for the view
CREATE POLICY "Users can view own verification status on view"
    ON public.verification_status
    FOR SELECT
    USING (auth.uid() = user_id);

-- Grant access to the view
GRANT SELECT ON public.verification_status TO authenticated;
