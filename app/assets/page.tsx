import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AssetsClient, { type Asset } from "./assets-client";

export const metadata = { title: "財産一覧表" };

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, premium_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (profile.premium_expires_at === null ||
      new Date(profile.premium_expires_at) > new Date());

  const params = await searchParams;

  const [{ data: ownCases }, { data: memberRows }] = await Promise.all([
    supabase.from("cases").select("id, deceased_name").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("case_members").select("case_id").eq("user_id", user.id).not("joined_at", "is", null),
  ]);

  const memberCaseIds = (memberRows ?? []).map((r) => r.case_id);
  let memberCases: { id: string; deceased_name: string | null }[] = [];
  if (memberCaseIds.length > 0) {
    const { data } = await supabase.from("cases").select("id, deceased_name").in("id", memberCaseIds);
    memberCases = data ?? [];
  }

  const allCases = [
    ...(ownCases ?? []),
    ...memberCases.filter((mc) => !(ownCases ?? []).some((oc) => oc.id === mc.id)),
  ];

  if (allCases.length === 0) redirect("/onboarding");

  let caseId = params.case;
  if (!caseId || !allCases.find((c) => c.id === caseId)) {
    caseId = allCases[0].id;
  }

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  const isOwner = (ownCases ?? []).some((c) => c.id === caseId);

  return (
    <AssetsClient
      isPremium={isPremium}
      isOwner={isOwner}
      cases={allCases}
      selectedCaseId={caseId}
      initialAssets={(assets ?? []) as unknown as Asset[]}
    />
  );
}
