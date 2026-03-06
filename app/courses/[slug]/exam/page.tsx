"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import { useStore } from "@/app/lib/store";
import { useTranslation } from "@/app/lib/i18n";
import { courseAPI } from "@/app/lib/api";
import { ExamData, ExamSubmitResponse } from "@/app/lib/types";
import { Skeleton } from "@/app/components/UI";

export default function ExamPage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const { t } = useTranslation();
    const { isLoggedIn, refreshProfile, showXPGain } = useStore();

    const [exam, setExam] = useState<ExamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<number[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<ExamSubmitResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (slug && isLoggedIn) loadExam();
    }, [slug, isLoggedIn]);

    async function loadExam() {
        setLoading(true);
        try {
            const res = await courseAPI.getExam(slug);
            setExam(res.data);
            setAnswers(new Array(res.data.total_questions).fill(-1));
            setTimeLeft(res.data.time_limit_sec);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setError(axiosErr?.response?.data?.error || "Gagal memuat ujian");
        }
        setLoading(false);
    }

    // Timer
    useEffect(() => {
        if (!exam || result) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [exam, result]);

    const handleAnswer = useCallback((qIndex: number, optIndex: number) => {
        setAnswers(prev => {
            const next = [...prev];
            next[qIndex] = optIndex;
            return next;
        });
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!exam || submitting) return;
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);
        try {
            const res = await courseAPI.submitExam(slug, answers);
            setResult(res.data);
            if (res.data.xp_gained > 0) {
                showXPGain(res.data.xp_gained);
                refreshProfile();
            }
        } catch { }
        setSubmitting(false);
    }, [exam, answers, slug, submitting, showXPGain, refreshProfile]);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <AppShell>
                <Skeleton height="50px" className="mb-4" />
                <Skeleton height="300px" />
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell>
                <div className="bg-white border border-red-500 p-10 text-center space-y-4 max-w-lg mx-auto mt-20 relative overflow-hidden">
                    <span className="material-symbols-outlined text-red-500 text-5xl relative z-10">error</span>
                    <h1 className="text-xl font-bold text-slate-900 relative z-10 uppercase tracking-widest">{t("course.examLoadFailed")}</h1>
                    <p className="text-[#b1ada1] text-sm font-bold relative z-10">{error}</p>
                    <button onClick={() => router.push(`/courses/${slug}`)} className="bg-white hover:bg-[#f4f3ee] text-slate-900 border border-slate-900 font-bold py-3 px-6 transition-all inline-flex items-center gap-2 relative z-10 mt-4 uppercase tracking-widest text-sm">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Kembali
                    </button>
                </div>
            </AppShell>
        );
    }

    if (!exam) return null;

    // === RESULT VIEW ===
    if (result) {
        return (
            <AppShell>
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className={`bg-white border p-10 text-center relative overflow-hidden ${result.passed ? "border-green-500" : "border-red-500"}`}>
                        {result.passed ? (
                            <span className="material-symbols-outlined text-[72px] text-green-500 mb-4 relative z-10">workspace_premium</span>
                        ) : (
                            <span className="material-symbols-outlined text-[72px] text-red-500 mb-4 relative z-10">cancel</span>
                        )}

                        <h1 className={`text-3xl font-bold mb-3 relative z-10 uppercase tracking-widest ${result.passed ? "text-green-500" : "text-red-500"}`}>
                            {result.passed ? "Selamat, Kamu Lulus! 🎉" : "Belum Lulus 😢"}
                        </h1>
                        <div className="text-4xl font-black text-slate-900 my-6 relative z-10 tracking-tight">
                            {result.score}<span className="text-[#b1ada1] text-2xl font-bold">/{result.total}</span>
                        </div>
                        <p className="text-slate-900 font-bold text-sm mb-8 relative z-10 uppercase tracking-tight">
                            {result.passed
                                ? "Kamu telah mendapatkan sertifikat untuk kursus ini!"
                                : "Kamu butuh minimal 70% untuk lulus. Silakan coba lagi."
                            }
                        </p>

                        {result.xp_gained > 0 && (
                            <div className="flex items-center justify-center gap-2 text-[#c15f3c] font-bold text-lg mb-8 relative z-10 bg-white py-2 px-4 border border-[#c15f3c] inline-flex mx-auto">
                                <span className="material-symbols-outlined">bolt</span> +{result.xp_gained} XP
                            </div>
                        )}

                        <div className="relative z-10 w-full flex justify-center">
                            <button onClick={() => router.push(`/courses/${slug}`)} className="bg-[#c15f3c] hover:bg-[#a64e2f] text-white font-bold py-3 px-8 border border-[#c15f3c] transition-all uppercase tracking-widest text-sm">
                                Kembali ke Kursus
                            </button>
                        </div>
                    </div>

                    {/* Review answers */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-xs font-bold text-[#b1ada1] uppercase tracking-widest pl-2">{t("course.reviewAnswers")}</h2>
                        {result.details.map((d, i) => (
                            <div key={d.quiz_id} className={`bg-white p-5 border ${d.correct ? "border-green-500" : "border-red-500"}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    {d.correct ? <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span> : <span className="material-symbols-outlined text-red-500 text-[20px]">cancel</span>}
                                    <span className="font-bold text-slate-900 text-sm uppercase tracking-tight">Soal {i + 1}</span>
                                </div>
                                {d.explanation && (
                                    <p className="text-sm font-bold text-[#b1ada1] mt-2 pl-8">{d.explanation}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </AppShell>
        );
    }

    // === EXAM VIEW ===
    const quiz = exam.quizzes[currentQ];
    const answeredCount = answers.filter(a => a >= 0).length;
    const allAnswered = answeredCount === exam.total_questions;
    const isUrgent = timeLeft <= 60;

    return (
        <AppShell>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Timer + Progress */}
                <div className="bg-white border border-[#b1ada1] p-5 flex items-center justify-between sticky top-4 z-20">
                    <div>
                        <h2 className="font-bold text-slate-900 text-base uppercase tracking-tight">{exam.course_title}</h2>
                        <span className="text-xs font-bold text-[#b1ada1] uppercase tracking-widest">{answeredCount}/{exam.total_questions} dijawab</span>
                    </div>
                    <div className={`flex items-center gap-2 font-mono font-bold text-xl bg-white px-4 py-2 border ${isUrgent ? "text-red-500 border-red-500 animate-pulse" : "text-slate-900 border-[#b1ada1]"}`}>
                        <span className="material-symbols-outlined text-[20px]">timer</span>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Question Navigation */}
                <div className="bg-white border border-[#b1ada1] p-5">
                    <div className="flex flex-wrap gap-2">
                        {exam.quizzes.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQ(i)}
                                className={`w-10 h-10 text-sm font-bold border cursor-pointer transition-all ${i === currentQ
                                    ? "bg-[#c15f3c] text-white border-[#c15f3c]"
                                    : answers[i] >= 0
                                        ? "bg-white text-[#c15f3c] border-[#c15f3c]"
                                        : "bg-white text-[#b1ada1] border-[#b1ada1] hover:border-[#c15f3c] hover:text-[#c15f3c]"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Current Question */}
                <div className="bg-white border border-[#b1ada1] p-8 space-y-6">
                    <div className="flex items-start gap-4 mb-4">
                        <span className="bg-white text-[#c15f3c] border border-[#c15f3c] w-10 h-10 flex items-center justify-center text-base font-bold shrink-0">
                            {currentQ + 1}
                        </span>
                        <p className="font-bold text-slate-900 text-lg leading-relaxed pt-1 flex-1 uppercase tracking-tight">{quiz.question}</p>
                    </div>

                    <div className="space-y-3">
                        {quiz.options.map((opt: string, oi: number) => {
                            const selected = answers[currentQ] === oi;
                            return (
                                <button
                                    key={oi}
                                    onClick={() => handleAnswer(currentQ, oi)}
                                    className={`w-full text-left px-5 py-4 border text-sm transition-all cursor-pointer ${selected
                                        ? "bg-[#f4f3ee] border-[#c15f3c] text-slate-900"
                                        : "bg-white border-[#b1ada1] hover:border-[#c15f3c] text-slate-900 hover:bg-[#f4f3ee]"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`w-8 h-8 flex items-center justify-center text-xs font-bold border ${selected ? "bg-[#c15f3c] text-white border-[#c15f3c]" : "bg-white text-[#b1ada1] border-[#b1ada1]"}`}>
                                            {String.fromCharCode(65 + oi)}
                                        </span>
                                        <span className={`font-bold text-base ${selected ? 'text-slate-900' : 'text-slate-900'}`}>{opt}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Prev / Next */}
                    <div className="flex justify-between pt-6 mt-6 border-t border-[#b1ada1]">
                        <button
                            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                            disabled={currentQ === 0}
                            className="bg-white hover:bg-[#f4f3ee] text-slate-900 border border-[#b1ada1] font-bold py-3 px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 uppercase tracking-widest text-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Sebelumnya
                        </button>
                        {currentQ < exam.total_questions - 1 ? (
                            <button
                                onClick={() => setCurrentQ(currentQ + 1)}
                                className="bg-white hover:bg-[#f4f3ee] text-slate-900 border border-[#b1ada1] font-bold py-3 px-6 transition-all inline-flex items-center gap-2 uppercase tracking-widest text-sm"
                            >
                                Selanjutnya <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!allAnswered || submitting}
                                className="bg-[#c15f3c] hover:bg-[#a64e2f] text-white font-bold py-3 px-8 border border-[#c15f3c] transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                            >
                                {submitting ? "Mengirim..." : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">send</span> Kirim Jawaban
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
