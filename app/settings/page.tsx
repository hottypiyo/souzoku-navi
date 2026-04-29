import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPremiumProfile } from "@/lib/auth/premium";
import NotificationSettings from "./notification-settings";

export const metadata = { title: "通知設定" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ line?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, premium_expires_at, line_user_id, notify_email, notify_line")
    .eq("id", user.id)
    .single();

  const isPremium = isPremiumProfile(profile);

  const params = await searchParams;
  const lineStatus = params.line;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-800">通知設定</h1>
            <p className="text-xs text-slate-500">リマインダーの受け取り方法を設定します</p>
          </div>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">
            ← ダッシュボードへ
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {lineStatus === "connected" && (
          <div className="rounded-xl bg-green-50 border border-green-100 px-5 py-4 text-sm text-green-700">
            LINEの連携が完了しました。
          </div>
        )}
        {lineStatus === "error" && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-700">
            LINEの連携に失敗しました。もう一度お試しください。
          </div>
        )}

        {!isPremium && (
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-4 text-sm text-amber-800">
            通知機能はプレミアムプランでご利用いただけます。
            <a href="/upgrade" className="ml-2 font-medium underline">アップグレード →</a>
          </div>
        )}

        <NotificationSettings
          isPremium={isPremium}
          email={user.email ?? ""}
          lineUserId={profile?.line_user_id ?? null}
          notifyEmail={profile?.notify_email ?? true}
          notifyLine={profile?.notify_line ?? true}
          addFriendUrl={process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL ?? ""}
        />
      </main>
    </div>
  );
}
