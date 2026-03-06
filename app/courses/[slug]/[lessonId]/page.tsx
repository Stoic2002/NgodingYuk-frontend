"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import { useTranslation } from "@/app/lib/i18n";
import { useStore } from "@/app/lib/store";
import { courseAPI } from "@/app/lib/api";
import { LessonDetail } from "@/app/lib/types";
import { Skeleton } from "@/app/components/UI";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import {
    BookOpen,
    CheckCircle,
    Zap,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";

export default function LessonPage() {
    const params = useParams();
    const slug = params.slug as string;
    const lessonId = params.lessonId as string;
    const router = useRouter();
    const { t } = useTranslation();
    const { isLoggedIn, refreshProfile, showXPGain } = useStore();

    const [lesson, setLesson] = useState<LessonDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slug && lessonId) loadLesson();
    }, [slug, lessonId]);

    async function loadLesson() {
        setLoading(true);
        setError(null);
        try {
            const res = await courseAPI.getLessonDetail(slug, lessonId);
            setLesson(res.data);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr?.response?.status === 403) {
                setError("Lesson ini masih terkunci. Selesaikan lesson sebelumnya terlebih dahulu.");
            } else {
                setLesson(null);
            }
        }
        setLoading(false);
    }

    const handleCompleteLesson = useCallback(async () => {
        if (!isLoggedIn) return;
        setCompleting(true);
        try {
            await courseAPI.completeLesson(slug, lessonId);
            setCompleted(true);
            refreshProfile();
        } catch { }
        setCompleting(false);
    }, [isLoggedIn, slug, lessonId, refreshProfile]);

    if (loading) {
        return (
            <AppShell>
                <Skeleton height="40px" width="40%" className="mb-4" />
                <Skeleton height="400px" />
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell>
                <div className="text-center py-20 space-y-4">
                    <div className="text-4xl">🔒</div>
                    <h1 className="text-xl font-bold">{t("course.lessonLocked")}</h1>
                    <p className="text-text-secondary text-sm">{error}</p>
                    <button
                        onClick={() => router.push(`/courses/${slug}`)}
                        className="btn btn-secondary"
                    >
                        <ArrowLeft size={16} /> Kembali ke Kursus
                    </button>
                </div>
            </AppShell>
        );
    }

    if (!lesson) {
        return (
            <AppShell>
                <div className="text-center py-20">
                    <h1 className="text-xl font-bold">{t("course.lessonNotFound")}</h1>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="space-y-6">
                {/* Back link */}
                <button
                    onClick={() => router.push(`/courses/${slug}`)}
                    className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer transition-colors"
                >
                    <ArrowLeft size={16} /> Kembali ke kursus
                </button>

                {/* Lesson Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen size={24} className="text-accent" />
                        {lesson.title}
                    </h1>
                    <span className="flex items-center gap-1 text-accent text-sm font-bold">
                        <Zap size={14} /> {lesson.xp_reward} XP
                    </span>
                </div>

                {/* Lesson Content — Markdown rendered */}
                <div className="bg-white border border-[#b1ada1] p-6">
                    <MarkdownRenderer content={lesson.content_markdown} />
                </div>

                {/* Complete / Navigate */}
                {isLoggedIn && !completed && (
                    <button
                        onClick={handleCompleteLesson}
                        disabled={completing}
                        className="bg-[#c15f3c] hover:bg-[#a64e2f] text-white font-bold py-3 px-6 transition-all border border-[#c15f3c] w-full flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-70"
                    >
                        <CheckCircle size={16} />
                        {completing ? "Loading..." : "Tandai Selesai & Lanjut"}
                    </button>
                )}

                {completed && (
                    <div className="bg-white border border-green-500 p-5 text-center">
                        <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                        <div className="font-bold text-green-500 mb-3 uppercase tracking-widest">Lesson Selesai! 🎉</div>
                        <button
                            onClick={() => router.push(`/courses/${slug}`)}
                            className="bg-[#c15f3c] hover:bg-[#a64e2f] text-white font-bold py-3 px-6 transition-all border border-[#c15f3c] inline-flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                        >
                            Lanjut ke Lesson Berikutnya <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
