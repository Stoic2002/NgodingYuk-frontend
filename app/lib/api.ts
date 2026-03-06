import axios from "axios";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT token + locale to every request
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Inject locale from localStorage
        const locale = localStorage.getItem("locale") || "id";
        config.params = { ...config.params, locale };
    }
    return config;
});

// Handle 401 responses — auto refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });
                    const { access_token, refresh_token } = res.data;
                    localStorage.setItem("access_token", access_token);
                    localStorage.setItem("refresh_token", refresh_token);
                    error.config.headers.Authorization = `Bearer ${access_token}`;
                    return axios(error.config);
                } catch {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/login";
                }
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
    refresh: (refreshToken: string) =>
        api.post("/auth/refresh", { refresh_token: refreshToken }),
};

// ============ Challenges (Tantangan) ============
export const challengeAPI = {
    list: (params?: { language?: string; difficulty?: string; limit?: number; offset?: number }) =>
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
    list: (params?: { language?: string; level?: string }) =>
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
    updateMe: (data: { username?: string; locale?: string }) =>
        api.patch("/users/me", data),
};

export default api;
