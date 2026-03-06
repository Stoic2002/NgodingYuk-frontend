"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to /courses as per request
    router.replace("/courses");
  }, [router]);

  return (
    <AppShell>
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
        <Loader2 size={40} className="text-accent animate-spin mb-4" />
      </div>
    </AppShell>
  );
}
