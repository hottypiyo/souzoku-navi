"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { posthog } from "@/lib/posthog";

interface CaseOption {
  id: string;
  deceased_name: string | null;
  death_date: string | null;
}

interface Member {
  id: string;
  invited_email: string;
  joined_at: string | null;
  invited_at: string;
}

export default function FamilySettingsPage() {
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already">("idle");
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("cases").select("id, deceased_name, death_date").eq("user_id", user.id).order("created_at", { ascending: false });
      setCases(data ?? []);
      if (data && data.length > 0) setSelectedCase(data[0].id);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedCase) return;
    loadMembersForCase(selectedCase);
  }, [selectedCase]);

  async function loadMembersForCase(caseId: string) {
    setLoadingMembers(true);
    const res = await fetch(`/api/cases/${caseId}/members`);
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? []);
    }
    setLoadingMembers(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/cases/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: selectedCase, email }),
    });
    if (res.ok) {
      posthog.capture("family_invite_sent");
      setStatus("success");
      setEmail("");
      loadMembersForCase(selectedCase);
    } else {
      const data = await res.json();
      setStatus(data.error === "already_invited" ? "already" : "error");
    }
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <a href="/dashboard" className="text-base font-semibold text-slate-800">相続手続きナビ</a>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">ダッシュボードへ</a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">家族と共有する</h1>
          <p className="mt-1 text-sm text-slate-500">
            相続手続きを家族で分担できるよう、案件を共有できます。招待されたメンバーはタスク一覧を閲覧できます。
          </p>
        </div>

        {cases.length > 1 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">共有する案件</label>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.deceased_name ? `${c.deceased_name}さんの相続` : "相続案件"}{c.death_date ? `（${c.death_date}）` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">メンバーを招待する</h2>
          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="family@example.com"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={status === "loading" || !selectedCase}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {status === "loading" ? "送信中…" : "招待する"}
            </button>
          </form>
          {status === "success" && <p className="text-sm text-green-600">招待メールを送信しました。</p>}
          {status === "already" && <p className="text-sm text-amber-600">このメールアドレスはすでに招待済みです。</p>}
          {status === "error" && <p className="text-sm text-red-600">送信に失敗しました。再度お試しください。</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-slate-800">招待済みメンバー</h2>
          {loadingMembers ? (
            <p className="text-sm text-slate-400">読み込み中…</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-slate-400">まだ招待したメンバーはいません。</p>
          ) : (
            <ul className="space-y-3">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-800">{m.invited_email}</p>
                    <p className="text-xs text-slate-400">
                      {m.joined_at ? "参加済み" : "招待中（未参加）"}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    m.joined_at ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {m.joined_at ? "参加済み" : "待機中"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
