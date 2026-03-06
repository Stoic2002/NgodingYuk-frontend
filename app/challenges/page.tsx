"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import { useTranslation } from "@/app/lib/i18n";
import { challengeAPI } from "@/app/lib/api";
import { ChallengeListItem } from "@/app/lib/types";
import { DifficultyBadge, LanguageBadge, Skeleton } from "@/app/components/UI";
import Link from "next/link";

export default function TantanganPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    useEffect(() => {
        setPage(1);
    }, [language, difficulty]);

    useEffect(() => {
        loadChallenges();
    }, [language, difficulty, page]);

    async function loadChallenges() {
        setLoading(true);
        try {
            const res = await challengeAPI.list({
                language: language || undefined,
                difficulty: difficulty || undefined,
                limit: limit,
                offset: (page - 1) * limit,
            });
            setChallenges(res.data.data || []);

            // if meta is returned by backend
            if (res.data.meta && res.data.meta.total_pages) {
                setTotalPages(res.data.meta.total_pages);
            } else {
                // simple fallback if total isn't provided directly
                setTotalPages(res.data.data?.length === limit ? page + 1 : page);
            }
        } catch {
            setChallenges([]);
        }
        setLoading(false);
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-6xl w-full">
                {/* Hero Banner */}
                <section className="mb-12 relative h-80 overflow-hidden border border-[#b1ada1] group bg-[#f4f3ee]">
                    <img
                        alt="Code Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA56iB2oRpF5e8rDC_t-Y9X6A8c3-ImtjMoyUzVnreJu5jByZb-uyukDUVjvgjfuRH5mR72kR9VBIs3b7w-Q9DRq0HN0l_fxhSp1b4s5A9KGOwst-E7ZT1UGSldCaCjHroyreVukD4Yh5Fe1HT4wYfHMb8zGlgu17Rlj8RqvHES45OHHlL9SUtp0HqJVG_C05as-lyK_sU4I_mnbwfMopWTH5kBJmMEew37vFCw38_wSeTJdm7NQKoSdnWI0JZofymYArsJtmVn1HaF"
                    />
                    <div className="absolute inset-0 bg-white/70"></div>
                    <div className="relative z-10 h-full flex flex-col justify-center px-12 space-y-4">
                        <span className="bg-white border border-slate-900 text-slate-900 px-3 py-1 text-xs font-bold w-fit uppercase tracking-wider">
                            Tantangan Minggu Ini
                        </span>
                        <h2 className="text-5xl font-extrabold text-slate-900 leading-tight uppercase tracking-tight">{t("challenge.heroTitle")}</h2>
                        <p className="text-slate-900 font-bold max-w-lg text-lg uppercase tracking-tight">
                            Optimalkan pemahaman datamu dengan menyelesaikan berbagai tantangan coding.
                        </p>
                        <div className="pt-4">
                            <button className="bg-[#c15f3c] text-white border border-[#c15f3c] px-8 py-3 font-bold hover:bg-[#a64e2f] transition-all flex items-center space-x-2 uppercase tracking-widest text-sm">
                                <span>{t("challenge.startNow")}</span>
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* FilterBar */}
                <section className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="appearance-none bg-white border border-[#b1ada1] pl-5 pr-12 py-3 text-sm font-bold text-slate-900 focus:border-slate-900 cursor-pointer w-full hover:bg-[#f4f3ee] transition-all outline-none uppercase tracking-widest"
                            >
                                <option value="">{t("challenge.allLanguage")}</option>
                                <option value="golang">Go</option>
                                <option value="sql">SQL</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900 flex items-center">
                                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                            </div>
                        </div>
                        <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="appearance-none bg-white border border-[#b1ada1] pl-5 pr-12 py-3 text-sm font-bold text-slate-900 focus:border-slate-900 cursor-pointer w-full hover:bg-[#f4f3ee] transition-all outline-none uppercase tracking-widest"
                            >
                                <option value="">{t("challenge.allDifficulty")}</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900 flex items-center">
                                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Challenge Table */}
                {loading ? (
                    <div className="bg-white border border-[#b1ada1]">
                        <div className="p-6 grid gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} height="60px" />
                            ))}
                        </div>
                    </div>
                ) : challenges.length === 0 ? (
                    <div className="bg-white border border-[#b1ada1] text-center py-16">
                        <p className="text-slate-900 font-bold text-sm tracking-widest uppercase">No challenges found.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-[#b1ada1]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-[#b1ada1]">
                                        <th className="px-6 py-4 text-sm font-bold tracking-widest uppercase text-slate-900">{t("challenge.tableChallenge")}</th>
                                        <th className="px-6 py-4 text-sm font-bold tracking-widest uppercase text-slate-900">{t("challenge.tableCategory")}</th>
                                        <th className="px-6 py-4 text-sm font-bold tracking-widest uppercase text-slate-900">{t("challenge.tableLevel")}</th>
                                        <th className="px-6 py-4 text-sm font-bold tracking-widest uppercase text-slate-900 text-center">{t("challenge.tableStatus")}</th>
                                        <th className="px-6 py-4 text-sm font-bold tracking-widest uppercase text-slate-900 text-center">{t("challenge.tableXp")}</th>
                                        <th className="px-6 py-4 text-sm font-bold tracking-widest uppercase text-slate-900 text-right">{t("challenge.tableAction")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#b1ada1]">
                                    {challenges.map((challenge) => {
                                        const isSql = challenge.language.toLowerCase() === "sql";
                                        const langText = isSql ? "SQL Dasar" : "Go Dasar";

                                        const diffLower = challenge.difficulty.toLowerCase();
                                        const diffStyle = diffLower === "easy" ? "bg-[#b1ada1] text-white"
                                            : diffLower === "medium" ? "bg-[#c3603c]/70 text-white"
                                                : diffLower === "hard" ? "bg-[#c3603c] text-white"
                                                    : "bg-slate-400 text-white";

                                        const diffText = diffLower === "easy" ? "Mudah" : diffLower === "medium" ? "Menengah" : "Sulit";

                                        return (
                                            <tr
                                                key={challenge.id}
                                                onClick={() => router.push(`/challenges/${challenge.slug}`)}
                                                className="hover:bg-[#f4f3ee] transition-colors cursor-pointer group bg-white"
                                            >
                                                <td className="px-6 py-4">
                                                    <h3 className="font-bold text-slate-900 text-sm transition-colors uppercase tracking-tight">
                                                        {challenge.title}
                                                    </h3>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-4 py-1.5 border border-[#b1ada1] text-[11px] font-bold text-slate-900 bg-white uppercase tracking-widest">
                                                        {langText}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-4 py-1.5 border border-[#c15f3c] text-[11px] font-bold text-[#c15f3c] bg-white uppercase tracking-widest">
                                                        {diffText}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {challenge.is_completed ? (
                                                        <span className="material-symbols-outlined text-[#c15f3c] text-[18px] font-bold">
                                                            check
                                                        </span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-[#b1ada1]/30 text-[18px] font-bold">
                                                            check
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center bg-white text-slate-900 font-bold text-[11px] px-3 py-1.5 border border-[#b1ada1] uppercase tracking-widest">
                                                        {challenge.xp_reward} XP
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right pr-6">
                                                    <span className="material-symbols-outlined text-slate-900 transition-colors text-[20px]">
                                                        chevron_right
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="bg-white border-t border-[#b1ada1] p-4 flex items-center justify-between">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="bg-white border border-[#b1ada1] text-slate-900 px-4 py-2 text-sm font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#f4f3ee]"
                            >
                                {t("challenge.previousPage")}
                            </button>
                            <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                                {t("challenge.page")} {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="bg-white border border-[#b1ada1] text-slate-900 px-4 py-2 text-sm font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#f4f3ee]"
                            >
                                {t("challenge.nextPage")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
