"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { posthog } from "@/lib/posthog";
import type { WillType } from "@/lib/supabase/types";

type Mode = "active" | "preparation";
type UserRole = "child" | "spouse" | "parent" | "sibling" | "self" | "other";
type MaybeBool = "yes" | "maybe" | "no";

interface FormState {
  mode: Mode | null;
  user_role: UserRole | null;
  deceased_name: string;
  death_date: string;
  has_real_estate: boolean | "maybe" | null;
  has_will: WillType | null;
  has_spouse: boolean;
  has_children: boolean;
  has_parents_alive: boolean;
  has_siblings: boolean;
  debt_concern: boolean | null;
  has_pension: MaybeBool;
  has_life_insurance: MaybeBool;
  has_securities: MaybeBool;
}

function estimateHeirCount(f: FormState): number {
  if (f.has_children) return (f.has_spouse ? 1 : 0) + 2;
  if (f.has_parents_alive) return (f.has_spouse ? 1 : 0) + 1;
  if (f.has_siblings) return (f.has_spouse ? 1 : 0) + 1;
  return f.has_spouse ? 1 : 1;
}

function toBoolean(v: MaybeBool): boolean {
  return v === "yes" || v === "maybe";
}

/** 立場に応じたラベルを返す */
function getRoleLabel(role: UserRole | null, mode: Mode | null): string {
  if (mode === "preparation") {
    if (role === "self") return "ご自身";
    if (role === "spouse") return "配偶者";
    return "親御さん";
  }
  if (role === "spouse") return "配偶者";
  if (role === "parent") return "お子さん";
  if (role === "sibling") return "ご兄弟";
  return "亡くなった方";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    mode: null,
    user_role: null,
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

  // totalSteps: preparation=5, active=6（user_roleステップが追加されたため+1）
  const totalSteps = form.mode === "preparation" ? 5 : 6;

  const canNext = () => {
    if (step === 0) return form.mode !== null;
    if (step === 1) return form.user_role !== null;
    if (step === 2) {
      if (form.mode === "active") return form.death_date !== "";
      return true;
    }
    if (step === 3) return form.has_real_estate !== null && form.has_real_estate !== undefined;
    if (step === 4) return form.has_will !== null;
    if (step === 5) return true;
    if (step === 6) return form.debt_concern !== null;
    return true;
  };

  const isFinalStep =
    (form.mode === "preparation" && step === 5) ||
    (form.mode === "active" && step === 6);

  async function handleSubmit() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // 配偶者ユーザーは has_spouse を強制 true
    const effectiveHasSpouse = form.user_role === "spouse" ? true : form.has_spouse;
    const effectiveForm = { ...form, has_spouse: effectiveHasSpouse };

    const { data, error } = await supabase.from("cases").insert({
      user_id: user.id,
      mode: form.mode ?? "active",
      user_role: form.user_role ?? "child",
      deceased_name: form.deceased_name || null,
      death_date: form.death_date || null,
      has_real_estate: form.has_real_estate === false ? false : form.has_real_estate !== null,
      has_will: form.has_will ?? "unknown",
      heir_count: estimateHeirCount(effectiveForm),
      debt_concern: form.debt_concern ?? false,
      has_pension: toBoolean(form.has_pension),
      has_life_insurance: toBoolean(form.has_life_insurance),
      has_securities: toBoolean(form.has_securities),
    }).select().single();

    if (error || !data) { setLoading(false); return; }
    posthog.capture("onboarding_completed", {
      mode: form.mode,
      user_role: form.user_role,
      has_real_estate: form.has_real_estate !== false,
      has_will: form.has_will,
      debt_concern: form.debt_concern,
    });
    router.push(`/dashboard?case=${data.id}`);
  }

  const progressPercent = step === 0 ? 0 : Math.round((step / totalSteps) * 100);
  const subjectLabel = getRoleLabel(form.user_role, form.mode);

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
                  onClick={() => { posthog.capture("onboarding_mode_selected", { mode: "active" }); setForm({ ...form, mode: "active" }); setStep(1); }}
                  className="w-full rounded-xl border-2 border-slate-200 px-5 py-5 text-left transition-all hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="mb-1 text-2xl">😔</div>
                  <div className="font-semibold text-slate-800">ご家族が亡くなった・亡くなりそう</div>
                  <div className="mt-1 text-sm text-slate-500">今すぐ必要な手続きを期限付きで整理します</div>
                </button>
                <button
                  onClick={() => { posthog.capture("onboarding_mode_selected", { mode: "preparation" }); setForm({ ...form, mode: "preparation" }); setStep(1); }}
                  className="w-full rounded-xl border-2 border-slate-200 px-5 py-5 text-left transition-all hover:border-green-400 hover:bg-green-50"
                >
                  <div className="mb-1 text-2xl">📋</div>
                  <div className="font-semibold text-slate-800">まだ存命で、事前に準備したい</div>
                  <div className="mt-1 text-sm text-slate-500">「いざ」というときに困らないための準備リストを作ります</div>
                </button>
              </div>
            </div>
          )}

          {/* Step 1: 立場の選択（NEW） */}
          {step === 1 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                {form.mode === "active"
                  ? "あなたはどのような立場ですか？"
                  : "誰の相続について準備しますか？"}
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {form.mode === "active"
                  ? "亡くなった方との関係を選んでください。"
                  : "当てはまるものを選んでください。"}
              </p>
              <div className="space-y-2">
                {form.mode === "active" ? (
                  <>
                    {[
                      { value: "child" as UserRole, emoji: "🧑", label: "子（息子・娘）", desc: "亡くなった方のお子さんとして手続きする" },
                      { value: "spouse" as UserRole, emoji: "💑", label: "配偶者（夫・妻）", desc: "亡くなった方の配偶者として手続きする" },
                      { value: "parent" as UserRole, emoji: "👴", label: "親（父・母）", desc: "亡くなった方の親として手続きする" },
                      { value: "sibling" as UserRole, emoji: "👫", label: "兄弟・姉妹", desc: "亡くなった方のご兄弟として手続きする" },
                      { value: "other" as UserRole, emoji: "👤", label: "その他", desc: "孫・甥姪・法定代理人など" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setForm({ ...form, user_role: opt.value }); setStep(2); }}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                          form.user_role === opt.value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <div>
                          <div className="font-medium text-slate-800">{opt.label}</div>
                          <div className="text-xs text-slate-500">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { value: "child" as UserRole, emoji: "🧑", label: "親の相続を準備する", desc: "親が元気なうちに、相続の準備をしたい" },
                      { value: "self" as UserRole, emoji: "📝", label: "自分自身の相続を準備する", desc: "終活として、自分の相続について準備したい" },
                      { value: "spouse" as UserRole, emoji: "💑", label: "配偶者の相続を準備する", desc: "夫・妻の相続について一緒に準備したい" },
                      { value: "other" as UserRole, emoji: "👤", label: "その他の方の相続を準備する", desc: "祖父母・その他の方の相続準備" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setForm({ ...form, user_role: opt.value }); setStep(2); }}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                          form.user_role === opt.value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <div>
                          <div className="font-medium text-slate-800">{opt.label}</div>
                          <div className="text-xs text-slate-500">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 2: 死亡日 or 名前 */}
          {step === 2 && form.mode === "active" && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">亡くなったのはいつですか？</h2>
              <p className="mb-6 text-sm text-slate-500">期限のカウントダウンを計算するために使います。</p>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {subjectLabel}のお名前（任意）
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
                  お亡くなりになった日 <span className="text-red-500">*</span>
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

          {step === 2 && form.mode === "preparation" && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                {form.user_role === "self" ? "あなたのお名前（任意）" : `${subjectLabel}のお名前（任意）`}
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {form.user_role === "self"
                  ? "準備リストに表示する名前です。"
                  : "準備リストに表示する名前です。後から変更できます。"}
              </p>
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

          {/* Step 3: 不動産 */}
          {step === 3 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                {form.user_role === "self" ? "ご自身の" : `${subjectLabel}の`}持ち家や土地はありますか？
              </h2>
              <p className="mb-2 text-sm text-slate-500">
                自宅・農地・収益物件なども含みます。
              </p>
              <p className="mb-6 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
                わからない場合は「ありそう」を選んでください。
              </p>
              <div className="space-y-3">
                {[
                  { value: true as const, label: "ある", desc: "自宅・土地・マンション・農地など" },
                  { value: "maybe" as const, label: "ありそう・わからない", desc: "実家があるがくわしくは把握していない" },
                  { value: false as const, label: "ない", desc: "賃貸暮らしで不動産はない" },
                ].map((opt) => {
                  const isSelected = form.has_real_estate === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => setForm({ ...form, has_real_estate: opt.value })}
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

          {/* Step 4: 遺言書 */}
          {step === 4 && (
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

          {/* Step 5: 家族構成 + 資産 */}
          {step === 5 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-800">
                {form.user_role === "self" ? "ご自身の" : `${subjectLabel}の`}ご家族を教えてください
              </h2>
              <p className="mb-2 text-sm text-slate-500">
                当てはまるものをすべて選んでください。
              </p>
              <p className="mb-6 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
                これをもとに必要な手続きを絞り込みます。わからなければ選ばなくても大丈夫です。
              </p>

              {/* 配偶者ユーザーは「配偶者がいる」を自動 true として非表示 */}
              {form.user_role === "spouse" && (
                <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  配偶者（あなた）は相続人として含まれています。
                </div>
              )}

              <div className="space-y-2">
                {[
                  { key: "has_spouse" as const, label: "配偶者（夫または妻）がいる", emoji: "💑" },
                  { key: "has_children" as const, label: "子ども（実子・養子）がいる", emoji: "👦" },
                  { key: "has_parents_alive" as const, label: "親（父・母）が存命", emoji: "👴" },
                  { key: "has_siblings" as const, label: "兄弟・姉妹がいる", emoji: "👫" },
                ]
                  .filter((opt) => !(opt.key === "has_spouse" && form.user_role === "spouse"))
                  .map((opt) => (
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

          {/* Step 6: 借金（activeモードのみ） */}
          {step === 6 && form.mode === "active" && (
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
