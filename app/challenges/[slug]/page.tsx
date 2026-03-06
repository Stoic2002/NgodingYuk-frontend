"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import { useTranslation } from "@/app/lib/i18n";
import { useStore } from "@/app/lib/store";
import { challengeAPI } from "@/app/lib/api";
import { ChallengeDetail, RunResult } from "@/app/lib/types";
import { DifficultyBadge, LanguageBadge, Skeleton } from "@/app/components/UI";
import Editor from "@monaco-editor/react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

export default function ChallengeDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { t } = useTranslation();
    const { isLoggedIn, refreshProfile, showXPGain } = useStore();

    const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
    const [code, setCode] = useState("");
    const [results, setResults] = useState<RunResult[]>([]);
    const [allPassed, setAllPassed] = useState(false);
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [xpGained, setXpGained] = useState(0);
    const [activeTab, setActiveTab] = useState<"story" | "schema" | "expected">("story");
    const [showHint, setShowHint] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) loadChallenge();
    }, [slug]);

    async function loadChallenge() {
        setLoading(true);
        try {
            const res = await challengeAPI.getBySlug(slug);
            setChallenge(res.data);
            setCode(res.data.starter_code || "");
        } catch {
            setChallenge(null);
        }
        setLoading(false);
    }

    const handleRun = useCallback(async () => {
        if (!challenge || !code.trim()) return;
        setRunning(true);
        setResults([]);
        try {
            const res = await challengeAPI.run(slug, code);
            setResults(res.data.results || []);
            setAllPassed(res.data.all_passed);
        } catch {
            setResults([{ passed: false, actual: "Execution error", error: "Failed to run code" }]);
        }
        setRunning(false);
    }, [challenge, code, slug]);

    const handleSubmit = useCallback(async () => {
        if (!challenge || !code.trim() || !isLoggedIn) return;
        setSubmitting(true);
        setResults([]);
        try {
            const res = await challengeAPI.submit(slug, code);
            setResults(res.data.results || []);
            setAllPassed(res.data.all_passed);
            if (res.data.xp_gained > 0) {
                setXpGained(res.data.xp_gained);
                showXPGain(res.data.xp_gained);
                refreshProfile();
            }
        } catch {
            setResults([{ passed: false, actual: "Submission error", error: "Failed to submit" }]);
        }
        setSubmitting(false);
    }, [challenge, code, slug, isLoggedIn, showXPGain, refreshProfile]);

    if (loading) {
        return (
            <AppShell>
                <div className="space-y-4">
                    <Skeleton height="40px" width="60%" />
                    <Skeleton height="300px" />
                </div>
            </AppShell>
        );
    }

    if (!challenge) {
        return (
            <AppShell>
                <div className="text-center py-20">
                    <h1 className="text-xl font-bold">Challenge not found</h1>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="space-y-4">
                {/* Header */}
                <div className="bg-white border border-[#b1ada1] p-6 flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight mb-3 text-slate-900 uppercase tracking-tight">{challenge.title}</h1>
                        <div className="flex items-center gap-3">
                            <LanguageBadge language={challenge.language} />
                            <DifficultyBadge difficulty={challenge.difficulty} />
                            <span className="flex items-center gap-1.5 text-slate-900 bg-white border border-[#b1ada1] px-3 py-1.5 text-xs tracking-widest uppercase font-bold">
                                <span className="material-symbols-outlined text-[16px]">bolt</span> {challenge.xp_reward} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Split Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Left: Challenge Content */}
                    <div className="bg-white border border-[#b1ada1] flex flex-col min-h-[calc(100vh-230px)]">
                        {/* Tabs */}
                        <div className="flex border-b border-[#b1ada1] bg-white shrink-0">
                            <button
                                onClick={() => setActiveTab("story")}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-none cursor-pointer transition-all uppercase tracking-widest ${activeTab === "story"
                                    ? "bg-[#c15f3c] text-white border-r border-[#b1ada1]"
                                    : "bg-white text-[#b1ada1] hover:text-slate-900 border-r border-[#b1ada1] hover:bg-[#f4f3ee]"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                                {t("challenge.story")}
                            </button>
                            {challenge.schema_info && (
                                <button
                                    onClick={() => setActiveTab("schema")}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-none cursor-pointer transition-all uppercase tracking-widest ${activeTab === "schema"
                                        ? "bg-[#c15f3c] text-white border-r border-[#b1ada1]"
                                        : "bg-white text-[#b1ada1] hover:text-slate-900 border-r border-[#b1ada1] hover:bg-[#f4f3ee]"
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">table_chart</span>
                                    {t("challenge.schema")}
                                </button>
                            )}
                            {challenge.expected_output != null && (
                                <button
                                    onClick={() => setActiveTab("expected")}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-none cursor-pointer transition-all uppercase tracking-widest ${activeTab === "expected"
                                        ? "bg-[#c15f3c] text-white border-r border-[#b1ada1]"
                                        : "bg-white text-[#b1ada1] hover:text-slate-900 border-r border-[#b1ada1] hover:bg-[#f4f3ee]"
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">fact_check</span>
                                    {t("challenge.expected")}
                                </button>
                            )}
                        </div>

                        <div className="p-6 space-y-5 flex-1">
                            {activeTab === "story" ? (
                                <>
                                    <div className="prose prose-slate prose-sm max-w-none text-slate-700">
                                        <MarkdownRenderer content={challenge.story} />
                                    </div>
                                    <div className="bg-white border border-[#b1ada1] p-5">
                                        <h3 className="font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 text-sm mb-3">
                                            <span className="material-symbols-outlined text-[18px]">target</span>
                                            {t("challenge.task")}
                                        </h3>
                                        <div className="prose prose-sm prose-slate max-w-none prose-p:text-slate-900">
                                            <MarkdownRenderer content={challenge.task} />
                                        </div>
                                    </div>
                                    {challenge.hint && (
                                        <div className="pt-2">
                                            <button
                                                onClick={() => setShowHint(!showHint)}
                                                className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-widest hover:text-slate-900 bg-white hover:bg-[#f4f3ee] border border-[#b1ada1] px-4 py-2 cursor-pointer transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                                                {t("challenge.hint")}
                                            </button>
                                            {showHint && (
                                                <div className="mt-3 bg-[#f4f3ee] border border-[#b1ada1] p-4 text-sm font-bold text-slate-900 animate-in fade-in slide-in-from-top-2">
                                                    {challenge.hint}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : activeTab === "schema" ? (
                                <div className="space-y-6">
                                    {challenge.schema_info?.tables.map((table) => (
                                        <div key={table.name} className="bg-white border border-[#b1ada1]">
                                            <div className="bg-white border-b border-[#b1ada1] px-4 py-3">
                                                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px] text-[#c15f3c]">table_view</span>
                                                    {table.name}
                                                </h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-[#b1ada1]">
                                                            {table.columns.map((col) => (
                                                                <th key={col.name} className="px-4 py-2.5 font-bold uppercase tracking-wide text-slate-900 border-b border-[#b1ada1]">
                                                                    {col.name} <span className="text-slate-500 font-bold ml-1">({col.type})</span>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {table.rows?.slice(0, 5).map((row, i) => (
                                                            <tr key={i} className="border-b border-slate-200 hover:bg-[#f4f3ee]">
                                                                {table.columns.map((col) => (
                                                                    <td key={col.name} className="px-4 py-2 text-slate-900 font-mono text-[11px]">
                                                                        {String(row[col.name] ?? "")}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : activeTab === "expected" ? (
                                <div className="space-y-6">
                                    <div className="bg-white border border-[#b1ada1]">
                                        <div className="bg-white border-b border-[#b1ada1] px-4 py-3">
                                            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[16px] text-[#c15f3c]">fact_check</span>
                                                Output yang Diharapkan
                                            </h3>
                                        </div>
                                        <div className="p-4 bg-[#f4f3ee]">
                                            <pre className="text-sm font-mono text-slate-900 whitespace-pre-wrap break-all">
                                                {typeof challenge.expected_output === 'string'
                                                    ? challenge.expected_output
                                                    : JSON.stringify(challenge.expected_output, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Right: Code Editor + Results */}
                    <div className="space-y-4 flex flex-col min-h-[calc(100vh-230px)]">
                        {/* Action Buttons */}
                        <div className="flex gap-3 bg-white border border-[#b1ada1] p-2 shrink-0">
                            <button
                                onClick={handleRun}
                                disabled={running || !code.trim()}
                                className="bg-white border border-slate-900 hover:bg-[#f4f3ee] text-slate-900 font-bold py-3 px-6 transition-all disabled:opacity-50 flex items-center justify-center gap-2 flex-1 uppercase tracking-widest text-sm"
                            >
                                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                                {running ? t("challenge.running") : t("challenge.runCode")}
                            </button>
                            {isLoggedIn && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !code.trim()}
                                    className="bg-[#c15f3c] border border-[#c15f3c] hover:bg-[#a64e2f] text-white font-bold py-3 px-6 transition-all disabled:opacity-50 flex items-center justify-center gap-2 flex-1 uppercase tracking-widest text-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                    {submitting ? t("challenge.running") : t("challenge.submit")}
                                </button>
                            )}
                        </div>

                        {/* Code Editor */}
                        <div className="bg-[#1e1e1e] border border-[#b1ada1] flex flex-col h-[500px] shrink-0">
                            <div className="bg-[#2d2d2d] px-5 py-3 border-b border-[#3d3d3d] flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-slate-400">code</span>
                                    Code Editor
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#3d3d3d] text-slate-300 uppercase tracking-widest font-mono border border-[#b1ada1]">
                                    {challenge.language}
                                </span>
                            </div>
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    language={challenge.language === "sql" ? "sql" : "go"}
                                    theme="vs-dark"
                                    value={code}
                                    onChange={(v) => setCode(v || "")}
                                    options={{
                                        fontSize: 14,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        padding: { top: 16, bottom: 16 },
                                        lineNumbers: "on",
                                        renderLineHighlight: "line",
                                        bracketPairColorization: { enabled: true },
                                        autoClosingBrackets: "always",
                                        tabSize: 4,
                                        wordWrap: "on",
                                    }}
                                />
                            </div>
                        </div>

                        {/* XP Gained Alert */}
                        {xpGained > 0 && allPassed && (
                            <div className="bg-white border border-[#c15f3c] p-4 animate-in fade-in slide-in-from-bottom-2 shrink-0">
                                <div className="text-[#c15f3c] font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">bolt</span> +{xpGained} XP earned!
                                </div>
                            </div>
                        )}

                        {/* Results Panel */}
                        {results.length > 0 && (
                            <div className="bg-white border border-[#b1ada1] shrink-0 mt-auto">
                                <div className={`px-5 py-3 border-b text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 ${allPassed ? "bg-white border-[#b1ada1] text-green-600" : "bg-white border-[#b1ada1] text-red-500"
                                    }`}>
                                    <span className="material-symbols-outlined text-[16px]">
                                        {allPassed ? "task_alt" : "error"}
                                    </span>
                                    {allPassed ? t("challenge.allTestsPassed") : `${results.filter(r => r.passed).length}/${results.length} passed`}
                                </div>
                                <div className="divide-y divide-[#b1ada1] border-t border-[#b1ada1]">
                                    {results.map((result, i) => (
                                        <div key={i} className="p-4 text-sm bg-white hover:bg-[#f4f3ee] transition-colors border-b border-[#b1ada1] last:border-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                {result.passed ? (
                                                    <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-red-500 text-[18px]">cancel</span>
                                                )}
                                                <span className="font-bold text-slate-900 uppercase tracking-widest text-xs">
                                                    {t("challenge.testCase")} {i + 1}
                                                </span>
                                            </div>
                                            <div className="space-y-4 pl-6">
                                                {result.input && (
                                                    <div className="text-xs text-slate-900 flex flex-col gap-1.5">
                                                        <span className="font-bold uppercase tracking-widest text-[10px] text-[#b1ada1]">{t("challenge.input")}</span>
                                                        <code className="block bg-[#f4f3ee] border border-[#b1ada1] text-slate-900 p-3 font-mono text-[12px] whitespace-pre-wrap break-all">{result.input}</code>
                                                    </div>
                                                )}
                                                {result.expected && (
                                                    <div className="text-xs text-slate-900 flex flex-col gap-1.5">
                                                        <span className="font-bold uppercase tracking-widest text-[10px] text-[#b1ada1]">{t("challenge.expected")}</span>
                                                        <code className="block bg-[#f4f3ee] border border-green-500 text-green-600 p-3 font-mono text-[12px] whitespace-pre-wrap break-all">{result.expected}</code>
                                                    </div>
                                                )}
                                                <div className="text-xs text-slate-900 flex flex-col gap-1.5">
                                                    <span className="font-bold uppercase tracking-widest text-[10px] text-[#b1ada1]">{t("challenge.actual")}</span>
                                                    <code className={`block p-3 font-mono text-[12px] whitespace-pre-wrap break-all border bg-[#f4f3ee] ${result.passed ? "border-green-500 text-green-600" : "border-red-500 text-red-500"}`}>{result.actual}</code>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
