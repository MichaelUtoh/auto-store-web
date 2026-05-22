import { BadgeCheck } from "lucide-react";
import type { MechanicProfileSummary } from "@/types/qa";

export function VerifiedMechanicBadge({
  profile,
}: {
  profile: MechanicProfileSummary;
}) {
  if (!profile.isVerified) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
      <BadgeCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
      Verified mechanic · {profile.businessName}
    </span>
  );
}
