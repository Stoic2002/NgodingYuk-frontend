"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/app/lib/i18n";
import { courseAPI } from "@/app/lib/api";
import { CourseListItem } from "@/app/lib/types";
import { CourseCard } from "@/app/components/UI/CourseCard";
import { CourseFilter } from "@/app/components/UI/CourseFilter";

export const CourseListClient = () => {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const [courses, setCourses] = useState<CourseListItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const language = searchParams.get("language") || undefined;
                const level = searchParams.get("level") || undefined;

                const res = await courseAPI.list({ language, level });
                if (res.status === 200) {
                    setCourses(res.data.data || []);
                }
            } catch (e) {
                console.error("Failed to fetch courses:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [searchParams]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-[#b1ada1]">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3 uppercase">
                    <div className="w-12 h-12 bg-white flex items-center justify-center border border-[#b1ada1]">
                        <span className="material-symbols-outlined text-[#c15f3c] text-3xl">menu_book</span>
                    </div>
                    {t("course.title")}
                </h1>
                <CourseFilter />
            </div>

            {/* Course Cards */}
            {courses.length === 0 ? (
                <div className="bg-white border border-[#b1ada1] text-center py-16">
                    <p className="text-[#b1ada1] text-sm font-bold uppercase tracking-widest">No courses found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
};
