import AppShell from "@/app/components/AppShell";
import { CourseListItem } from "@/app/lib/types";
import { CourseListClient } from "./CourseListClient";

// Next.js config to prevent build failures during static generation
export const dynamic = "force-dynamic";

export default function KelasPage() {
    return (
        <AppShell>
            <CourseListClient />
        </AppShell>
    );
}
