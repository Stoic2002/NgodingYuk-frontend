"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/app/lib/i18n";
import { courseAPI } from "@/app/lib/api";
import { CourseListItem } from "@/app/lib/types";
import { CourseCard } from "@/app/components/UI/CourseCard";
import { CourseFilter } from "@/app/components/UI/CourseFilter";
import { CoursePagination } from "@/app/components/UI/CoursePagination";
import { Skeleton } from "@/app/components/UI";

export const CourseListClient = () => {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const [courses, setCourses] = useState<CourseListItem[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const language = searchParams.get("language") || undefined;
                const level = searchParams.get("level") || undefined;
                const search = searchParams.get("search") || undefined;
                const pageParam = searchParams.get("page") || "1";
                const limit = 10;
                const page = parseInt(pageParam, 10) || 1;
                const offset = (page - 1) * limit;

                const res = await courseAPI.list({ language, level, search, limit, offset });
                if (res.status === 200) {
                    const data = res.data;
                    setCourses(data.data || []);
                    if (data.meta && data.meta.total_pages) {
                        setTotalPages(data.meta.total_pages);
                    } else {
                        setTotalPages((data.data || []).length === limit ? page + 1 : page);
                    }
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
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Skeleton height="300px" />
                    <Skeleton height="300px" />
                    <Skeleton height="300px" />
                    <Skeleton height="300px" />
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-white border border-[#b1ada1] text-center py-16">
                    <p className="text-[#b1ada1] text-sm font-bold uppercase tracking-widest">No courses found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                    <CoursePagination totalPages={totalPages} />
                </div>
            )}
        </div>
    );
};
