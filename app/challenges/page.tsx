import AppShell from "@/app/components/AppShell";
import { ChallengeListClient } from "./ChallengeListClient";

export const dynamic = "force-dynamic";

export default function TantanganPage() {
    return (
        <AppShell>
            <ChallengeListClient />
        </AppShell>
    );
}
