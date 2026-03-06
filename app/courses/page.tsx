"use client";
import { useEffect, useState } from "react";
import AppShell from "@/app/components/AppShell";
import { useTranslation } from "@/app/lib/i18n";
import { courseAPI } from "@/app/lib/api";
import { CourseListItem } from "@/app/lib/types";
import { LanguageBadge, Skeleton } from "@/app/components/UI";
import Link from "next/link";

export default function KelasPage() {
    const { t } = useTranslation();
    const [courses, setCourses] = useState<CourseListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState("");

    useEffect(() => {
        loadCourses();
    }, [language]);

    async function loadCourses() {
        setLoading(true);
        try {
            const res = await courseAPI.list({
                language: language || undefined,
            });
            setCourses(res.data.data || []);
        } catch {
            setCourses([]);
        }
        setLoading(false);
    }

    const levelColors: Record<string, string> = {
        beginner: "bg-white border-[#b1ada1] text-[#c15f3c]",
        intermediate: "bg-[#f4f3ee] border-[#b1ada1] text-[#c15f3c]",
        advanced: "bg-[#1c1917] border-[#1c1917] text-[#f4f3ee]",
    };

    return (
        <AppShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-[#b1ada1]">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3 uppercase">
                        <div className="w-12 h-12 bg-white flex items-center justify-center border border-[#b1ada1]">
                            <span className="material-symbols-outlined text-[#c15f3c] text-3xl">menu_book</span>
                        </div>
                        {t("course.title")}
                    </h1>
                    <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
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

                {/* Course Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} height="160px" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="bg-white border border-[#b1ada1] text-center py-16">
                        <p className="text-[#b1ada1] text-sm font-bold uppercase tracking-widest">No courses found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="bg-white border border-[#b1ada1] p-6 hover:border-[#c15f3c] hover:bg-[#f4f3ee] transition-colors no-underline group block relative"
                            >
                                <div className="relative z-10 flex items-start justify-between mb-4">
                                    <div className="flex gap-2">
                                        <LanguageBadge language={course.language} />
                                        <span className={`text-[10px] font-bold px-2.5 py-1 border uppercase tracking-widest ${levelColors[course.level] || "bg-white border-[#b1ada1] text-[#b1ada1]"}`}>
                                            {course.level}
                                        </span>
                                    </div>
                                    <span className="material-symbols-outlined text-[#b1ada1] group-hover:text-[#c15f3c] transition-colors">arrow_forward</span>
                                </div>
                                <h3 className="font-bold text-xl text-slate-900 group-hover:text-[#c15f3c] transition-colors mb-2 relative z-10 uppercase tracking-tight">
                                    {course.title}
                                </h3>
                                {course.description && (
                                    <p className="text-sm text-[#b1ada1] line-clamp-2 relative z-10 font-medium">
                                        {course.description}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
