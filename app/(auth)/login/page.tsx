"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`
      }
    });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm card text-center space-y-6">
        <div>
          <div className="text-4xl">🛹</div>
          <h1 className="text-2xl font-bold mt-2">Skateflow</h1>
          <p className="text-sm text-white/60 mt-1">Find your rolê.</p>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Connecting…" : "Continue with Google"}
        </button>

        <p className="text-xs text-white/40">
          Add your Instagram on your profile after signing in.
        </p>
      </div>
    </main>
  );
}
