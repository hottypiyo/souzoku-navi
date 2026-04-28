import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.SUPABASE_HOOK_SECRET || authHeader !== `Bearer ${process.env.SUPABASE_HOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json() as {
    user: { email: string };
    email_data: {
      token_hash: string;
      redirect_to: string;
      email_action_type: string;
    };
  };

  const { user, email_data } = payload;
  if (!user?.email || !email_data?.token_hash) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { token_hash, redirect_to, email_action_type } = email_data;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const params = new URLSearchParams({ token: token_hash, type: email_action_type, redirect_to });
  const confirmUrl = `${supabaseUrl}/auth/v1/verify?${params.toString()}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://souzoku-navi.app";

  const isPasswordReset = email_action_type === "recovery";

  await sendEmail({
    to: user.email,
    subject: isPasswordReset
      ? "【相続手続きナビ】パスワードのリセット"
      : "【相続手続きナビ】メールアドレスの確認",
    html: buildAuthEmail({ confirmUrl, appUrl, isPasswordReset }),
  });

  return NextResponse.json({ message: "ok" });
}

function buildAuthEmail({
  confirmUrl,
  appUrl,
  isPasswordReset,
}: {
  confirmUrl: string;
  appUrl: string;
  isPasswordReset: boolean;
}) {
  const heading = isPasswordReset ? "パスワードをリセットする" : "メールアドレスを確認する";
  const body = isPasswordReset
    ? "パスワードのリセットが申請されました。下のボタンをクリックして新しいパスワードを設定してください。"
    : "相続手続きナビにご登録いただきありがとうございます。下のボタンをクリックしてアカウントを有効化してください。";
  const buttonText = isPasswordReset ? "パスワードをリセット" : "メールアドレスを確認";

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <div style="background:#2563eb;padding:24px 32px;">
      <h1 style="margin:0;color:#fff;font-size:18px;font-weight:600;">相続手続きナビ</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1e293b;">${heading}</h2>
      <p style="margin:0 0 28px;color:#334155;font-size:15px;line-height:1.6;">${body}</p>
      <div style="text-align:center;">
        <a href="${confirmUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">${buttonText}</a>
      </div>
      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">このリンクの有効期限は24時間です。心当たりがない場合は無視してください。</p>
    </div>
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
        本サービスは情報提供を目的としており、法律相談・税務相談ではありません。<br>
        <a href="${appUrl}" style="color:#2563eb;">相続手続きナビ</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
