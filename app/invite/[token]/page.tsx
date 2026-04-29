import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/invite/${token}`);
  }

  const service = await createServiceClient();
  const { data: member } = await service
    .from("case_members")
    .select("id, case_id, invited_email, joined_at, invite_expires_at")
    .eq("invite_token", token)
    .single();

  const isExpired =
    member?.invite_expires_at != null &&
    new Date(member.invite_expires_at) < new Date();

  if (!member || isExpired) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-2xl mb-3">⚠️</p>
          <h1 className="text-lg font-bold text-slate-800 mb-2">招待リンクが無効です</h1>
          <p className="text-sm text-slate-500">リンクが期限切れか、すでに使用済みの可能性があります。</p>
          <a href="/dashboard" className="mt-5 inline-block text-sm text-blue-600 hover:underline">ダッシュボードへ</a>
        </div>
      </div>
    );
  }

  if (!member.joined_at) {
    await service.from("case_members").update({
      user_id: user.id,
      joined_at: new Date().toISOString(),
    }).eq("id", member.id);
  }

  redirect(`/dashboard?case=${member.case_id}`);
}
