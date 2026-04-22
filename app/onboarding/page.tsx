"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { WillType } from "@/lib/supabase/types";

interface FormState {
  deceased_name: string;
  death_date: string;
  has_real_estate: boolean | null;
  has_will: WillType | null;
  heir_count: number | null;
  debt_concern: boolean | null;
  has_pension: boolean;
  has_life_insurance: boolean;
  has_securities: boolean;
}

const STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    deceased_name: "",
    death_date: "",
    has_real_estate: null,
    has_will: null,
    heir_count: null,
    debt_concern: null,
    has_pension: false,
    has_life_insurance: false,
    has_securities: false,
  });

  const canNext = () => {
    if (step === 1) return form.death_date !== "";
    if (step === 2) return form.has_real_estate !== null;
    if (step === 3) return form.has_will !== null;
    if (step === 4) return form.heir_count !== null;
    if (step === 5) return form.debt_concern !== null;
    return true;
  };

  async function handleSubmit() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase.from("cases").insert({
      user_id: user.id,
      deceased_name: form.deceased_name || null,
      death_date: form.death_date,
      has_real_estate: form.has_real_estate ?? false,
      has_will: form.has_will ?? "unknown",
      heir_count: form.heir_count ?? 1,
      debt_concern: form.debt_concern ?? false,
      has_pension: form.has_pension,
      has_life_insurance: form.has_life_insurance,
      has_securities: form.has_securities,
    }).select().single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    router.push(`/dashboard?case=${data.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>ステップ {step} / {STEPS}</span>
            <span>{Math.round((step / STEPS) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200">
            <div
              className="h-1.5 rounded-full bg-blue-600 transition-all"
              style={{ width: `${(step / STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {/* Step 1: 死亡日 */}
          {step === 1 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                亡くなったのはいつですか？
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                期限のカウントダウンを計算するために使います。
              </p>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  お名前（任意）
                </label>
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

          {/* Step 2: 不動産 */}
          {step === 2 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                不動産（家・土地）はありますか？
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                相続登記（2024年から義務）の要否を判定します。
              </p>
              <div className="space-y-3">
                {[
                  { value: true, label: "ある", desc: "自宅・土地・収益物件など" },
                  { value: false, label: "ない", desc: "不動産は持っていない" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setForm({ ...form, has_real_estate: opt.value })}
                    className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all ${
                      form.has_real_estate === opt.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-medium text-slate-800">{opt.label}</div>
                    <div className="text-sm text-slate-500">{opt.desc}</div>
                  </button>
                ))}
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
                遺言書の種類によって手続きが変わります。
              </p>
              <div className="space-y-3">
                {[
                  { value: "notarized" as WillType, label: "公正証書遺言がある", desc: "公証役場で作成した遺言書" },
                  { value: "handwritten" as WillType, label: "自筆証書遺言がある", desc: "手書きの遺言書（家庭裁判所の検認が必要）" },
                  { value: "none" as WillType, label: "遺言書はない", desc: "相続人で話し合いが必要" },
                  { value: "unknown" as WillType, label: "わからない", desc: "まだ確認できていない" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, has_will: opt.value })}
                    className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all ${
                      form.has_will === opt.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-medium text-slate-800">{opt.label}</div>
                    <div className="text-sm text-slate-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: 相続人数 */}
          {step === 4 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                相続人は何人ですか？
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                配偶者・子・親・兄弟など、法律上の相続人の人数です。
              </p>
              <div className="space-y-3">
                {[
                  { value: 1, label: "1人" },
                  { value: 2, label: "2〜3人" },
                  { value: 4, label: "4人以上" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, heir_count: opt.value })}
                    className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all ${
                      form.heir_count === opt.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-medium text-slate-800">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: 借金の懸念 + その他 */}
          {step === 5 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                借金や連帯保証の心配はありますか？
              </h2>
              <p className="mb-4 text-sm text-slate-500">
                「相続放棄」の必要性を判断します（期限：3ヶ月）。
              </p>
              <div className="mb-6 space-y-3">
                {[
                  { value: true, label: "ある・かもしれない", desc: "借金・保証人・ローン等の可能性がある" },
                  { value: false, label: "ない", desc: "プラスの財産のみと思われる" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setForm({ ...form, debt_concern: opt.value })}
                    className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all ${
                      form.debt_concern === opt.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-medium text-slate-800">{opt.label}</div>
                    <div className="text-sm text-slate-500">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  該当するものがあれば教えてください（複数可）
                </p>
                <div className="space-y-2">
                  {[
                    { key: "has_pension" as const, label: "年金を受給していた" },
                    { key: "has_life_insurance" as const, label: "生命保険に加入していた" },
                    { key: "has_securities" as const, label: "株式・投資信託を持っていた" },
                  ].map((opt) => (
                    <label key={opt.key} className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form[opt.key]}
                        onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                戻る
              </button>
            )}
            {step < STEPS ? (
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
                {loading ? "作成中..." : "手続きリストを作成する"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
