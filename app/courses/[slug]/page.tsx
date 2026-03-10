"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import { useTranslation } from "@/app/lib/i18n";
import { useStore } from "@/app/lib/store";
import { courseAPI } from "@/app/lib/api";
import { CourseDetail } from "@/app/lib/types";
import { LanguageBadge, Skeleton, ProgressBar } from "@/app/components/UI";
import Link from "next/link";

export default function CourseDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { t } = useTranslation();
    const { isLoggedIn, isLoading } = useStore();

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        if (!slug) return;
        // Wait until global auth init (AppShell) finishes initializing token
        // so that course loading request sends the Authorization header.
        if (!isLoading) {
            loadCourse();
        }
    }, [slug, isLoading, isLoggedIn]);

    async function loadCourse() {
        setLoading(true);
        try {
            const res = await courseAPI.getBySlug(slug);
            setCourse(res.data.data);
        } catch {
            setCourse(null);
        }
        setLoading(false);
    }

    async function handleEnroll() {
        if (!isLoggedIn) return;
        setEnrolling(true);
        try {
            await courseAPI.enroll(slug);
            const res = await courseAPI.getBySlug(slug);
            const updatedCourse = res.data.data;
            if (updatedCourse?.lessons?.length > 0) {
                window.location.href = `/courses/${slug}/${updatedCourse.lessons[0].id}`;
            } else {
                setCourse(updatedCourse);
            }
        } catch (e) {
            console.error("Enrollment failed:", e);
        }
        setEnrolling(false);
    }

    if (loading) {
        return (
            <AppShell>
                <Skeleton height="60px" width="50%" className="mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} height="60px" />
                    ))}
                </div>
            </AppShell>
        );
    }

    if (!course) {
        return (
            <AppShell>
                <div className="text-center py-20">
                    <h1 className="text-xl font-bold">Course not found</h1>
                </div>
            </AppShell>
        );
    }

    const allLessons = course.modules?.flatMap(m => m.lessons) || [];
    const completedCount = allLessons.filter(l => l.completed).length || 0;
    const totalCount = allLessons.length || 0;
    const allLessonsComplete = completedCount === totalCount && totalCount > 0;

    return (
        <AppShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white border border-[#b1ada1] p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <LanguageBadge language={course.language} />
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-white text-[#c15f3c] border border-[#b1ada1] uppercase tracking-widest">
                            {course.level}
                        </span>
                        {course.has_certificate && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 bg-white text-[#c15f3c] border border-[#c15f3c] uppercase tracking-widest">
                                <span className="material-symbols-outlined text-[14px]">emoji_events</span> Certified
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-3 text-slate-900">{course.title}</h1>
                    {course.description && (
                        <p className="text-[#b1ada1] font-medium text-sm mb-6">{course.description}</p>
                    )}

                    {/* Enrollment / Progress */}
                    {!course.is_enrolled ? (
                        <button
                            onClick={handleEnroll}
                            disabled={enrolling || !isLoggedIn}
                            className="bg-[#c15f3c] hover:bg-[#a64e2f] text-white font-bold py-3 px-6 transition-all border border-[#c15f3c] w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-widest text-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">school</span>
                            {enrolling ? "Enrolling..." : isLoggedIn ? "Gabung Kelas" : "Login untuk Gabung"}
                        </button>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 border border-[#b1ada1]">
                            <span className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-white text-[#c15f3c] border border-[#c15f3c] whitespace-nowrap uppercase tracking-widest">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span> Kelas Saya
                            </span>
                            <div className="flex-1 w-full mt-1">
                                <ProgressBar
                                    current={completedCount}
                                    max={totalCount}
                                    label={`${completedCount}/${totalCount} ${t("course.lessons")}`}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Modules List */}
                {course.is_enrolled && (
                    <div className="space-y-8">
                        {course.modules?.map((module) => (
                            <div key={module.id} className="space-y-0 border border-[#b1ada1] bg-white">
                                <div className="p-4 border-b border-[#b1ada1] bg-[#f4f3ee] flex justify-between items-center">
                                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                                        Module: {module.title}
                                    </h2>
                                    <span className="text-[10px] font-bold text-[#b1ada1] uppercase tracking-widest">
                                        {module.lessons.length} {t("course.lessons")}
                                    </span>
                                </div>
                                {module.lessons.map((lesson, idx) => {
                                    const isLast = idx === module.lessons.length - 1;
                                    if (lesson.is_locked) {
                                        return (
                                            <div
                                                key={lesson.id}
                                                className={`bg-[#f4f3ee] flex items-center justify-between p-5 opacity-70 cursor-not-allowed ${!isLast ? 'border-b border-[#b1ada1]' : ''}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 flex items-center justify-center bg-white text-[#b1ada1] border border-[#b1ada1]">
                                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                                    </div>
                                                    <h3 className="font-bold text-[#b1ada1] text-sm uppercase tracking-tight">{lesson.title}</h3>
                                                </div>
                                                <span className="text-[10px] font-bold text-[#b1ada1] uppercase tracking-widest bg-white border border-[#b1ada1] px-2 py-1">Locked</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={lesson.id}
                                            href={`/courses/${slug}/${lesson.id}`}
                                            className={`bg-white flex items-center justify-between p-5 hover:bg-[#f4f3ee] transition-colors no-underline group ${!isLast ? 'border-b border-[#b1ada1]' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 flex items-center justify-center text-sm font-bold border ${lesson.completed
                                                    ? "bg-white border-[#c15f3c] text-[#c15f3c]"
                                                    : "bg-white border-[#b1ada1] text-[#1c1917]"
                                                    }`}>
                                                    {lesson.completed ? <span className="material-symbols-outlined text-[20px]">check_circle</span> : <span>{lesson.order_index}</span>}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 group-hover:text-[#c15f3c] transition-colors text-sm uppercase tracking-tight">
                                                        {lesson.title}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="flex items-center gap-1 text-[#c15f3c] text-xs font-bold bg-white px-2 py-1 border border-[#c15f3c]">
                                                    <span className="material-symbols-outlined text-[14px]">bolt</span> {lesson.xp_reward}
                                                </span>
                                                {lesson.completed ? (
                                                    <span className="text-[10px] font-bold text-[#c15f3c] border border-[#c15f3c] px-2 py-1 uppercase tracking-widest hidden sm:inline-block">{t("course.completed")}</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-[#b1ada1] uppercase tracking-widest hidden sm:inline-block border border-transparent px-2 py-1">{t("course.startLesson")}</span>
                                                )}
                                                <span className="material-symbols-outlined text-[#b1ada1] group-hover:text-[#c15f3c] transition-colors">chevron_right</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                {/* Exam Section */}
                {course.is_enrolled && allLessonsComplete && !course.has_certificate && (
                    <div className="bg-white border border-[#c15f3c] p-8 text-center relative overflow-hidden">
                        <span className="material-symbols-outlined text-[48px] text-[#c15f3c] mb-4 relative z-10">school</span>
                        <h2 className="text-xl font-bold mb-2 text-slate-900 relative z-10 uppercase tracking-widest">Semua Materi Selesai! 🎉</h2>
                        <p className="text-sm text-[#b1ada1] mb-6 relative z-10 font-bold">
                            Kamu sudah menyelesaikan semua pelajaran. Sekarang saatnya ujian akhir!
                        </p>
                        <Link
                            href={`/courses/${slug}/exam`}
                            className="bg-[#c15f3c] hover:bg-[#a64e2f] text-white font-bold py-3 px-6 border border-[#c15f3c] transition-all inline-flex items-center gap-2 relative z-10 uppercase tracking-widest text-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">menu_book</span> Mulai Ujian Akhir
                        </Link>
                    </div>
                )}

                {/* Certificate Badge */}
                {course.has_certificate && (
                    <div className="bg-white border border-[#c15f3c] p-8 text-center relative overflow-hidden">
                        <span className="material-symbols-outlined text-[48px] text-[#c15f3c] mb-4 relative z-10">emoji_events</span>
                        <h2 className="text-xl font-bold text-[#c15f3c] mb-2 relative z-10 uppercase tracking-widest">Sertifikat Diperoleh!</h2>
                        <p className="text-sm text-[#b1ada1] font-bold relative z-10">
                            Kamu telah lulus ujian akhir kursus ini. Selamat! 🏆
                        </p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
