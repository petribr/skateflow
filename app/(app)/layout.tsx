import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 bg-ink/80 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-4 py-3">
          <Link href="/feed" className="text-lg font-bold">🛹 Skateflow</Link>
          <Link href="/sessions/new" className="btn-primary">+ Rolê</Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-4">{children}</main>
    </div>
  );
}
