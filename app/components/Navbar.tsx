"use client";
import Link from "next/link";
import { useStore } from "@/app/lib/store";
import { useTranslation } from "@/app/lib/i18n";
import { usePathname } from "next/navigation";
import {
    Home,
    Code2,
    BookOpen,
    Trophy,
    User,
    Sun,
    Moon,
    LogOut,
    Zap,
    Code,
    Globe
} from "lucide-react";

export default function Navbar() {
    const { user, isLoggedIn, logout, toggleTheme, theme, locale, setLocale } = useStore();
    const { t } = useTranslation();
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: t("nav.home"), icon: Home },
        { href: "/challenges", label: t("nav.challenges"), icon: Code2 },
        { href: "/courses", label: t("nav.classes"), icon: BookOpen },
        { href: "/leaderboard", label: t("nav.rank"), icon: Trophy },
    ];

    const authedLinks = [{ href: "/profile", label: t("nav.profile"), icon: User }];

    return (
        <nav className="sticky top-0 z-50 bg-[#ffffff] border-b border-[#b1ada1]">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 no-underline group">
                    <div className="bg-white border border-[#b1ada1] p-2 group-hover:border-[#c15f3c] transition-colors">
                        <Code size={20} className="text-[#c15f3c]" />
                    </div>
                    <span className="font-bold text-lg tracking-tight hidden sm:inline text-slate-900 uppercase">
                        NgodingYuk
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = pathname === link.href || pathname.startsWith(link.href + "/");
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border ${active
                                    ? "bg-white border-[#c15f3c] text-[#c15f3c]"
                                    : "bg-white border-transparent text-[#b1ada1] hover:text-slate-900 border hover:border-[#b1ada1]"
                                    }`}
                            >
                                <Icon size={18} className={active ? "text-[#c15f3c]" : "text-[#b1ada1]"} />
                                <span className="hidden sm:inline uppercase tracking-widest text-[11px]">{link.label}</span>
                            </Link>
                        );
                    })}
                    {isLoggedIn &&
                        authedLinks.map((link) => {
                            const Icon = link.icon;
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border ${active
                                        ? "bg-white border-[#c15f3c] text-[#c15f3c]"
                                        : "bg-white border-transparent text-[#b1ada1] hover:text-slate-900 border hover:border-[#b1ada1]"
                                        }`}
                                >
                                    <Icon size={18} className={active ? "text-[#c15f3c]" : "text-[#b1ada1]"} />
                                    <span className="hidden sm:inline uppercase tracking-widest text-[11px]">{link.label}</span>
                                </Link>
                            );
                        })}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 sm:gap-5">
                    {isLoggedIn && user && (
                        <>
                            {/* XP Badge */}
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c15f3c] text-[11px] font-bold text-[#c15f3c] uppercase font-mono tracking-widest">
                                <Zap size={14} className="fill-[#c15f3c]" />
                                {user.xp} {t("common.xp")}
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-2 border-l border-[#b1ada1] pl-3 sm:pl-5 h-8">
                        {/* Language toggle */}
                        <button
                            onClick={() => setLocale(locale === "en" ? "id" : "en")}
                            className="p-2 text-[#b1ada1] hover:text-slate-900 border border-transparent hover:border-[#b1ada1] bg-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                            title="Switch language"
                        >
                            <Globe size={18} />
                            <span className="text-xs font-bold uppercase hidden sm:inline leading-none mt-0.5">{locale}</span>
                        </button>

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-[#b1ada1] hover:text-slate-900 border border-transparent hover:border-[#b1ada1] bg-white transition-colors cursor-pointer flex items-center justify-center"
                            title={t("nav.toggleTheme")}
                        >
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* Auth */}
                        {isLoggedIn ? (
                            <button
                                onClick={logout}
                                className="p-2 text-[#b1ada1] hover:text-[#c15f3c] border border-transparent hover:border-[#c15f3c] bg-white transition-colors cursor-pointer flex items-center justify-center"
                                title={t("nav.logout")}
                            >
                                <LogOut size={18} />
                            </button>
                        ) : (
                            <Link href="/login" className="btn btn-primary btn-sm ml-2 font-mono uppercase tracking-widest text-[11px]">
                                {t("nav.login")}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
