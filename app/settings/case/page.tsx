"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface CaseData {
  id: string;
  mode: string;
  deceased_name: string | null;
  death_date: string | null;
  has_real_estate: boolean;
  has_will: string;
  heir_count: number;
  debt_concern: boolean;
  has_securities: boolean;
  has_pension: boolean;
  has_life_insurance: boolean;
}

const WILL_OPTIONS = [
  { value: "none", label: "ない" },
  { value: "notarized", label: "公正証書遺言がある" },
  { value: "handwritten", label: "自筆証書遺言がある" },
  { value: "unknown", label: "わからない" },
];

export default function CaseSettingsPage() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<Partial<CaseData>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("cases")
        .select(
          "id,mode,deceased_name,death_date,has_real_estate,has_will,heir_count,debt_concern,has_securities,has_pension,has_life_insurance"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setCases(data as CaseData[]);
        setSelectedId(data[0].id);
        setForm(data[0] as CaseData);
      }
      setLoading(false);
    }
    load();
  }, []);

  function selectCase(id: string) {
    const c = cases.find((c) => c.id === id);
    if (c) { setSelectedId(id); setForm(c); setSaved(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/cases/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setCases((prev) => prev.map((c) => (c.id === selectedId ? { ...c, ...form } : c)));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">読み込み中…</p>
      </div>
    );
  }

  const isActive = form.mode === "active";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-800">案件情報の編集</h1>
            <p className="text-xs text-slate-500">オンボーディングで入力した情報を変更できます</p>
          </div>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">
            ← ダッシュボードへ
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {cases.length > 1 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">編集する案件</label>
            <select
              value={selectedId}
              onChange={(e) => selectCase(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.deceased_name ? `${c.deceased_name}さんの相続` : "相続案件"}
                  {c.death_date ? `（${c.death_date}）` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">基本情報</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {isActive ? "故人のお名前" : "対象者のお名前"}（任意）
              </label>
              <input
                type="text"
                value={form.deceased_name ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, deceased_name: e.target.value || null }))}
                placeholder="例：田中一郎"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isActive && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  お亡くなりになった日
                </label>
                <input
                  type="date"
                  value={form.death_date ?? ""}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm((f) => ({ ...f, death_date: e.target.value || null }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">相続人の人数</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.heir_count ?? 1}
                onChange={(e) => setForm((f) => ({ ...f, heir_count: parseInt(e.target.value) || 1 }))}
                className="w-32 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">財産・遺言の状況</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">遺言書</label>
              <select
                value={form.has_will ?? "unknown"}
                onChange={(e) => setForm((f) => ({ ...f, has_will: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {WILL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {[
              { key: "has_real_estate" as const, label: "不動産（土地・建物）がある" },
              { key: "has_securities" as const, label: "有価証券（株・投信）がある" },
              { key: "has_pension" as const, label: "年金の未支給がある可能性がある" },
              { key: "has_life_insurance" as const, label: "生命保険がある" },
              { key: "debt_concern" as const, label: "借金・債務が心配" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>

          {saved && (
            <div className="animate-fade-in-down rounded-xl bg-green-50 border border-green-100 px-5 py-3 text-sm text-green-700">
              保存しました。
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "保存中…" : "変更を保存する"}
          </button>
        </form>
      </main>
    </div>
  );
}
