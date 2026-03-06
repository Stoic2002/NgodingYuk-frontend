"use client";
import { useStore } from "@/app/lib/store";

export function XPPopup() {
    const { xpPopup } = useStore();
    if (!xpPopup.visible) return null;
    return (
        <div className="fixed top-24 right-10 z-50 xp-popup flex items-center gap-2 bg-white border border-[#b1ada1] px-4 py-2 text-slate-900 font-bold">
            <span className="material-symbols-outlined text-[#c15f3c] text-[20px]">bolt</span>
            <span>+{xpPopup.amount} XP</span>
        </div>
    );
}

export function LevelUpOverlay() {
    const { levelUpVisible, user } = useStore();
    if (!levelUpVisible || !user) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4f3ee]/80 backdrop-blur-sm">
            <div className="text-center anim-fade-up bg-white p-10 border border-[#b1ada1] max-w-sm mx-auto">
                <div className="w-20 h-20 mx-auto bg-white border border-[#c15f3c] flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[#c15f3c] text-4xl">emoji_events</span>
                </div>
                <div className="text-[#c15f3c] font-bold text-2xl mb-2 tracking-tight uppercase">LEVEL UP!</div>
                <div className="text-slate-900 text-xl font-medium mb-1 border-t border-b border-[#b1ada1] py-2">
                    You reached Level {user.level}
                </div>
                <div className="text-[#b1ada1] text-sm mt-4 font-mono uppercase">Keep up the great work!</div>
            </div>
        </div>
    );
}

export function ProgressBar({ current, max, label }: { current: number; max: number; label?: string; }) {
    const pct = Math.min((current / max) * 100, 100);
    return (
        <div>
            {label && (
                <div className="flex justify-between mb-2">
                    <span className="text-xs font-semibold text-[#b1ada1] uppercase tracking-wider">
                        {label}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#b1ada1]">
                        {current}/{max}
                    </span>
                </div>
            )}
            <div className="w-full bg-white h-2 border border-[#b1ada1] overflow-hidden">
                <div className="bg-[#c15f3c] h-full transition-all duration-500 ease-out border-r border-[#b1ada1]" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export function StreakCounter({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <div className="flex items-center gap-3 bg-white border border-[#b1ada1] px-4 py-3">
            <div className="p-2 border border-[#c15f3c] bg-[#ffffff] flex items-center">
                <span className="material-symbols-outlined text-[#c15f3c]">local_fire_department</span>
            </div>
            <div>
                <div className="text-sm font-bold text-[#1c1917] tracking-tight uppercase">{count} DAY STREAK</div>
                <div className="text-xs text-[#c15f3c] font-medium mt-0.5 uppercase">You're on fire!</div>
            </div>
        </div>
    );
}

export function Badge({ label, value, icon, color = "accent" }: { label: string; value: string | number; icon: string; color?: "accent" | "warm" | "danger" | "primary"; }) {
    const colors = {
        accent: "border-[#c15f3c]",
        warm: "border-[#c15f3c]",
        danger: "border-[#c15f3c]",
        primary: "border-[#b1ada1]",
    };
    const textColors = {
        accent: "text-[#c15f3c]",
        warm: "text-[#c15f3c]",
        danger: "text-[#c15f3c]",
        primary: "text-[#1c1917]",
    };
    return (
        <div className="bg-white border border-[#b1ada1] px-4 py-3 flex items-center gap-3 transition-colors hover:bg-[#f4f3ee]">
            <div className={`p-2 border bg-white flex items-center ${colors[color]}`}>
                <span className={`material-symbols-outlined text-[20px] ${textColors[color]}`}>{icon}</span>
            </div>
            <div>
                <div className={`text-base font-bold text-[#1c1917] font-mono`}>{value}</div>
                <div className="text-[10px] font-bold text-[#b1ada1] uppercase tracking-widest mt-0.5">{label}</div>
            </div>
        </div>
    );
}

export function Skeleton({ width = "100%", height = "20px", className = "" }: { width?: string; height?: string; className?: string; }) {
    return (
        <div className={`bg-[#e5e5e5] border border-[#b1ada1] animate-pulse ${className}`} style={{ width, height }} />
    );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const config = {
        easy: { bg: "bg-white", border: "border-[#b1ada1]", text: "text-[#1c1917]", label: "Easy" },
        medium: { bg: "bg-white", border: "border-[#c15f3c]", text: "text-[#c15f3c]", label: "Medium" },
        hard: { bg: "bg-[#c15f3c]", border: "border-[#1c1917]", text: "text-white", label: "Hard" },
    };
    const c = config[difficulty as keyof typeof config] || config.easy;
    return (
        <span className={`${c.bg} border ${c.border} ${c.text} text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest`}>
            {c.label}
        </span>
    );
}

export function LanguageBadge({ language }: { language: string }) {
    const config: Record<string, { bg: string; border: string; text: string; label: string }> = {
        golang: { bg: "bg-white", border: "border-[#b1ada1]", text: "text-[#1c1917]", label: "GO" },
        go: { bg: "bg-white", border: "border-[#b1ada1]", text: "text-[#1c1917]", label: "GO" },
        sql: { bg: "bg-[#1c1917]", border: "border-[#1c1917]", text: "text-white", label: "SQL" },
    };
    const c = config[language.toLowerCase()] || { bg: "bg-white", border: "border-[#b1ada1]", text: "text-[#1c1917]", label: language };
    return (
        <span className={`${c.bg} border ${c.border} ${c.text} text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest`}>
            {c.label}
        </span>
    );
}
