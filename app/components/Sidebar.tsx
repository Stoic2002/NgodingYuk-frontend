"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/app/lib/store";
import { useTranslation } from "@/app/lib/i18n";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const { user, isLoggedIn, logout, locale, setLocale, isSidebarCollapsed: isCollapsed, toggleSidebar } = useStore();
    const { t } = useTranslation();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { href: "/challenges", label: t("nav.challenges"), icon: "terminal" },
        { href: "/courses", label: t("nav.classes"), icon: "menu_book" },
        { href: "/leaderboard", label: t("nav.rank"), icon: "trophy" },
    ];

    const authedLinks = [{ href: "/profile", label: t("nav.profile"), icon: "person" }];

    // Add level logic
    const xp = user?.xp || 0;
    const level = Math.floor(xp / 1000) + 1; // Assuming 1000 XP per level for display
    const progress = (xp % 1000) / 10; // percentage

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-[#f4f3ee] border-b border-[#b1ada1] p-4 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 uppercase tracking-widest">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-white border border-[#b1ada1] text-[#c15f3c]">
                        <span className="text-sm font-bold">&lt;/&gt;</span>
                    </div>
                    NgodingYuk
                </Link>
                <button onClick={() => setIsOpen(true)} className="p-2 text-slate-900 hover:bg-white border border-transparent hover:border-[#b1ada1] transition-colors">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside
                className={`fixed md:sticky top-0 left-0 h-screen bg-[#f4f3ee] border-r border-[#b1ada1] z-50 transition-all duration-300 ease-in-out flex flex-col
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                ${isCollapsed ? "md:w-24" : "md:w-72"} w-72 shrink-0`}
            >
                <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} border-b border-[#b1ada1] relative`}>
                    <Link href="/" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        <div className="w-10 h-10 bg-white border border-[#b1ada1] flex items-center justify-center text-[#c15f3c] shrink-0">
                            <span className="text-lg font-bold">&lt;/&gt;</span>
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden transition-all whitespace-nowrap">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">NgodingYuk</h1>
                                <p className="text-xs text-[#b1ada1] font-mono uppercase tracking-widest">Platform</p>
                            </div>
                        )}
                    </Link>

                    {/* Collapse Toggle (Desktop) */}
                    <button
                        onClick={toggleSidebar}
                        className={`hidden md:flex absolute ${isCollapsed ? '-right-3' : '-right-3'} top-1/2 -translate-y-1/2 items-center justify-center w-6 h-6 bg-white border border-[#b1ada1] text-[#b1ada1] hover:text-[#c3603c] hover:border-[#c3603c] transition-colors z-10`}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <span className="material-symbols-outlined text-sm" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none' }}>chevron_left</span>
                    </button>

                    {/* Close Toggle (Mobile) */}
                    <button onClick={() => setIsOpen(false)} className="md:hidden absolute right-4 p-2 text-[#b1ada1] hover:text-[#1c1917] bg-white border border-transparent hover:border-[#b1ada1]">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
                    {navLinks.map((link) => {
                        const active = pathname === link.href || pathname.startsWith(link.href + "/");
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center ${isCollapsed ? 'justify-center border-l-4' : 'gap-4 px-4 border-l-4'} py-3 transition-all group ${active
                                    ? "border-[#c3603c] text-[#c3603c] bg-white"
                                    : "border-transparent text-[#b1ada1] hover:border-[#b1ada1] hover:text-slate-900"
                                    }`}
                                title={isCollapsed ? link.label : undefined}
                            >
                                <span className={`material-symbols-outlined ${active ? "" : "text-opacity-80"}`}>{link.icon}</span>
                                {!isCollapsed && <span className="font-bold text-sm whitespace-nowrap uppercase tracking-widest">{link.label}</span>}
                            </Link>
                        );
                    })}

                    {isLoggedIn && <div className="my-4 border-t border-[#b1ada1]"></div>}

                    {isLoggedIn && authedLinks.map((link) => {
                        const active = pathname === link.href || pathname.startsWith(link.href + "/");
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center ${isCollapsed ? 'justify-center border-l-4' : 'gap-4 px-4 border-l-4'} py-3 transition-all group ${active
                                    ? "border-[#c3603c] text-[#c3603c] bg-white"
                                    : "border-transparent text-[#b1ada1] hover:border-[#b1ada1] hover:text-slate-900"
                                    }`}
                                title={isCollapsed ? link.label : undefined}
                            >
                                <span className={`material-symbols-outlined ${active ? "" : "text-opacity-80"}`}>{link.icon}</span>
                                {!isCollapsed && <span className="font-bold text-sm whitespace-nowrap uppercase tracking-widest">{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className={`p-4 md:p-6 border-t border-[#b1ada1] mt-auto space-y-4 ${isCollapsed ? 'px-2' : ''}`}>
                    {isLoggedIn && user ? (
                        <>
                            {!isCollapsed ? (
                                <div className="bg-white p-4 flex flex-col items-center gap-2 border border-[#b1ada1]">
                                    <div className="flex items-center gap-1.5 text-[#c3603c] font-bold font-mono">
                                        <span className="material-symbols-outlined text-lg">bolt</span>
                                        <span>{xp.toLocaleString()} XP</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[#f4f3ee] border border-[#b1ada1] overflow-hidden">
                                        <div className="bg-[#c3603c] h-full border-r border-[#b1ada1]" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-[#b1ada1] font-bold uppercase tracking-widest mt-1">Level {level} • Pro</p>
                                </div>
                            ) : (
                                <div className="bg-white p-2 flex flex-col items-center gap-1 border border-[#b1ada1]" title={`Level ${level} • ${xp} XP`}>
                                    <span className="material-symbols-outlined text-[#c3603c] text-lg">bolt</span>
                                    <span className="text-[10px] font-bold text-[#b1ada1] font-mono">{level}</span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <button
                                    onClick={logout}
                                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-2 text-[#c15f3c] hover:bg-white hover:border-[#c15f3c] border border-transparent transition-colors`}
                                    title={isCollapsed ? "Logout" : undefined}
                                >
                                    <span className="material-symbols-outlined text-xl">logout</span>
                                    {!isCollapsed && <span className="text-sm font-bold uppercase tracking-widest">Logout</span>}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Link href="/login" onClick={() => setIsOpen(false)} className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 bg-[#c3603c] text-white hover:bg-[#f4f3ee] hover:text-[#c3603c] border border-[#c3603c] transition-all font-bold tracking-widest uppercase`} title={isCollapsed ? t("nav.login") : undefined}>
                                <span className="material-symbols-outlined text-xl">login</span>
                                {!isCollapsed && <span className="text-sm">{t("nav.login")}</span>}
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
