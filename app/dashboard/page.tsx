"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const router = useRouter();

  const supabase = createClient(); // call the function to get a client


  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        router.push("/login");
      }
    };

    checkUser();
  }, [router]);

  return <h1>Dashboard (protected)</h1>;
}
