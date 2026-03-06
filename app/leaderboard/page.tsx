"use client";
import { useEffect, useState } from "react";
import AppShell from "@/app/components/AppShell";
import { useTranslation } from "@/app/lib/i18n";
import { leaderboardAPI } from "@/app/lib/api";
import { LeaderboardEntry } from "@/app/lib/types";
import { Skeleton } from "@/app/components/UI";

export default function LeaderboardPage() {
    const { t } = useTranslation();
    const [tab, setTab] = useState<"weekly" | "alltime">("weekly");
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, [tab]);

    async function loadLeaderboard() {
        setLoading(true);
        try {
            const res = tab === "weekly"
                ? await leaderboardAPI.getWeekly()
                : await leaderboardAPI.getAllTime();
            setEntries(res.data.data || []);
        } catch {
            setEntries([]);
        }
        setLoading(false);
    }

    const rankColors: Record<number, string> = {
        1: "text-[#c15f3c] bg-white border-[#c15f3c]",
        2: "text-slate-900 bg-[#f4f3ee] border-[#b1ada1]",
        3: "text-[#1c1917] bg-white border-[#b1ada1]",
    };

    return (
        <AppShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center bg-white border border-[#b1ada1] p-8">
                    <div className="w-16 h-16 bg-white flex items-center justify-center border border-[#b1ada1] mx-auto mb-4">
                        <span className="material-symbols-outlined text-[#c15f3c] text-4xl">trophy</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-6 uppercase">
                        {t("leaderboard.title")}
                    </h1>

                    {/* Tabs */}
                    <div className="inline-flex bg-white border border-[#b1ada1] p-0 gap-0">
                        <button
                            onClick={() => setTab("weekly")}
                            className={`px-6 py-2.5 text-sm font-bold transition-all border-none cursor-pointer uppercase tracking-widest ${tab === "weekly"
                                ? "bg-[#c15f3c] text-white"
                                : "bg-transparent text-[#b1ada1] hover:text-slate-900"
                                }`}
                        >
                            {t("leaderboard.weekly")}
                        </button>
                        <div className="w-px bg-[#b1ada1]"></div>
                        <button
                            onClick={() => setTab("alltime")}
                            className={`px-6 py-2.5 text-sm font-bold transition-all border-none cursor-pointer uppercase tracking-widest ${tab === "alltime"
                                ? "bg-[#c15f3c] text-white"
                                : "bg-transparent text-[#b1ada1] hover:text-slate-900"
                                }`}
                        >
                            {t("leaderboard.allTime")}
                        </button>
                    </div>
                </div>

                {/* Leaderboard List */}
                {loading ? (
                    <div className="space-y-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} height="72px" className="border-b border-[#b1ada1] last:border-0" />
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <div className="bg-white border border-[#b1ada1] text-center py-16">
                        <p className="text-[#b1ada1] text-sm uppercase tracking-widest font-bold">No data yet. Be the first on the board!</p>
                    </div>
                ) : (
                    <div className="space-y-0 border border-[#b1ada1] bg-white">
                        {/* Full List */}
                        <div className="flex flex-col">
                            {/* Table Header */}
                            <div className="hidden sm:flex items-center justify-between p-4 border-b border-[#b1ada1] bg-[#f4f3ee]">
                                <div className="text-[10px] font-bold text-[#b1ada1] uppercase tracking-widest w-16 text-center">Rank</div>
                                <div className="text-[10px] font-bold text-[#b1ada1] uppercase tracking-widest flex-1 px-4">User</div>
                                <div className="text-[10px] font-bold text-[#b1ada1] uppercase tracking-widest w-32 text-right">Score</div>
                            </div>
                            {entries.map((entry, index) => {
                                const isLast = index === entries.length - 1;
                                return (
                                    <div
                                        key={entry.user_id}
                                        className={`bg-white flex items-center justify-between p-4 transition-colors hover:bg-[#f4f3ee] ${!isLast ? 'border-b border-[#b1ada1]' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-16 flex justify-center">
                                                <div className={`w-8 h-8 flex items-center justify-center text-sm font-bold border ${entry.rank <= 3
                                                    ? rankColors[entry.rank]
                                                    : "bg-white border-[#b1ada1] text-[#b1ada1]"
                                                    }`}>
                                                    {entry.rank}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="font-bold text-slate-900 text-sm uppercase tracking-tight">{entry.username}</div>
                                                <div className="flex items-center gap-1 text-[#b1ada1] font-mono text-xs mt-0.5 uppercase">
                                                    <span className="material-symbols-outlined text-[12px]">star</span> Lvl {entry.level}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-32 flex justify-end">
                                            <div className="flex items-center gap-1.5 text-[#c15f3c] text-sm font-bold bg-white px-3 py-1.5 border border-[#c15f3c]">
                                                <span className="material-symbols-outlined text-[16px]">bolt</span> {entry.xp} XP
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
