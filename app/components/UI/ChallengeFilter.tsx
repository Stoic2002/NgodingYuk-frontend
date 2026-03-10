"use client";
import { useState } from "react";
import { useTranslation } from "@/app/lib/i18n";
import { useRouter, useSearchParams } from "next/navigation";

export const ChallengeFilter = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentLanguage = searchParams.get("language") || "";
    const currentDifficulty = searchParams.get("difficulty") || "";
    const [search, setSearch] = useState(searchParams.get("search") || "");

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        if (search) {
            params.set("search", search);
        } else {
            params.delete("search");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <section className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:min-w-[240px]">
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder={t("common.searchPlaceholder") || "Cari tantangan..."}
                        className="bg-white border border-[#b1ada1] pl-10 pr-4 py-3 text-sm font-bold text-slate-900 uppercase tracking-widest focus:ring-0 focus:border-[#c15f3c] focus:outline-none w-full hover:bg-[#f4f3ee] transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1ada1] flex items-center">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                </form>

                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                        <select
                            value={currentLanguage}
                            onChange={(e) => handleFilterChange("language", e.target.value)}
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
                            value={currentDifficulty}
                            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
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
            </div>
        </section>
    );
};
