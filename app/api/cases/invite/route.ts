import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  const { caseId, email } = await request.json();
  if (!caseId || !email) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // ケースの所有者確認
  const { data: caseData } = await supabase.from("cases").select("id, deceased_name").eq("id", caseId).eq("user_id", user.id).single();
  if (!caseData) return NextResponse.json({ error: "case not found" }, { status: 404 });

  const service = await createServiceClient();
  const inviteExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: member, error } = await service.from("case_members").insert({
    case_id: caseId,
    invited_email: email,
    invited_at: new Date().toISOString(),
    invite_expires_at: inviteExpiresAt,
  }).select("invite_token").single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "already_invited" }, { status: 409 });
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://souzoku-navi.app"}/invite/${member.invite_token}`;
  const caseName = caseData.deceased_name ? `${caseData.deceased_name}さんの相続手続き` : "相続手続き";

  await sendEmail({
    to: email,
    subject: `【相続手続きナビ】${caseName}への招待`,
    html: `
      <p>相続手続きナビで、${caseName}の共有メンバーに招待されました。</p>
      <p>以下のリンクから参加してください（有効期限：30日間）。</p>
      <p><a href="${inviteUrl}">${inviteUrl}</a></p>
      <p>このメールに心当たりがない場合は無視してください。</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
