export interface PlaidSuccessResponse {
  status: string;
  face_verified?: boolean;
  combined_status?: 'complete' | 'plaid_only' | 'face_only' | 'pending';
}
