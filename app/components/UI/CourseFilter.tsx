"use client";
import { useState } from "react";
import { useTranslation } from "@/app/lib/i18n";
import { useRouter, useSearchParams } from "next/navigation";

export const CourseFilter = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default to the language param from the URL if present
    const currentLanguage = searchParams.get("language") || "";
    const [search, setSearch] = useState(searchParams.get("search") || "");

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1"); // Reset to page 1 on filter change
        if (val) {
            params.set("language", val);
        } else {
            params.delete("language");
        }
        router.push(`?${params.toString()}`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
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
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:min-w-[240px]">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder={t("common.searchPlaceholder") || "Cari kelas..."}
                    className="bg-white border border-[#b1ada1] pl-10 pr-4 py-3 text-sm font-bold text-slate-900 uppercase tracking-widest focus:ring-0 focus:border-[#c15f3c] focus:outline-none w-full transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1ada1] flex items-center">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
            </form>

            <div className="relative w-full sm:min-w-[180px]">
                <select
                    value={currentLanguage}
                    onChange={handleLanguageChange}
                    className="appearance-none bg-white border border-[#b1ada1] pl-5 pr-12 py-3 text-sm font-bold text-slate-900 uppercase tracking-widest focus:ring-0 focus:border-[#c15f3c] focus:outline-none cursor-pointer w-full transition-colors"
                >
                    <option value="">{t("course.allLanguage")}</option>
                    <option value="golang">Go</option>
                    <option value="sql">SQL</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#b1ada1] flex items-center">
                    <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                </div>
            </div>
        </div>
    );
};
