"use client";

import { useTranslation } from "@/app/lib/i18n";
import { CourseListItem } from "@/app/lib/types";
import { CourseCard } from "@/app/components/UI/CourseCard";
import { CourseFilter } from "@/app/components/UI/CourseFilter";

interface CourseListClientProps {
    courses: CourseListItem[];
}

export const CourseListClient = ({ courses }: CourseListClientProps) => {
    const { t } = useTranslation();

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
