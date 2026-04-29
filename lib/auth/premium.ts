import type { Tables } from "@/lib/supabase/types";

type Profile = Pick<Tables<"profiles">, "plan" | "premium_expires_at">;

export function isPremiumProfile(profile: Profile | null | undefined): boolean {
  if (!profile) return false;
  return (
    profile.plan === "premium" &&
    (profile.premium_expires_at === null ||
      new Date(profile.premium_expires_at) > new Date())
  );
}
