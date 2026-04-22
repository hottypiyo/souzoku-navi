"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { WillType } from "@/lib/supabase/types";

type Mode = "active" | "preparation";
type MaybeBool = "yes" | "maybe" | "no";

interface FormState {
  mode: Mode | null;
  deceased_name: string;
  death_date: string;
  has_real_estate: boolean | null;
  has_will: WillType | null;
  // 家族構成（相続人数の推定に使う）
  has_spouse: boolean;
  has_children: boolean;
  has_parents_alive: boolean;
  has_siblings: boolean;
  debt_concern: boolean | null;
  // 3択（yes / maybe / no）
  has_pension: MaybeBool;
  has_life_insurance: MaybeBool;
  has_securities: MaybeBool;
}

/** 家族構成から法定相続人数を概算する */
function estimateHeirCount(f: FormState): number {
  if (f.has_children) {
    return (f.has_spouse ? 1 : 0) + 2; // 子は複数いる可能性があるので最低2として概算
  }
  if (f.has_parents_alive) {
    return (f.has_spouse ? 1 : 0) + 1;
  }
  if (f.has_siblings) {
    return (f.has_spouse ? 1 : 0) + 1;
  }
  return f.has_spouse ? 1 : 1;
}

/** "maybe" は trueとして扱う（保守的な判定） */
function toBoolean(v: MaybeBool): boolean {
  return v === "yes" || v === "maybe";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    mode: null,
    deceased_name: "",
    death_date: "",
    has_real_estate: null,
    has_will: null,
    has_spouse: false,
    has_children: false,
    has_parents_alive: false,
    has_siblings: false,
    debt_concern: null,
    has_pension: "maybe",
    has_life_insurance: "maybe",
    has_securities: "no",
  });

  const totalSteps = form.mode === "preparation" ? 4 : 5;

  const canNext = () => {
    if (step === 0) return form.mode !== null;
    if (step === 1) {
      if (form.mode === "active") return form.death_date !== "";
      return true;
    }
    if (step === 2) return form.has_real_estate !== null;
    if (step === 3) return form.has_will !== null;
    if (step === 4) return true; // 家族構成は任意選択（未選択=一人）
    if (step === 5) return form.debt_concern !== null;
    return true;
  };

  const isFinalStep =
    (form.mode === "preparation" && step === 4) ||
    (form.mode === "active" && step === 5);

  async function handleSubmit() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase.from("cases").insert({
      user_id: user.id,
      mode: form.mode ?? "active",
      deceased_name: form.deceased_name || null,
      death_date: form.death_date || null,
      has_real_estate: form.has_real_estate ?? false,
      has_will: form.has_will ?? "unknown",
      heir_count: estimateHeirCount(form),
      debt_concern: form.debt_concern ?? false,
      has_pension: toBoolean(form.has_pension),
      has_life_insurance: toBoolean(form.has_life_insurance),
      has_securities: toBoolean(form.has_securities),
    }).select().single();

    if (error || !data) { setLoading(false); return; }
    router.push(`/dashboard?case=${data.id}`);
  }

  const progressPercent = step === 0 ? 0 : Math.round((step / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-lg">
        {step > 0 && (
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-xs text-slate-400">
              <span>ステップ {step} / {totalSteps}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full bg-blue-600 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-8 shadow-sm">

          {/* Step 0: モード選択 */}
          {step === 0 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                どちらの状況ですか？
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                状況に合った手続きリストを作成します。
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => { setForm({ ...form, mode: "active" }); setStep(1); }}
                  className="w-full rounded-xl border-2 border-slate-200 px-5 py-5 text-left transition-all hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="mb-1 text-2xl">😔</div>
                  <div className="font-semibold text-slate-800">親が亡くなった・亡くなりそう</div>
                  <div className="mt-1 text-sm text-slate-500">今すぐ必要な手続きを期限付きで整理します</div>
                </button>
                <button
                  onClick={() => { setForm({ ...form, mode: "preparation" }); setStep(1); }}
                  className="w-full rounded-xl border-2 border-slate-200 px-5 py-5 text-left transition-all hover:border-green-400 hover:bg-green-50"
                >
                  <div className="mb-1 text-2xl">📋</div>
                  <div className="font-semibold text-slate-800">まだ存命で、事前に準備したい</div>
                  <div className="mt-1 text-sm text-slate-500">「いざ」というときに困らないための準備リストを作ります</div>
                </button>
              </div>
            </div>
          )}

          {/* Step 1: 死亡日 or 名前 */}
          {step === 1 && form.mode === "active" && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">亡くなったのはいつですか？</h2>
              <p className="mb-6 text-sm text-slate-500">期限のカウントダウンを計算するために使います。</p>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700">お名前（任意）</label>
                <input
                  type="text"
                  placeholder="例：田中一郎"
                  value={form.deceased_name}
                  onChange={(e) => setForm({ ...form, deceased_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  死亡日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.death_date}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm({ ...form, death_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          {step === 1 && form.mode === "preparation" && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">親御さんのお名前（任意）</h2>
              <p className="mb-6 text-sm text-slate-500">準備リストに表示する名前です。後から変更できます。</p>
              <input
                type="text"
                placeholder="例：田中一郎"
                value={form.deceased_name}
                onChange={(e) => setForm({ ...form, deceased_name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <p className="mt-3 text-xs text-slate-400">入力しなくても次へ進めます</p>
            </div>
          )}

          {/* Step 2: 不動産 */}
          {step === 2 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                持ち家や土地はありますか？
              </h2>
              <p className="mb-2 text-sm text-slate-500">
                自宅・農地・収益物件なども含みます。
              </p>
              <p className="mb-6 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
                わからない場合は「ありそう」を選んでください。
              </p>
              <div className="space-y-3">
                {[
                  { value: true, label: "ある", desc: "自宅・土地・マンション・農地など" },
                  { value: "maybe" as const, label: "ありそう・わからない", desc: "実家があるがくわしくは把握していない" },
                  { value: false, label: "ない", desc: "賃貸暮らしで不動産はない" },
                ].map((opt) => {
                  const isSelected =
                    opt.value === "maybe"
                      ? form.has_real_estate === null
                      : form.has_real_estate === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() =>
                        setForm({
                          ...form,
                          has_real_estate: opt.value === "maybe" ? true : opt.value,
                        })
                      }
                      className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all ${
                        isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-medium text-slate-800">{opt.label}</div>
                      <div className="text-sm text-slate-500">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: 遺言書 */}
          {step === 3 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                遺言書はありますか？
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                公証役場で作ったもの、または自分で書いたものです。わからなければ「確認できていない」を選んでください。
              </p>
              <div className="space-y-3">
                {[
                  { value: "notarized" as WillType, label: "公正証書遺言がある", desc: "公証役場で専門家と一緒に作った遺言書" },
                  { value: "handwritten" as WillType, label: "手書きの遺言書がある", desc: "本人が手書きしたもの（開封前に手続きが必要）" },
                  { value: "none" as WillType, label: "遺言書はない", desc: form.mode === "preparation" ? "作成を検討しましょう" : "相続人全員での話し合いが必要になります" },
                  { value: "unknown" as WillType, label: "確認できていない・わからない", desc: "遺品整理をしてからでないとわからない" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, has_will: opt.value })}
                    className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all ${
                      form.has_will === opt.value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-medium text-slate-800">{opt.label}</div>
                    <div className="text-sm text-slate-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: 家族構成（相続人数を推定） */}
          {step === 4 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                {form.mode === "preparation" ? "親御さんの" : "亡くなった方の"}ご家族を教えてください
              </h2>
              <p className="mb-2 text-sm text-slate-500">
                当てはまるものをすべて選んでください。
              </p>
              <p className="mb-6 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
                これをもとに必要な手続きを絞り込みます。わからなければ選ばなくても大丈夫です。
              </p>
              <div className="space-y-2">
                {[
                  { key: "has_spouse" as const, label: "配偶者（夫または妻）がいる", emoji: "💑" },
                  { key: "has_children" as const, label: "子ども（実子・養子）がいる", emoji: "👦" },
                  { key: "has_parents_alive" as const, label: "親（父・母）が存命", emoji: "👴" },
                  { key: "has_siblings" as const, label: "兄弟・姉妹がいる", emoji: "👫" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setForm({ ...form, [opt.key]: !form[opt.key] })}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                      form[opt.key] ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="font-medium text-slate-800">{opt.label}</span>
                    <span className={`ml-auto text-sm ${form[opt.key] ? "text-blue-600" : "text-slate-300"}`}>
                      {form[opt.key] ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>

              {/* 年金・保険・証券（3択） */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="mb-1 text-sm font-medium text-slate-700">資産・保険について</p>
                <p className="mb-4 text-xs text-slate-400">
                  「わからない・ありそう」を選ぶと、確認が必要なタスクが追加されます。
                </p>
                <div className="space-y-4">
                  {[
                    { key: "has_pension" as const, label: "年金を受給していた（または受給予定）" },
                    { key: "has_life_insurance" as const, label: "生命保険に加入していた（または加入中）" },
                    { key: "has_securities" as const, label: "株式・投資信託・証券口座があった" },
                  ].map((item) => (
                    <div key={item.key}>
                      <p className="mb-2 text-sm text-slate-600">{item.label}</p>
                      <div className="flex gap-2">
                        {[
                          { value: "yes" as MaybeBool, label: "ある" },
                          { value: "maybe" as MaybeBool, label: "わからない・ありそう" },
                          { value: "no" as MaybeBool, label: "ない" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setForm({ ...form, [item.key]: opt.value })}
                            className={`flex-1 rounded-lg border-2 py-2 text-xs font-medium transition-all ${
                              form[item.key] === opt.value
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: 借金（activeモードのみ） */}
          {step === 5 && form.mode === "active" && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                借金や保証人になっていた可能性はありますか？
              </h2>
              <p className="mb-2 text-sm text-slate-500">
                住宅ローン・カードローン・友人への連帯保証など。
              </p>
              <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
                借金を引き継ぎたくない場合、「相続放棄」という手続きが<strong>3ヶ月以内</strong>に必要です。まだわからなくてもOKです。
              </p>
              <div className="space-y-3">
                {[
                  { value: true as const, label: "ある・あるかもしれない", desc: "借金・ローン・保証人などの可能性がある" },
                  { value: false as const, label: "おそらくない", desc: "プラスの財産だけと思われる" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setForm({ ...form, debt_concern: opt.value })}
                    className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all ${
                      form.debt_concern === opt.value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-medium text-slate-800">{opt.label}</div>
                    <div className="text-sm text-slate-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                戻る
              </button>
            )}
            {!isFinalStep ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
              >
                次へ
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canNext() || loading}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
              >
                {loading ? "作成中..." : form.mode === "preparation" ? "準備チェックリストを作成する" : "手続きリストを作成する"}
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          あとから情報を更新することもできます
        </p>
      </div>
    </div>
  );
}
