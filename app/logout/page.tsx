"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";



export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      router.replace("/login");
    });
  }, [router]);

  return <p>Signing out…</p>;
}
