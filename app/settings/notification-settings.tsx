"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  isPremium: boolean;
  email: string;
  lineUserId: string | null;
  notifyEmail: boolean;
  notifyLine: boolean;
  addFriendUrl: string;
}

export default function NotificationSettings({
  isPremium,
  email,
  lineUserId,
  notifyEmail,
  notifyLine,
  addFriendUrl,
}: Props) {
  const router = useRouter();
  const [emailEnabled, setEmailEnabled] = useState(notifyEmail);
  const [lineEnabled, setLineEnabled] = useState(notifyLine);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function save() {
    const supabase = createClient();
    await supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      await supabase
        .from("profiles")
        .update({ notify_email: emailEnabled, notify_line: lineEnabled })
        .eq("id", user.id);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {/* メール通知 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-800">メール通知</h2>
            <p className="mt-1 text-sm text-slate-500">
              期限の7日前・3日前・前日にリマインダーをメールで受け取ります。
            </p>
            <p className="mt-2 text-xs text-slate-400">送信先: {email}</p>
          </div>
          <button
            disabled={!isPremium}
            onClick={() => setEmailEnabled((v) => !v)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${
              emailEnabled && isPremium ? "bg-blue-600" : "bg-slate-200"
            } ${!isPremium ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <span
              className={`inline-block h-5 w-5 translate-y-1 rounded-full bg-white shadow transition-transform ${
                emailEnabled && isPremium ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* LINE通知 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-semibold text-slate-800">LINE通知</h2>
            <p className="mt-1 text-sm text-slate-500">
              期限の7日前・3日前・前日にLINEでリマインダーを受け取ります。
            </p>
            {lineUserId ? (
              <p className="mt-2 text-xs text-green-600">✓ LINE連携済み</p>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
                  <p className="font-medium text-slate-700 mb-2">連携手順</p>
                  <ol className="space-y-2 list-none">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">1</span>
                      <span>
                        まず公式アカウントを友達追加してください
                        {addFriendUrl && (
                          <a
                            href={addFriendUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`ml-2 inline-block rounded-md px-3 py-0.5 text-xs font-medium text-white transition ${
                              isPremium ? "bg-green-500 hover:bg-green-600" : "cursor-not-allowed bg-slate-300 pointer-events-none"
                            }`}
                          >
                            友達追加 →
                          </a>
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">2</span>
                      <span>
                        次にLINEアカウントと連携してください
                        <a
                          href="/api/auth/line"
                          className={`ml-2 inline-block rounded-md px-3 py-0.5 text-xs font-medium text-white transition ${
                            isPremium
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "cursor-not-allowed bg-slate-300 pointer-events-none"
                          }`}
                          onClick={(e) => !isPremium && e.preventDefault()}
                        >
                          LINEを連携する
                        </a>
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
          {lineUserId && (
            <button
              disabled={!isPremium}
              onClick={() => setLineEnabled((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${
                lineEnabled && isPremium ? "bg-green-500" : "bg-slate-200"
              } ${!isPremium ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span
                className={`inline-block h-5 w-5 translate-y-1 rounded-full bg-white shadow transition-transform ${
                  lineEnabled && isPremium ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex items-center gap-3">
        <button
          disabled={!isPremium || isPending}
          onClick={save}
          className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white transition ${
            isPremium
              ? "bg-blue-600 hover:bg-blue-700"
              : "cursor-not-allowed bg-slate-300"
          }`}
        >
          {isPending ? "保存中…" : "設定を保存"}
        </button>
        {saved && (
          <span className="text-sm text-green-600">保存しました</span>
        )}
      </div>
    </div>
  );
}
