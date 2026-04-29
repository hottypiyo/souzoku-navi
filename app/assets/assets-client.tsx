"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ASSET_TYPES = [
  { value: "real_estate", label: "不動産" },
  { value: "bank", label: "預貯金" },
  { value: "investment", label: "有価証券・株式" },
  { value: "insurance", label: "生命保険" },
  { value: "pension", label: "年金・退職金" },
  { value: "other", label: "その他" },
] as const;

type AssetType = (typeof ASSET_TYPES)[number]["value"];

interface Asset {
  id: string;
  asset_type: string;
  name: string;
  institution: string | null;
  estimated_value: number | null;
  notes: string | null;
}

interface CaseOption {
  id: string;
  deceased_name: string | null;
}

interface Props {
  isPremium: boolean;
  isOwner: boolean;
  cases: CaseOption[];
  selectedCaseId: string;
  initialAssets: Asset[];
}

const emptyForm = {
  asset_type: "bank" as AssetType,
  name: "",
  institution: "",
  estimated_value: "",
  notes: "",
};

export default function AssetsClient({ isPremium, isOwner, cases, selectedCaseId, initialAssets }: Props) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = createClient();

  const totalValue = assets.reduce((sum, a) => sum + (a.estimated_value ?? 0), 0);

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(asset: Asset) {
    setEditingId(asset.id);
    setForm({
      asset_type: asset.asset_type as AssetType,
      name: asset.name,
      institution: asset.institution ?? "",
      estimated_value: asset.estimated_value?.toString() ?? "",
      notes: asset.notes ?? "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      asset_type: form.asset_type,
      name: form.name,
      institution: form.institution || null,
      estimated_value: form.estimated_value ? parseInt(form.estimated_value, 10) : null,
      notes: form.notes || null,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("assets")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editingId)
        .select()
        .single();
      if (!error && data) {
        setAssets((prev) => prev.map((a) => (a.id === editingId ? data : a)));
      }
    } else {
      const { data, error } = await supabase
        .from("assets")
        .insert({ ...payload, case_id: selectedCaseId })
        .select()
        .single();
      if (!error && data) {
        setAssets((prev) => [...prev, data]);
      }
    }

    setSaving(false);
    cancelForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("この財産を削除しますか？")) return;
    setDeletingId(id);
    await supabase.from("assets").delete().eq("id", id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between flex-wrap gap-3">
          <a href="/dashboard" className="text-base font-semibold text-slate-800">相続手続きナビ</a>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">ダッシュボードへ</a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">財産一覧表</h1>
            <p className="mt-1 text-sm text-slate-500">相続財産を一覧で管理できます。</p>
          </div>
          {cases.length > 1 && (
            <form className="flex items-center gap-2">
              <select
                name="case"
                defaultValue={selectedCaseId}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("case", e.target.value);
                  window.location.href = url.toString();
                }}
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.deceased_name ? `${c.deceased_name}さんの相続` : "相続案件"}
                  </option>
                ))}
              </select>
            </form>
          )}
        </div>

        {!isPremium && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
            <p className="mb-1 font-semibold text-blue-800">プレミアムプラン限定機能</p>
            <p className="mb-4 text-sm text-blue-600">財産一覧表の作成・管理はプレミアムプランでご利用いただけます。</p>
            <a href="/upgrade" className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              プレミアムにアップグレード
            </a>
          </div>
        )}

        {isPremium && (
          <>
            {showForm && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 font-semibold text-slate-800">{editingId ? "財産を編集" : "財産を追加"}</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">種別 *</label>
                      <select
                        required
                        value={form.asset_type}
                        onChange={(e) => setForm({ ...form, asset_type: e.target.value as AssetType })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {ASSET_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">概算額（円）</label>
                      <input
                        type="number"
                        min="0"
                        value={form.estimated_value}
                        onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
                        placeholder="例: 3000000"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">名称・概要 *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="例: ○○銀行普通預金、△△市の自宅土地・建物"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">金融機関・所在地</label>
                    <input
                      type="text"
                      value={form.institution}
                      onChange={(e) => setForm({ ...form, institution: e.target.value })}
                      placeholder="例: ○○銀行 ○○支店、東京都○○区○○"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">メモ</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                      placeholder="口座番号、証券番号、権利証の保管場所など"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "保存中…" : "保存する"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="rounded-lg border border-slate-200 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!showForm && isOwner && (
              <button
                onClick={startAdd}
                className="mb-6 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <span className="text-lg leading-none">+</span> 財産を追加する
              </button>
            )}

            {assets.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <p className="text-sm text-slate-400">まだ財産が登録されていません。「財産を追加する」から登録してください。</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">種別</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">名称・概要</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">金融機関・所在地</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">概算額</th>
                      {isOwner && <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assets.map((asset) => {
                      const typeLabel = ASSET_TYPES.find((t) => t.value === asset.asset_type)?.label ?? asset.asset_type;
                      return (
                        <tr key={asset.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{typeLabel}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800">{asset.name}</p>
                            {asset.notes && <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{asset.notes}</p>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{asset.institution ?? "—"}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-800">
                            {asset.estimated_value != null
                              ? `¥${asset.estimated_value.toLocaleString()}`
                              : "—"}
                          </td>
                          {isOwner && (
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => startEdit(asset)}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => handleDelete(asset.id)}
                                  disabled={deletingId === asset.id}
                                  className="text-xs text-red-500 hover:underline disabled:opacity-40"
                                >
                                  削除
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  {totalValue > 0 && (
                    <tfoot className="border-t border-slate-200 bg-slate-50">
                      <tr>
                        <td colSpan={isOwner ? 3 : 2} className="px-4 py-3 text-xs font-semibold text-slate-500 text-right hidden sm:table-cell">合計概算額</td>
                        <td colSpan={isOwner ? 3 : 2} className="px-4 py-3 text-xs font-semibold text-slate-500 sm:hidden">合計概算額</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">¥{totalValue.toLocaleString()}</td>
                        {isOwner && <td />}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            <p className="mt-4 text-xs text-slate-400">
              ※ 概算額は把握のための目安です。相続税申告に使用する正式な評価額は専門家にご確認ください。
            </p>
          </>
        )}
      </main>
    </div>
  );
}
