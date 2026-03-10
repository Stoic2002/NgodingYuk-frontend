"use client";
import { useEffect, useState } from "react";
import AppShell from "@/app/components/AppShell";
import { useTranslation } from "@/app/lib/i18n";
import { useStore } from "@/app/lib/store";
import { userAPI } from "@/app/lib/api";
import { XPHistoryItem, ChallengeStats, CertificateItem, QuizHistoryItem } from "@/app/lib/types";
import { Badge, Skeleton, ProgressBar } from "@/app/components/UI";
import { useRouter } from "next/navigation";
import Link from "next/link";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000];

function getXPForNextLevel(level: number) {
    if (level < LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level];
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (level - LEVEL_THRESHOLDS.length + 1) * 1000;
}

function getXPForCurrentLevel(level: number) {
    if (level <= 1) return 0;
    if (level - 1 < LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level - 1];
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (level - LEVEL_THRESHOLDS.length) * 1000;
}

export default function ProfilPage() {
    const { t } = useTranslation();
    const { user, isLoggedIn, locale, setLocale } = useStore();
    const router = useRouter();

    const [xpHistory, setXpHistory] = useState<XPHistoryItem[]>([]);
    const [stats, setStats] = useState<ChallengeStats | null>(null);
    const [certificates, setCertificates] = useState<CertificateItem[]>([]);
    const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
    const [selectedResult, setSelectedResult] = useState<QuizHistoryItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }
        loadData();
    }, [isLoggedIn]);

    async function loadData() {
        setLoading(true);
        try {
            const [historyRes, statsRes, certsRes, quizHistRes] = await Promise.all([
                userAPI.getXPHistory({ limit: 5 }),
                userAPI.getChallengeStats(),
                userAPI.getCertificates(),
                userAPI.getQuizHistory(),
            ]);
            setXpHistory(historyRes.data.data || []);
            setStats(statsRes.data.data);
            setCertificates(certsRes.data.data || []);
            setQuizHistory(quizHistRes.data.data || []);
        } catch { }
        setLoading(false);
    }

    const downloadCertificate = async (cert: CertificateItem) => {
        const certElement = document.getElementById(`cert-${cert.id}`);
        if (!certElement) return;

        try {
            const dataUrl = await htmlToImage.toPng(certElement, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: "#f4f3ee"
            });
            const width = certElement.offsetWidth * 2;
            const height = certElement.offsetHeight * 2;

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [width, height]
            });
            pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
            pdf.save(`Certificate_${cert.course_slug}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        }
    };

    if (!isLoggedIn || !user) return null;

    const totalSolved = stats
        ? stats.easy.solved + stats.medium.solved + stats.hard.solved
        : 0;

    return (
        <AppShell>
            <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-white border border-[#b1ada1] p-8">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-20 h-20 bg-white flex items-center justify-center border border-[#b1ada1]">
                            <span className="material-symbols-outlined text-[#c15f3c] text-4xl">person</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">{user.username}</h1>
                            <p className="text-[#b1ada1] text-sm mt-1">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Badge label="XP" value={user.xp} icon="bolt" color="accent" />
                        <Badge label="Level" value={user.level} icon="grade" color="warm" />
                        <Badge label="Streak" value={`${user.streak_count}d`} icon="local_fire_department" color="warm" />
                    </div>

                    <ProgressBar
                        current={user.xp - getXPForCurrentLevel(user.level)}
                        max={getXPForNextLevel(user.level) - getXPForCurrentLevel(user.level)}
                        label={`Level ${user.level} → ${user.level + 1}`}
                    />
                </div>

                {/* Challenge Stats */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-[#b1ada1] uppercase tracking-widest pl-2">
                        {t("profile.challengeStats")}
                    </h2>
                    {loading ? (
                        <Skeleton height="120px" />
                    ) : stats ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[#b1ada1] bg-white text-center">
                            <div className="p-5 border-b sm:border-b-0 sm:border-r border-[#b1ada1]">
                                <div className="text-3xl font-bold text-[#c15f3c]">{totalSolved}</div>
                                <div className="text-[10px] text-[#b1ada1] font-bold uppercase tracking-widest mt-2">{t("profile.totalSolved")}</div>
                            </div>
                            <div className="p-5 border-b sm:border-b-0 sm:border-r border-[#b1ada1]">
                                <div className="text-3xl font-bold text-slate-900">{stats.easy.solved}</div>
                                <div className="text-[10px] text-[#b1ada1] font-bold uppercase tracking-widest mt-2">{t("profile.easy")}</div>
                            </div>
                            <div className="p-5 border-r border-[#b1ada1]">
                                <div className="text-3xl font-bold text-slate-900">{stats.medium.solved}</div>
                                <div className="text-[10px] text-[#b1ada1] font-bold uppercase tracking-widest mt-2">{t("profile.medium")}</div>
                            </div>
                            <div className="p-5">
                                <div className="text-3xl font-bold text-slate-900">{stats.hard.solved}</div>
                                <div className="text-[10px] text-[#b1ada1] font-bold uppercase tracking-widest mt-2">{t("profile.hard")}</div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Certificates */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-[#b1ada1] uppercase tracking-widest pl-2">
                        {t("profile.certificates") || "Sertifikat"}
                    </h2>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton height="100px" />
                            <Skeleton height="100px" />
                        </div>
                    ) : certificates.length === 0 ? (
                        <div className="bg-white border border-[#b1ada1] text-center py-10">
                            <p className="text-[#b1ada1] font-bold text-sm uppercase tracking-widest">Belum ada sertifikat.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {certificates.map((cert) => (
                                <Link key={cert.id} href={`/courses/${cert.course_slug}`} className="block">
                                    <div className="bg-white border border-[#b1ada1] p-5 hover:border-[#c15f3c] transition-colors cursor-pointer group h-full flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-symbols-outlined text-[#c15f3c] text-xl">workspace_premium</span>
                                                <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-[#c15f3c] transition-colors">{cert.course_title}</h3>
                                            </div>
                                            <div className="text-xs text-[#b1ada1] font-bold uppercase tracking-widest flex flex-col gap-1">
                                                <span>Nilai: <span className="text-slate-900">{((cert.score / cert.total_questions) * 100).toFixed(0)} ({cert.score}/{cert.total_questions})</span></span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-xs text-[#b1ada1] flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                {new Date(cert.passed_at).toLocaleDateString()}
                                            </div>
                                            <button
                                                onClick={(e) => { e.preventDefault(); downloadCertificate(cert); }}
                                                className="bg-[#c15f3c] text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#a64e2f] transition-colors border border-[#c15f3c] flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">download</span>
                                                PDF
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quiz History */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-[#b1ada1] uppercase tracking-widest pl-2">
                        {t("profile.quizHistory") || "Riwayat Kuis & Ujian"}
                    </h2>
                    {loading ? (
                        <div className="space-y-0 border border-[#b1ada1] bg-white">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height="64px" className="border-b border-[#b1ada1] last:border-0" />
                            ))}
                        </div>
                    ) : quizHistory.length === 0 ? (
                        <div className="bg-white border border-[#b1ada1] text-center py-10">
                            <p className="text-[#b1ada1] font-bold text-sm uppercase tracking-widest">Belum ada riwayat kuis atau ujian.</p>
                        </div>
                    ) : (
                        <div className="space-y-0 border border-[#b1ada1] bg-white">
                            {quizHistory.map((item, index) => {
                                const isLast = index === quizHistory.length - 1;
                                return (
                                    <div
                                        key={index}
                                        onClick={() => item.result_details && setSelectedResult(item)}
                                        className={`flex items-center justify-between p-5 transition-colors hover:bg-[#f4f3ee] ${item.result_details ? 'cursor-pointer' : ''} ${!isLast ? 'border-b border-[#b1ada1]' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 border border-[#b1ada1] bg-white text-[#b1ada1]">
                                                {item.type === "course_exam" ? (
                                                    <span className="material-symbols-outlined max-h-6 text-[#c15f3c]">school</span>
                                                ) : (
                                                    <span className="material-symbols-outlined max-h-6">quiz</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-[15px] font-bold text-slate-900 capitalize leading-none uppercase tracking-tight">
                                                    {item.course_title} {item.lesson_title ? `- ${item.lesson_title}` : " (Ujian Akhir)"}
                                                </div>
                                                <div className="text-xs text-[#b1ada1] flex items-center gap-1.5 mt-1.5 font-bold uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                    {new Date(item.passed_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-slate-900 font-bold text-base bg-[#f4f3ee] px-3 py-1.5 border border-[#c15f3c]">
                                                Skor: {item.score} / {item.total_questions}
                                            </div>
                                            {item.result_details && (
                                                <span className="material-symbols-outlined text-[#b1ada1]">chevron_right</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* XP History */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-[#b1ada1] uppercase tracking-widest pl-2">
                        {t("profile.xpHistory")}
                    </h2>
                    {loading ? (
                        <div className="space-y-0 border border-[#b1ada1]">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height="64px" className="border-b border-[#b1ada1] last:border-0" />
                            ))}
                        </div>
                    ) : xpHistory.length === 0 ? (
                        <div className="bg-white border border-[#b1ada1] text-center py-10">
                            <p className="text-[#b1ada1] font-bold text-sm uppercase tracking-widest">No XP history yet. Start solving challenges!</p>
                        </div>
                    ) : (
                        <div className="space-y-0 border border-[#b1ada1] bg-white">
                            {xpHistory.map((item, index) => {
                                const isLast = index === xpHistory.length - 1;
                                return (
                                    <div key={item.id} className={`flex items-center justify-between p-5 transition-colors hover:bg-[#f4f3ee] ${!isLast ? 'border-b border-[#b1ada1]' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 border border-[#b1ada1] bg-white text-[#b1ada1]">
                                                {item.source_type === "challenge" ? (
                                                    <span className="material-symbols-outlined max-h-6 text-[#c15f3c]">target</span>
                                                ) : (
                                                    <span className="material-symbols-outlined max-h-6">check_circle</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-[15px] font-bold text-slate-900 capitalize leading-none uppercase tracking-tight">
                                                    {item.source_type.replace("_", " ")}
                                                </div>
                                                <div className="text-xs text-[#b1ada1] flex items-center gap-1.5 mt-1.5">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-[#c15f3c] font-bold text-base bg-white px-3 py-1.5 border border-[#c15f3c]">
                                            <span className="material-symbols-outlined text-[18px]">trending_up</span> +{item.xp_gained} XP
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Settings */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-xs font-bold text-[#b1ada1] uppercase tracking-widest pl-2">
                        {t("profile.settings")}
                    </h2>
                    <div className="bg-white border border-[#b1ada1] p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#b1ada1] text-[22px]">language</span>
                                <span className="text-sm font-bold text-slate-900">{t("profile.language")}</span>
                            </div>
                            <div className="inline-flex bg-white p-0 gap-0 border border-[#b1ada1]">
                                <button
                                    onClick={() => setLocale("id")}
                                    className={`px-5 py-2 text-xs font-bold border-none cursor-pointer transition-all uppercase tracking-widest ${locale === "id"
                                        ? "bg-[#c15f3c] text-white"
                                        : "bg-transparent text-[#b1ada1] hover:text-slate-900"
                                        }`}
                                >
                                    ID
                                </button>
                                <div className="w-px bg-[#b1ada1]"></div>
                                <button
                                    onClick={() => setLocale("en")}
                                    className={`px-5 py-2 text-xs font-bold border-none cursor-pointer transition-all uppercase tracking-widest ${locale === "en"
                                        ? "bg-[#c15f3c] text-white"
                                        : "bg-transparent text-[#b1ada1] hover:text-slate-900"
                                        }`}
                                >
                                    EN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Certificate Template for PDF generation */}
            <div className="overflow-hidden h-0 w-0 absolute opacity-0 pointer-events-none">
                {certificates.map(cert => (
                    <div
                        key={`hidden-${cert.id}`}
                        id={`cert-${cert.id}`}
                        className="w-[1123px] h-[794px] bg-[#f4f3ee] border-[20px] border-[#c15f3c] p-12 flex flex-col items-center justify-center text-center font-sans relative box-border"
                        style={{ backgroundImage: "radial-gradient(#b1ada1 1px, transparent 1px)", backgroundSize: "40px 40px" }}
                    >
                        <div className="absolute top-12 left-12 w-20 h-20 bg-[#c15f3c] flex items-center justify-center text-white border border-[#c15f3c]">
                            <span className="text-4xl font-bold">&lt;/&gt;</span>
                        </div>
                        <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter mb-6">{t("profile.certificateTitle")}</h1>
                        <p className="text-2xl text-[#b1ada1] font-bold uppercase tracking-widest mb-12">{t("profile.certificateGivenTo")}</p>
                        <h2 className="text-7xl font-bold text-[#c15f3c] mb-12 border-b-2 border-[#b1ada1] inline-block px-12 pb-4">{user.username}</h2>
                        <p className="text-xl text-slate-900 font-medium max-w-3xl leading-relaxed mb-12">
                            Telah menyelesaikan ujian akhir dan membuktikan kompetensinya dalam kelas <br />
                            <strong className="text-3xl font-black uppercase tracking-tight block mt-4">{cert.course_title}</strong>
                        </p>
                        <div className="flex gap-16 mt-8">
                            <div className="text-center">
                                <p className="text-sm font-bold text-[#b1ada1] uppercase tracking-widest mb-2">{t("profile.certificateAchievement")}</p>
                                <p className="text-3xl font-black text-slate-900 border border-[#b1ada1] bg-white px-8 py-3">{((cert.score / cert.total_questions) * 100).toFixed(0)} / 100</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-[#b1ada1] uppercase tracking-widest mb-2">{t("profile.certificateDate")}</p>
                                <p className="text-2xl font-bold text-slate-900 border border-[#b1ada1] bg-white px-8 py-4">{new Date(cert.passed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quiz Result Modal */}
            {selectedResult && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#f4f3ee]/80 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white border border-[#b1ada1] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-[#b1ada1] flex justify-between items-center bg-[#f4f3ee]">
                            <div>
                                <h3 className="text-sm font-bold text-[#c15f3c] uppercase tracking-widest mb-1">Result Detail</h3>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                                    {selectedResult.course_title} {selectedResult.lesson_title ? `- ${selectedResult.lesson_title}` : " (Ujian Akhir)"}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedResult(null)}
                                className="w-10 h-10 flex items-center justify-center border border-[#b1ada1] text-[#b1ada1] hover:text-[#c15f3c] hover:border-[#c15f3c] transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {selectedResult.result_details?.map((detail, idx) => (
                                <div key={detail.quiz_id} className="border border-[#b1ada1] p-5 bg-[#fcfbf7]">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${detail.correct ? 'border-green-500 text-green-500 bg-green-50' : 'border-[#c15f3c] text-[#c15f3c] bg-red-50'
                                            }`}>
                                            <span className="material-symbols-outlined text-[20px]">
                                                {detail.correct ? 'check_circle' : 'cancel'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-[#b1ada1] uppercase tracking-widest mb-2">Pertanyaan {idx + 1}</div>
                                            <p className="font-bold text-slate-900 mb-4">{detail.question || `Pertanyaan #${idx + 1}`}</p>
                                            {detail.explanation && (
                                                <div className="bg-[#f4f3ee] p-4 border-l-2 border-[#c15f3c]">
                                                    <div className="text-[10px] font-bold text-[#c15f3c] uppercase mb-1 tracking-widest">Penjelasan</div>
                                                    <p className="text-sm text-slate-800 italic leading-relaxed">{detail.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 border-t border-[#b1ada1] bg-[#f4f3ee] flex justify-between items-center">
                            <div className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                                Skor: {selectedResult.score} / {selectedResult.total_questions}
                            </div>
                            <button
                                onClick={() => setSelectedResult(null)}
                                className="bg-[#c15f3c] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#a64e2f] transition-all border border-[#c15f3c]"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
