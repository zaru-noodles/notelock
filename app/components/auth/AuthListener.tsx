"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// This listens for auth changes on the client and refresh the router when the session changes
// e.g. when you logout in another tab, this will recieve that session change and refresh the router

export function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
