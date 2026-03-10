"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/app/lib/i18n";
import { challengeAPI } from "@/app/lib/api";
import { ChallengeListItem } from "@/app/lib/types";
import { ChallengeFilter } from "@/app/components/UI/ChallengeFilter";
import { ChallengePagination } from "@/app/components/UI/ChallengePagination";
import { Skeleton } from "@/app/components/UI";

export const ChallengeListClient = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            setIsLoading(true);
            try {
                const language = searchParams.get("language") || "";
                const difficulty = searchParams.get("difficulty") || "";
                const search = searchParams.get("search") || "";
                const pageParam = searchParams.get("page") || "1";
                const limit = 10;
                const page = parseInt(pageParam, 10) || 1;
                const offset = (page - 1) * limit;

                const res = await challengeAPI.list({ language, difficulty, search, limit, offset });

                if (res.status === 200) {
                    const data = res.data;
                    setChallenges(data.data || []);
                    if (data.meta && data.meta.total_pages) {
                        setTotalPages(data.meta.total_pages);
                    } else {
                        setTotalPages((data.data || []).length === limit ? page + 1 : page);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch challenges:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChallenges();
    }, [searchParams]);

    return (
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

            <ChallengeFilter />

            {/* Challenge Table */}
            {isLoading ? (
                <div className="bg-white border border-[#b1ada1] p-6 space-y-4">
                    <div className="flex justify-between border-b border-[#b1ada1] pb-4">
                        <Skeleton width="150px" height="24px" />
                        <Skeleton width="100px" height="24px" />
                        <Skeleton width="100px" height="24px" />
                        <Skeleton width="60px" height="24px" />
                        <Skeleton width="60px" height="24px" />
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} height="60px" className="border-b border-[#b1ada1] last:border-0" />
                    ))}
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

                    <ChallengePagination totalPages={totalPages} />
                </div>
            )}
        </div>
    );
};
