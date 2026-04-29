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

export interface Asset {
  id: string;
  asset_type: string;
  name: string;
  institution: string | null;
  estimated_value: number | null;
  notes: string | null;
  details: Record<string, string> | null;
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

type FieldDef =
  | { key: string; label: string; type: "text" | "number"; placeholder?: string }
  | { key: string; label: string; type: "select"; options: string[] };

const EXTRA_FIELDS: Record<AssetType, FieldDef[]> = {
  real_estate: [
    { key: "property_type", label: "種別", type: "select", options: ["土地", "建物", "土地・建物", "マンション（区分）", "その他"] },
    { key: "location", label: "所在地", type: "text", placeholder: "例：東京都○○区○○1-2-3" },
    { key: "parcel_number", label: "地番・家屋番号", type: "text", placeholder: "例：123番4" },
    { key: "area_sqm", label: "面積（㎡）", type: "number", placeholder: "例：120.5" },
    { key: "assessed_value", label: "固定資産税評価額（円）", type: "number", placeholder: "例：15000000" },
  ],
  bank: [
    { key: "branch_name", label: "支店名", type: "text", placeholder: "例：渋谷支店" },
    { key: "account_type", label: "口座種別", type: "select", options: ["普通預金", "定期預金", "当座預金", "貯蓄預金", "その他"] },
    { key: "account_number", label: "口座番号（下4桁）", type: "text", placeholder: "例：1234" },
  ],
  investment: [
    { key: "securities_type", label: "種別", type: "select", options: ["株式", "投資信託", "債券", "外貨・FX", "その他"] },
    { key: "account_number", label: "口座番号", type: "text", placeholder: "例：12345678" },
  ],
  insurance: [
    { key: "policy_type", label: "保険種類", type: "select", options: ["終身保険", "定期保険", "養老保険", "個人年金保険", "その他"] },
    { key: "policy_number", label: "証券番号", type: "text", placeholder: "例：AB-12345678" },
    { key: "beneficiary", label: "受取人", type: "text", placeholder: "例：配偶者" },
  ],
  pension: [
    { key: "pension_type", label: "種別", type: "select", options: ["国民年金", "厚生年金", "退職金", "企業年金", "確定拠出年金（iDeCo含む）", "その他"] },
    { key: "basic_pension_number", label: "基礎年金番号", type: "text", placeholder: "例：1234-567890" },
  ],
  other: [],
};

const INSTITUTION_CONFIG: Partial<Record<AssetType, { label: string; placeholder: string; required: boolean }>> = {
  bank: { label: "金融機関名", placeholder: "例：○○銀行、○○信用金庫", required: true },
  investment: { label: "証券会社名", placeholder: "例：○○証券", required: true },
  insurance: { label: "保険会社名", placeholder: "例：○○生命保険", required: true },
  pension: { label: "支給元・会社名", placeholder: "例：○○株式会社、日本年金機構", required: false },
  other: { label: "保管場所・管理元", placeholder: "例：自宅金庫、法務局", required: false },
};

const NAME_CONFIG: Record<AssetType, { label: string; placeholder: string; required: boolean }> = {
  real_estate: { label: "物件名", placeholder: "例：自宅、祖父の山林", required: true },
  bank: { label: "名称・メモ", placeholder: "例：給与振込口座、老後用定期", required: false },
  investment: { label: "銘柄・内容概要", placeholder: "例：日本株式インデックスファンドほか", required: false },
  insurance: { label: "名称・補足", placeholder: "例：老後のための終身保険", required: false },
  pension: { label: "補足", placeholder: "例：平成○年○月まで在職", required: false },
  other: { label: "名称", placeholder: "例：骨董品コレクション、ゴルフ会員権", required: true },
};

const VALUE_LABEL: Record<AssetType, string> = {
  real_estate: "評価額概算（円）",
  bank: "残高概算（円）",
  investment: "評価額概算（円）",
  insurance: "死亡保険金額（円）",
  pension: "概算額（円）",
  other: "概算額（円）",
};

const emptyForm = {
  asset_type: "bank" as AssetType,
  name: "",
  institution: "",
  estimated_value: "",
  notes: "",
  details: {} as Record<string, string>,
};

function getDetail(details: Record<string, string> | null | undefined, key: string): string {
  return details?.[key] ?? "";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span className="text-xs text-slate-500">
      <span className="text-slate-400">{label}：</span>{value}
    </span>
  );
}

