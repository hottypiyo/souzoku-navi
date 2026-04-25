"use client";

import { useState } from "react";

const SPECIALIST_TYPES = [
  { value: "tax_accountant", label: "税理士" },
  { value: "judicial_scrivener", label: "司法書士" },
  { value: "administrative_scrivener", label: "行政書士" },
  { value: "lawyer", label: "弁護士" },
] as const;

const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

const SPECIALTY_OPTIONS = [
  "相続税申告", "相続放棄", "不動産相続登記", "遺産分割協議",
  "遺言書作成", "成年後見", "相続調査・戸籍収集", "銀行・証券口座の相続手続き",
  "事業承継", "国際相続",
];

export default function SpecialistRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    type: "",
    office_name: "",
    prefecture: "",
    city: "",
    email: "",
    phone: "",
    website: "",
    bio: "",
    specialties: [] as string[],
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function toggleSpecialty(s: string) {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/specialists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "送信に失敗しました");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "エラーが発生しました");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-5xl">✅</div>
          <h1 className="mb-3 text-xl font-bold text-slate-800">登録申請を受け付けました</h1>
          <p className="text-sm text-slate-600">
            内容を確認の上、通常3営業日以内にメールにてご連絡いたします。
            審査が通り次第、専門家ページに掲載されます。
          </p>
          <a href="/" className="mt-6 inline-block text-sm text-blue-600 hover:underline">
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <a href="/" className="text-base font-semibold text-slate-800">相続手続きナビ</a>
          <span className="text-sm text-slate-500">専門家登録</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-800">専門家として登録する</h1>
          <p className="mt-2 text-sm text-slate-600">
            税理士・司法書士・行政書士・弁護士として相続専門家ディレクトリに掲載できます。
            登録後、当方で内容を確認の上、審査完了次第プレミアムユーザーに表示されます。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">基本情報</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="山田 太郎"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  資格区分 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {SPECIALIST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">事務所名</label>
              <input
                type="text"
                value={form.office_name}
                onChange={(e) => setForm((f) => ({ ...f, office_name: e.target.value }))}
                placeholder="○○税理士事務所"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  都道府県 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.prefecture}
                  onChange={(e) => setForm((f) => ({ ...f, prefecture: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">市区町村</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="渋谷区"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">連絡先</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="taro@example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-slate-400">審査結果の通知に使用します。掲載は任意です。</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">電話番号</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="03-0000-0000"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">ウェブサイト</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">専門分野</h2>

            <div className="flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    form.specialties.includes(s)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                自己紹介・対応エリアなど
              </label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="相続案件を専門に15年。東京・神奈川を中心に対応。初回相談無料。"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {status === "error" && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {status === "loading" ? "送信中…" : "登録を申請する"}
          </button>

          <p className="text-center text-xs text-slate-400">
            登録は無料です。審査後に掲載されます。掲載内容の変更・削除はメールにてご連絡ください。
          </p>
        </form>
      </main>
    </div>
  );
}
