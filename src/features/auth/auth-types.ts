// ===========================================
// Auth Types — DataInsight Mini
// ===========================================

/** Current auth state for client-side */
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

/** Simplified user object for client-side */
export interface AuthUser {
  id: string;
  email: string;
}

/** Server action form state for login */
export interface LoginFormState {
  error?: string;
}

/** Server action form state for signup */
export interface SignupFormState {
  error?: string;
  fieldErrors?: {
    fullName?: string[];
    email?: string[];
    password?: string[];
  };
}

/** Server action form state for profile update */
export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

/** User profile from profiles table */
export interface UserProfile {
  id: string;
  full_name: string | null;
  business_name: string | null;
  business_type: string | null;
  created_at: string;
  updated_at: string;
}