function AssetCard({
  asset,
  isOwner,
  onEdit,
  onDelete,
  deleting,
}: {
  asset: Asset;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const typeLabel = ASSET_TYPES.find((t) => t.value === asset.asset_type)?.label ?? asset.asset_type;
  const d = asset.details ?? {};

  const primaryName =
    asset.asset_type !== "real_estate" && asset.institution
      ? asset.institution
      : asset.name || "—";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {typeLabel}
            </span>
            {asset.estimated_value != null && (
              <span className="ml-auto text-sm font-bold text-slate-800">
                ¥{asset.estimated_value.toLocaleString()}
              </span>
            )}
          </div>

          <p className="font-semibold text-slate-800 mb-1.5">{primaryName}</p>

          {/* Type-specific detail rows */}
          {asset.asset_type === "real_estate" && (
            <div className="flex flex-col gap-0.5">
              {d.location && <span className="text-xs text-slate-500">{d.location}</span>}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                <DetailRow label="種別" value={d.property_type} />
                <DetailRow label="面積" value={d.area_sqm ? `${d.area_sqm}㎡` : ""} />
                <DetailRow label="地番・家屋番号" value={d.parcel_number} />
              </div>
              {d.assessed_value && (
                <span className="text-xs text-slate-500">
                  <span className="text-slate-400">固定資産税評価額：</span>
                  ¥{Number(d.assessed_value).toLocaleString()}
                </span>
              )}
              {asset.name && asset.name !== asset.institution && (
                <span className="text-xs text-slate-400">{asset.name}</span>
              )}
            </div>
          )}

          {asset.asset_type === "bank" && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              <DetailRow label="支店" value={d.branch_name} />
              <DetailRow label="種別" value={d.account_type} />
              <DetailRow label="口座番号末尾" value={d.account_number} />
              {asset.name && <span className="text-xs text-slate-400 w-full mt-0.5">{asset.name}</span>}
            </div>
          )}

          {asset.asset_type === "investment" && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              <DetailRow label="種別" value={d.securities_type} />
              <DetailRow label="口座番号" value={d.account_number} />
              {asset.name && <span className="text-xs text-slate-400 w-full mt-0.5">{asset.name}</span>}
            </div>
          )}

          {asset.asset_type === "insurance" && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              <DetailRow label="種類" value={d.policy_type} />
              <DetailRow label="証券番号" value={d.policy_number} />
              <DetailRow label="受取人" value={d.beneficiary} />
              {asset.name && <span className="text-xs text-slate-400 w-full mt-0.5">{asset.name}</span>}
            </div>
          )}

          {asset.asset_type === "pension" && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              <DetailRow label="種別" value={d.pension_type} />
              <DetailRow label="基礎年金番号" value={d.basic_pension_number} />
              {asset.institution && d.pension_type && (
                <DetailRow label="支給元" value={asset.institution} />
              )}
              {asset.name && <span className="text-xs text-slate-400 w-full mt-0.5">{asset.name}</span>}
            </div>
          )}

          {asset.asset_type === "other" && asset.institution && (
            <span className="text-xs text-slate-500">{asset.institution}</span>
          )}

          {asset.notes && (
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">{asset.notes}</p>
          )}
        </div>

        {isOwner && (
          <div className="flex gap-2 shrink-0 pt-0.5">
            <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">
              編集
            </button>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="text-xs text-red-500 hover:underline disabled:opacity-40"
            >
              削除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssetsClient({
  isPremium,
  isOwner,
  cases,
  selectedCaseId,
  initialAssets,
}: Props) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = createClient();
  const totalValue = assets.reduce((sum, a) => sum + (a.estimated_value ?? 0), 0);

  const extraFields = EXTRA_FIELDS[form.asset_type];
  const institutionConf = INSTITUTION_CONFIG[form.asset_type];
  const nameConf = NAME_CONFIG[form.asset_type];

  function setDetail(key: string, value: string) {
    setForm((prev) => ({ ...prev, details: { ...prev.details, [key]: value } }));
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(asset: Asset) {
    setEditingId(asset.id);
    setForm({
      asset_type: asset.asset_type as AssetType,
      name: asset.name ?? "",
      institution: asset.institution ?? "",
      estimated_value: asset.estimated_value?.toString() ?? "",
      notes: asset.notes ?? "",
      details: (asset.details as Record<string, string>) ?? {},
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

    const typeLabel = ASSET_TYPES.find((t) => t.value === form.asset_type)?.label ?? form.asset_type;
    const payload = {
      asset_type: form.asset_type,
      name: form.name || form.institution || typeLabel,
      institution: form.institution || null,
      estimated_value: form.estimated_value ? parseInt(form.estimated_value, 10) : null,
      notes: form.notes || null,
      details: Object.keys(form.details).length > 0 ? form.details : null,
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("assets")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editingId)
        .select()
        .single();
      if (!error && data) {
        setAssets((prev) => prev.map((a) => (a.id === editingId ? (data as unknown as Asset) : a)));
      }
    } else {
      const { data, error } = await supabase
        .from("assets")
        .insert({ ...payload, case_id: selectedCaseId })
        .select()
        .single();
      if (!error && data) {
        setAssets((prev) => [...prev, data as unknown as Asset]);
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

  const inputCls =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between flex-wrap gap-3">
          <a href="/dashboard" className="text-base font-semibold text-slate-800">
            相続手続きナビ
          </a>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">
            ダッシュボードへ
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">財産一覧表</h1>
            <p className="mt-1 text-sm text-slate-500">相続財産を種別ごとに詳細管理できます。</p>
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
            <p className="mb-4 text-sm text-blue-600">
              財産一覧表の作成・管理はプレミアムプランでご利用いただけます。
            </p>
            <a
              href="/upgrade"
              className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              プレミアムにアップグレード
            </a>
          </div>
        )}

        {isPremium && (
          <>
            {showForm && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 font-semibold text-slate-800">
                  {editingId ? "財産を編集" : "財産を追加"}
                </h2>
                <form onSubmit={handleSave} className="space-y-4">
                  {/* 種別 */}
                  <div>
                    <label className={labelCls}>種別 *</label>
                    <select
                      required
                      value={form.asset_type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          asset_type: e.target.value as AssetType,
                          details: {},
                          institution: "",
                        })
                      }
                      className={inputCls}
                    >
                      {ASSET_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 金融機関名・保険会社名など */}
                  {institutionConf && (
                    <div>
                      <label className={labelCls}>
                        {institutionConf.label}
                        {institutionConf.required && " *"}
                      </label>
                      <input
                        type="text"
                        required={institutionConf.required}
                        value={form.institution}
                        onChange={(e) => setForm({ ...form, institution: e.target.value })}
                        placeholder={institutionConf.placeholder}
                        className={inputCls}
                      />
                    </div>
                  )}

                  {/* 種別固有フィールド */}
                  {extraFields.map((field) => (
                    <div key={field.key}>
                      <label className={labelCls}>{field.label}</label>
                      {field.type === "select" ? (
                        <select
                          value={getDetail(form.details, field.key)}
                          onChange={(e) => setDetail(field.key, e.target.value)}
                          className={inputCls}
                        >
                          <option value="">未選択</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          min={field.type === "number" ? "0" : undefined}
                          step={field.type === "number" ? "any" : undefined}
                          value={getDetail(form.details, field.key)}
                          onChange={(e) => setDetail(field.key, e.target.value)}
                          placeholder={"placeholder" in field ? field.placeholder : undefined}
                          className={inputCls}
                        />
                      )}
                    </div>
                  ))}

                  {/* 名称フィールド */}
                  <div>
                    <label className={labelCls}>
                      {nameConf.label}
                      {nameConf.required && " *"}
                    </label>
                    <input
                      type="text"
                      required={nameConf.required}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={nameConf.placeholder}
                      className={inputCls}
                    />
                  </div>

                  {/* 概算額 */}
                  <div>
                    <label className={labelCls}>{VALUE_LABEL[form.asset_type]}</label>
                    <input
                      type="number"
                      min="0"
                      value={form.estimated_value}
                      onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
                      placeholder="例: 3000000"
                      className={inputCls}
                    />
                  </div>

                  {/* メモ */}
                  <div>
                    <label className={labelCls}>メモ</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                      placeholder="権利証の保管場所、担当者名、口座解約状況など"
                      className={inputCls}
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
                <p className="text-sm text-slate-400">
                  まだ財産が登録されていません。「財産を追加する」から登録してください。
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    isOwner={isOwner}
                    onEdit={() => startEdit(asset)}
                    onDelete={() => handleDelete(asset.id)}
                    deleting={deletingId === asset.id}
                  />
                ))}

                {totalValue > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">合計概算額</span>
                    <span className="text-base font-bold text-slate-800">
                      ¥{totalValue.toLocaleString()}
                    </span>
                  </div>
                )}
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
