// ===========================================
// useAuth Hook — DataInsight Mini
// ===========================================
// Client-side hook untuk auth state.
// Subscribe ke perubahan auth session.

"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthState } from "@/features/auth";

export function useAuth(): AuthState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  const supabase = createClient();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Subscribe ke auth state changes — handles initial state + updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user
          ? { id: session.user.id, email: session.user.email ?? "" }
          : null,
        loading: false,
      });
    });

    // Fallback: if onAuthStateChange doesn't fire (no session), clear loading
    if (!initializedRef.current) {
      initializedRef.current = true;
      supabase.auth.getUser().then(({ data: { user } }) => {
        setState((prev) => {
          if (prev.loading) {
            return {
              user: user
                ? { id: user.id, email: user.email ?? "" }
                : null,
              loading: false,
            };
          }
          return prev;
        });
      });
    }

    return () => subscription.unsubscribe();
  }, [supabase]);

  const refresh = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setState({
      user: user
        ? { id: user.id, email: user.email ?? "" }
        : null,
      loading: false,
    });
  };

  return { ...state, refresh };
}
