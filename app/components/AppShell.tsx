"use client";
import { useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import { XPPopup, LevelUpOverlay } from "@/app/components/UI";
import { useStore } from "@/app/lib/store";
import { Loader2 } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { initAuth, isLoading } = useStore();

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
                <Loader2 size={40} className="text-accent animate-spin mb-4" />
                <div className="text-sm font-medium text-text-muted">Loading your workspace...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden relative">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative w-full transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 w-full">
                    {children}
                </div>
            </main>
            <XPPopup />
            <LevelUpOverlay />
        </div>
    );
}
