"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/app/lib/store";
import { AlertCircle } from "lucide-react";

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") === "register" ? "register" : "signin";

    const [activeTab, setActiveTab] = useState<"signin" | "register">(initialTab);
    const { login, register, isLoggedIn } = useStore();


    useEffect(() => {
        if (isLoggedIn) {
            router.push("/");
        }
    }, [isLoggedIn, router]);

    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    // Register state
    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirm, setRegConfirm] = useState("");
    const [regLoading, setRegLoading] = useState(false);

    const [error, setError] = useState("");

    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoginLoading(true);
        try {
            await login(loginEmail, loginPassword);
            router.push("/");
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "response" in err
                ? (err as any).response?.data?.error || "Login failed"
                : "Login failed";
            setError(msg);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (regPassword !== regConfirm) {
            setError("Passwords do not match");
            return;
        }
        if (regPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setRegLoading(true);
        try {
            await register(regUsername, regEmail, regPassword);
            router.push("/");
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "response" in err
                ? (err as any).response?.data?.error || "Registration failed"
                : "Registration failed";
            setError(msg);
        } finally {
            setRegLoading(false);
        }
    };

    // Password strength logic
    const getStrengthIndicators = () => {
        const len = regPassword.length;
        let c1 = "bg-slate-200", c2 = "bg-slate-200", c3 = "bg-slate-200";
        if (len > 0) c1 = "bg-red-400";
        if (len > 5) c2 = "bg-yellow-400";
        if (len > 8) c3 = "bg-green-500";
        return { c1, c2, c3 };
    };

    const str = getStrengthIndicators();

    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-800" style={{
            backgroundColor: "#f4f3ee",
            backgroundImage: "radial-gradient(#b1ada1 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px"
        }}>
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo Section */}
                    <div className="text-center mb-8">
                        <div className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#c15f3c] text-white mb-4 shadow-lg shadow-[#c15f3c]/20">
                            <span className="text-2xl font-bold">&lt;/&gt;</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">NgodingYuk!</h1>
                        <p className="text-[#b1ada1] text-sm mt-2">Start your coding journey today</p>
                    </div>

                    {/* Auth Card */}
                    <div
                        className="bg-white border border-[#b1ada1] transition-all duration-500"
                    >
                        {/* Tab Navigation */}
                        <div className="flex border-b border-[#b1ada1]">
                            <button
                                type="button"
                                onClick={() => { setActiveTab("signin"); setError(""); }}
                                className={`flex-1 py-4 text-sm font-bold transition-all outline-none border-r border-[#b1ada1] uppercase tracking-widest ${activeTab === "signin" ? "text-white bg-[#c15f3c]" : "text-[#b1ada1] hover:text-slate-900 bg-white"}`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveTab("register"); setError(""); }}
                                className={`flex-1 py-4 text-sm font-bold transition-all outline-none uppercase tracking-widest ${activeTab === "register" ? "text-white bg-[#c15f3c]" : "text-[#b1ada1] hover:text-slate-900 bg-white"}`}
                            >
                                Create Account
                            </button>
                        </div>

                        <div className="p-8">
                            {error && (
                                <div className="flex items-start gap-3 bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm border border-red-100">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {activeTab === "signin" ? (
                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#b1ada1] uppercase tracking-wider block">Email Address</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#b1ada1]">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                                            </span>
                                            <input
                                                type="email"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-[#b1ada1] text-sm text-[#1c1917] transition-all focus:border-[#c15f3c] focus:outline-none"
                                                placeholder="dev@ngodingyuk.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-semibold text-[#b1ada1] uppercase tracking-wider block">Password</label>
                                            <a href="#" className="text-xs text-[#c15f3c] hover:underline font-medium">Forgot Password?</a>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#b1ada1]">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            </span>
                                            <input
                                                type={showLoginPassword ? "text" : "password"}
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className="w-full pl-10 pr-12 py-3 bg-white border border-[#b1ada1] text-sm text-[#1c1917] transition-all focus:border-[#c15f3c] focus:outline-none"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b1ada1] hover:text-slate-600"
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    {showLoginPassword ? (
                                                        <>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                        </>
                                                    )}
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loginLoading}
                                        className="w-full bg-[#c15f3c] hover:bg-[#f4f3ee] hover:text-[#c15f3c] text-white font-bold py-3 px-4 border border-[#c15f3c] transition-colors mt-4 disabled:opacity-70 uppercase tracking-widest"
                                    >
                                        {loginLoading ? "Signing In..." : "Sign In"}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#b1ada1] uppercase tracking-wider block">Username</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#b1ada1]">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                            </span>
                                            <input
                                                type="text"
                                                value={regUsername}
                                                onChange={(e) => setRegUsername(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-[#b1ada1] text-sm text-[#1c1917] transition-all focus:border-[#c15f3c] focus:outline-none"
                                                placeholder="coding_ninja"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#b1ada1] uppercase tracking-wider block">Email Address</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#b1ada1]">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            </span>
                                            <input
                                                type="email"
                                                value={regEmail}
                                                onChange={(e) => setRegEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-[#b1ada1] text-sm text-[#1c1917] transition-all focus:border-[#c15f3c] focus:outline-none"
                                                placeholder="hello@world.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#b1ada1] uppercase tracking-wider block">Password</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#b1ada1]">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            </span>
                                            <input
                                                type={showRegPassword ? "text" : "password"}
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                className="w-full pl-10 pr-12 py-3 bg-white border border-[#b1ada1] text-sm text-[#1c1917] transition-all focus:border-[#c15f3c] focus:outline-none"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowRegPassword(!showRegPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b1ada1] hover:text-slate-600"
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    {showRegPassword ? (
                                                        <>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                        </>
                                                    )}
                                                </svg>
                                            </button>
                                        </div>
                                        {/* Strength Indicator */}
                                        <div className="flex gap-1 pt-1 h-1">
                                            <div className={`h-full flex-1 transition-all ${str.c1}`}></div>
                                            <div className={`h-full flex-1 transition-all ${str.c2}`}></div>
                                            <div className={`h-full flex-1 transition-all ${str.c3}`}></div>
                                        </div>
                                        <p className="text-[10px] text-[#b1ada1] text-right uppercase tracking-widest mt-1">Password strength</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#b1ada1] uppercase tracking-wider block">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={regConfirm}
                                            onChange={(e) => setRegConfirm(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-[#b1ada1] text-sm text-[#1c1917] transition-all focus:border-[#c15f3c] focus:outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={regLoading}
                                        className="w-full bg-[#c15f3c] hover:bg-[#f4f3ee] hover:text-[#c15f3c] text-white font-bold py-3 px-4 border border-[#c15f3c] transition-colors mt-2 disabled:opacity-70 uppercase tracking-widest"
                                    >
                                        {regLoading ? "Creating Account..." : "Create Account"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-xs text-[#b1ada1]">
                <p>© 2026 NgodingYuk! — All rights reserved</p>
            </footer>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f4f3ee]" />}>
            <AuthContent />
        </Suspense>
    );
}
