import axios from "axios";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach locale to every request
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        // Inject locale from localStorage
        const locale = localStorage.getItem("locale") || "id";
        config.params = { ...config.params, locale };
    }
    return config;
});

// Handle 401 responses — auto refresh via cookies
let isRefreshing = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 AND we haven't already retried AND it's not the refresh endpoint itself
        if (
            error.response?.status === 401 &&
            typeof window !== "undefined" &&
            !originalRequest._retry &&
            originalRequest.url !== "/auth/refresh"
        ) {
            if (isRefreshing) {
                // If already refreshing, just reject and let the UI handle it (to prevent mass concurrent refresh calls)
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Backend will read refresh_token cookie and set new access_token cookie
                await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                isRefreshing = false;
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        // If it's a 401 on the refresh endpoint itself, just reject
        if (error.response?.status === 401 && originalRequest.url === "/auth/refresh") {
            if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

// ============ Auth ============
export const authAPI = {
    register: (data: { username: string; email: string; password: string }) =>
        api.post("/auth/register", data),
    login: (data: { email: string; password: string }) =>
        api.post("/auth/login", data),
    logout: () =>
        api.post("/auth/logout"),
    refresh: () =>
        api.post("/auth/refresh"),
};

// ============ Challenges (Tantangan) ============
export const challengeAPI = {
    list: (params?: { language?: string; difficulty?: string; search?: string; limit?: number; offset?: number }) =>
        api.get("/challenges", { params }),
    getBySlug: (slug: string) =>
        api.get(`/challenges/${slug}`),
    run: (slug: string, code: string) =>
        api.post(`/challenges/${slug}/run`, { code }),
    submit: (slug: string, code: string) =>
        api.post(`/challenges/${slug}/submit`, { code }),
    getMyProgress: (slug: string) =>
        api.get(`/challenges/${slug}/my-progress`),
};

// ============ Courses (Kelas) ============
export const courseAPI = {
    list: (params?: { language?: string; level?: string; search?: string; limit?: number; offset?: number }) =>
        api.get("/courses", { params }),
    getBySlug: (slug: string) =>
        api.get(`/courses/${slug}`),
    enroll: (slug: string) =>
        api.post(`/courses/${slug}/enroll`),
    getLessonDetail: (slug: string, lessonId: string) =>
        api.get(`/courses/${slug}/lessons/${lessonId}`),
    completeLesson: (slug: string, lessonId: string) =>
        api.post(`/courses/${slug}/lessons/${lessonId}/complete`),
    submitQuiz: (slug: string, lessonId: string, answers: number[]) =>
        api.post(`/courses/${slug}/lessons/${lessonId}/quiz`, { answers }),
    getMyProgress: (slug: string) =>
        api.get(`/courses/${slug}/my-progress`),
    getExam: (slug: string) =>
        api.get(`/courses/${slug}/exam`),
    submitExam: (slug: string, answers: number[]) =>
        api.post(`/courses/${slug}/exam/submit`, { answers }),
};

// ============ Leaderboard ============
export const leaderboardAPI = {
    getWeekly: () => api.get("/leaderboard/weekly"),
    getAllTime: () => api.get("/leaderboard/all-time"),
};

// ============ User ============
export const userAPI = {
    getMe: () => api.get("/users/me"),
    getXPHistory: (params?: { limit?: number; offset?: number }) =>
        api.get("/users/me/xp-history", { params }),
    getChallengeStats: () => api.get("/users/me/challenge-stats"),
    getCertificates: () => api.get("/users/me/certificates"),
    getQuizHistory: () => api.get("/users/me/quiz-history"),
    updateMe: (data: { username?: string; locale?: string }) =>
        api.patch("/users/me", data),
};

export default api;
