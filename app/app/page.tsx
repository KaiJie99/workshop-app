import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import BrandHeader from "@/components/BrandHeader";
import BackendNotConnected from "@/components/BackendNotConnected";
import PocketGoalsClient from "@/components/PocketGoalsClient";

// Never statically cache this protected page — always re-check auth on the
// server for every request (including Back/Forward navigation).
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AppPage() {
  const supabase = await getSupabaseServerClient();

  // Modules 1–4: no backend yet — show the page shell, not a crash.
  if (!supabase) {
    return (
      <div className="min-h-screen bg-white">
        <BrandHeader />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-2xl font-bold">Your goals &amp; expenses</h1>
          <div className="mt-4">
            <BackendNotConnected />
          </div>
        </main>
      </div>
    );
  }

  // Identity is verified ON THE SERVER — signed-out visitors never see this page.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <PocketGoalsClient userId={user.id} userEmail={user.email ?? ""} />;
}
