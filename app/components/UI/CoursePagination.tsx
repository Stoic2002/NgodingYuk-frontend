"use client";

import { useTranslation } from "@/app/lib/i18n";
import { useRouter, useSearchParams } from "next/navigation";

export const CoursePagination = ({ totalPages }: { totalPages: number }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default to page 1 from search params
    const currentPageStr = searchParams.get("page");
    const currentPage = currentPageStr ? parseInt(currentPageStr, 10) : 1;

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="bg-white border-t border-[#b1ada1] p-4 flex items-center justify-between">
            <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="bg-white border border-[#b1ada1] text-slate-900 px-4 py-2 text-sm font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#f4f3ee]"
            >
                {t("challenge.previousPage") || "Sebelumnya"}
            </button>
            <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                {t("challenge.page") || "Halaman"} {currentPage} / {totalPages}
            </span>
            <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="bg-white border border-[#b1ada1] text-slate-900 px-4 py-2 text-sm font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#f4f3ee]"
            >
                {t("challenge.nextPage") || "Selanjutnya"}
            </button>
        </div>
    );
};
