import AppShell from "@/app/components/AppShell";
import { CourseListItem } from "@/app/lib/types";
import { CourseListClient } from "./CourseListClient";

// Next.js config to prevent build failures during static generation
export const dynamic = "force-dynamic";

// Server Component
export default async function KelasPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // Determine query parameters from searchParams
    const language = typeof searchParams.language === "string" ? searchParams.language : undefined;

    // Server-side data fetch using native fetch (RSC API)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    let url = `${API_URL}/courses`;
    if (language) {
        url += `?language=${encodeURIComponent(language)}`;
    }

    let courses: CourseListItem[] = [];
    try {
        const res = await fetch(url, {
            // Avoid aggressive caching to ensure immediate updates if DB changed (optional config)
            cache: "no-store",
        });
        if (res.ok) {
            const data = await res.json();
            courses = data.data || [];
        }
    } catch (e) {
        // Handle gracefully, log strictly on server side if needed
        console.error("Failed to fetch courses server-side:", e);
    }

    return (
        <AppShell>
            <CourseListClient courses={courses} />
        </AppShell>
    );
}
