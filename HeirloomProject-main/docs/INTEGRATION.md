## Identity Capsule Integration Plan

### Overview
The Identity Capsule face verification system will be integrated into HeirloomProject's existing verification flow as a parallel requirement alongside Plaid verification. Both verifications must succeed before a HIT token can be issued.

### Verification Flow
1. User Registration (Supabase)
   - User signs up through existing flow
   - Creates entry in user_verification table

2. Parallel Verification Steps
   a. Plaid Verification
      - User completes Plaid verification
      - Updates status to 'success' in user_verification
   
   b. Face Verification
      - User uploads face image
      - Face verification service validates
      - Updates face_verified and face_verified_at

3. HIT Token Issuance
   - Only proceeds when both verifications complete
   - Requires combined_status = 'complete'
   - Issues HIT token through SimpleHIT contract

### Database Changes
- Added face verification columns to user_verification
- Created verification_status view for combined status
- Maintains RLS policies for security

### Storage Strategy
Face images will be stored in Supabase storage:
- Secure, managed storage
- Consistent with existing infrastructure
- Accessible through Supabase client

### Integration Points
1. AuthService.ts
   - Add face verification methods
   - Check combined verification status

2. SimpleHIT Contract
   - No changes needed
   - Issuance remains controlled by backend

3. Frontend
   - Add face image upload component
   - Display combined verification status

### Security Considerations
- Face images stored securely in Supabase
- RLS policies control access
- Verification attempts tracked and limited
- JWT authentication required for all operations
