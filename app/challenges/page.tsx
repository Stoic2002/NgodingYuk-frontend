import { cookies } from "next/headers";
import AppShell from "@/app/components/AppShell";
import { ChallengeListItem } from "@/app/lib/types";
import { ChallengeListClient } from "./ChallengeListClient";

export default async function TantanganPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // 1. Read query params
    const language = typeof searchParams.language === "string" ? searchParams.language : "";
    const difficulty = typeof searchParams.difficulty === "string" ? searchParams.difficulty : "";
    const pageParam = typeof searchParams.page === "string" ? searchParams.page : "1";

    const limit = 10;
    const page = parseInt(pageParam, 10) || 1;
    const offset = (page - 1) * limit;

    // 2. Fetch server-side
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

    const urlObj = new URL(`${API_URL}/challenges`);
    if (language) urlObj.searchParams.set("language", language);
    if (difficulty) urlObj.searchParams.set("difficulty", difficulty);
    urlObj.searchParams.set("limit", limit.toString());
    urlObj.searchParams.set("offset", offset.toString());

    let challenges: ChallengeListItem[] = [];
    let totalPages = 1;

    try {
        // Read auth token to get personalized user progress metadata, if any
        // In Next.js 15+, cookies() is a Promise and must be awaited
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;
        const headers: HeadersInit = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(urlObj.toString(), {
            headers,
            cache: "no-store"
        });

        if (res.ok) {
            const data = await res.json();
            challenges = data.data || [];

            if (data.meta && data.meta.total_pages) {
                totalPages = data.meta.total_pages;
            } else {
                totalPages = challenges.length === limit ? page + 1 : page;
            }
        }
    } catch (e) {
        console.error("Failed to fetch challenges server-side:", e);
    }

    // 3. Render purely as Server Component
    return (
        <AppShell>
            <ChallengeListClient challenges={challenges} totalPages={totalPages} />
        </AppShell>
    );
}
