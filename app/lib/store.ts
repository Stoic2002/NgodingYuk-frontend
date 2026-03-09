"use client";
import { create } from "zustand";
import { authAPI, userAPI } from "@/app/lib/api";

interface User {
    id: string;
    username: string;
    email: string;
    xp: number;
    level: number;
    streak_count: number;
    locale: string;
}

interface AppState {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    theme: "dark" | "light";
    locale: "en" | "id";
    isSidebarCollapsed: boolean;

    // Actions
    setUser: (user: User | null) => void;
    login: (email: string, password: string) => Promise<void>;
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    toggleTheme: () => void;
    setLocale: (locale: "en" | "id") => void;
    initAuth: () => Promise<void>;
    toggleSidebar: () => void;

    // XP animation state
    xpPopup: { amount: number; visible: boolean };
    showXPGain: (amount: number) => void;

    // Level up state
    levelUpVisible: boolean;
    showLevelUp: () => void;
}

export const useStore = create<AppState>((set, get) => ({
    user: null,
    isLoggedIn: false,
    isLoading: true,
    theme: "dark",
    locale:
        (typeof window !== "undefined"
            ? (localStorage.getItem("locale") as "en" | "id")
            : null) || "id",
    isSidebarCollapsed: false,
    xpPopup: { amount: 0, visible: false },
    levelUpVisible: false,

    setUser: (user) => set({ user, isLoggedIn: !!user }),

    login: async (email, password) => {
        const res = await authAPI.login({ email, password });
        // The backend automatically sets the access_token and refresh_token in HttpOnly cookies
        const { user } = res.data;
        set({ user, isLoggedIn: true });
    },

    register: async (username, email, password) => {
        const res = await authAPI.register({ username, email, password });
        // The backend automatically sets the access_token and refresh_token in HttpOnly cookies
        const { user } = res.data;
        set({ user, isLoggedIn: true });
    },

    logout: async () => {
        try {
            await authAPI.logout();
        } catch {
            // Ignore if backend fails
        }
        set({ user: null, isLoggedIn: false });
    },

    refreshProfile: async () => {
        try {
            const res = await userAPI.getMe();
            const prevLevel = get().user?.level || 0;
            const newUser = res.data;
            set({ user: newUser });
            if (newUser.level > prevLevel && prevLevel > 0) {
                get().showLevelUp();
            }
        } catch {
            // Token might be invalid or expired
        }
    },

    toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        set({ theme: newTheme });
        document.documentElement.setAttribute("data-theme", newTheme);
    },

    setLocale: (locale) => {
        set({ locale });
        if (typeof window !== "undefined") {
            localStorage.setItem("locale", locale);
        }
        // Sync to backend
        if (get().isLoggedIn) {
            userAPI.updateMe({ locale }).catch(() => { });
        }
    },

    initAuth: async () => {
        try {
            // The browser will automatically send cookies with this request.
            // If the user isn't authenticated, the response will be 401 
            // (or handled by the interceptor which will try to refresh).
            const res = await userAPI.getMe();
            set({ user: res.data, isLoggedIn: true, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    showXPGain: (amount) => {
        set({ xpPopup: { amount, visible: true } });
        setTimeout(() => set({ xpPopup: { amount: 0, visible: false } }), 1500);
    },

    showLevelUp: () => {
        set({ levelUpVisible: true });
        setTimeout(() => set({ levelUpVisible: false }), 3000);
    },

    toggleSidebar: () => {
        set({ isSidebarCollapsed: !get().isSidebarCollapsed });
    },
}));
