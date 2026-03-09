"use client";

import { useTranslation } from "@/app/lib/i18n";
import { useRouter, useSearchParams } from "next/navigation";

export const CourseFilter = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default to the language param from the URL if present
    const currentLanguage = searchParams.get("language") || "";

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (val) {
            params.set("language", val);
        } else {
            params.delete("language");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="relative w-full sm:w-auto sm:min-w-[180px]">
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
    );
};
