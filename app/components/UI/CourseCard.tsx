import Link from "next/link";
import { CourseListItem } from "@/app/lib/types";
import { LanguageBadge } from "@/app/components/UI";

export const CourseCard = ({ course }: { course: CourseListItem }) => {
    const levelColors: Record<string, string> = {
        beginner: "bg-white border-[#b1ada1] text-[#c15f3c]",
        intermediate: "bg-[#f4f3ee] border-[#b1ada1] text-[#c15f3c]",
        advanced: "bg-[#1c1917] border-[#1c1917] text-[#f4f3ee]",
    };

    return (
        <Link
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
    );
};
