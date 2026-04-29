import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getApplicableTasks,
  getApplicablePrepTasks,
  getDaysRemaining,
  PHASE_LABELS,
  PREP_PHASE_LABELS,
} from "@/lib/tasks/definitions";
import type { TaskPhase, PrepPhase } from "@/lib/tasks/definitions";
import TaskCard from "@/components/tasks/task-card";
import PrepTaskCard from "@/components/tasks/prep-task-card";
import UpgradeBanner from "@/components/ui/upgrade-banner";
import ProgressCard from "@/components/dashboard/progress-card";
import ChatWidget from "@/components/ai/chat-widget";

export const metadata = { title: "ダッシュボード" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, premium_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (profile.premium_expires_at === null ||
      new Date(profile.premium_expires_at) > new Date());

  // 自分の案件 + 招待で参加した案件を取得
  const [{ data: ownCases }, { data: memberRows }] = await Promise.all([
    supabase.from("cases").select("id, deceased_name, death_date, mode, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("case_members").select("case_id").eq("user_id", user.id).not("joined_at", "is", null),
  ]);

  const memberCaseIds = (memberRows ?? []).map((r) => r.case_id);
  let memberCases: { id: string; deceased_name: string | null; death_date: string | null; mode: string; created_at: string }[] = [];
  if (memberCaseIds.length > 0) {
    const { data } = await supabase.from("cases").select("id, deceased_name, death_date, mode, created_at").in("id", memberCaseIds);
    memberCases = data ?? [];
  }

  const allCases = [
    ...(ownCases ?? []).map((c) => ({ ...c, isOwner: true })),
    ...memberCases.map((c) => ({ ...c, isOwner: false })),
  ];

  if (allCases.length === 0) redirect("/onboarding");

  let caseId: string | undefined = params.case;
  if (!caseId || !allCases.find((c) => c.id === caseId)) {
    caseId = allCases[0].id;
  }

  const { data: caseData } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId as string)
    .single();

  if (!caseData) redirect("/onboarding");

  const isOwner = (ownCases ?? []).some((c) => c.id === caseId);

  const { data: progress } = await supabase
    .from("task_progress")
    .select("task_id, status, notes")
    .eq("case_id", caseId as string);

  const progressMap = new Map(
    (progress ?? []).map((p) => [p.task_id, p])
  );

  const isPreparation = caseData.mode === "preparation";
  const userRole = caseData.user_role ?? "child";
  const deceasedName = caseData.deceased_name;

  function getSubjectLabel(): string {
    if (isPreparation) {
      if (userRole === "self") return deceasedName ? `${deceasedName}さん（ご本人）` : "ご自身";
      if (userRole === "spouse") return deceasedName ? `${deceasedName}さん（配偶者）` : "配偶者";
      return deceasedName ? `${deceasedName}さん` : "親御さん";
    }
    if (userRole === "spouse") return deceasedName ? `${deceasedName}さん（配偶者）` : "配偶者";
    if (userRole === "parent") return deceasedName ? `${deceasedName}さん` : "ご家族";
    if (userRole === "sibling") return deceasedName ? `${deceasedName}さん（兄弟姉妹）` : "ご家族";
    return deceasedName ? `${deceasedName}さん` : "ご家族";
  }
  const subjectLabel = getSubjectLabel();
  const FREE_DETAIL_LIMIT = 3;
  let freeDetailCount = 0;

  const caseContext = isPreparation
    ? `モード: 事前準備（終活・相続準備）\nユーザーの立場: ${userRole}\n対象者: ${deceasedName ?? "未設定"}`
    : `モード: 相続手続き中\nユーザーの立場: ${userRole}\n故人名: ${deceasedName ?? "未設定"}\n死亡日: ${caseData.death_date ?? "未設定"}`;

  // 案件スイッチャー
  const CaseSwitcher = allCases.length > 1 ? (
    <form className="flex items-center gap-2">
      <select
        name="case"
        defaultValue={caseId}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
      >
        {allCases.map((c) => (
          <option key={c.id} value={c.id}>
            {c.deceased_name ? `${c.deceased_name}さん` : "案件"}
            {!c.isOwner ? "（共有）" : ""}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200">
        切替
      </button>
    </form>
  ) : null;

  // ── 事前準備モード ──
  if (isPreparation) {
    const prepTasks = getApplicablePrepTasks(caseData);
    const phases: PrepPhase[] = ["PREP1", "PREP2", "PREP3"];
    const total = prepTasks.length;
    const completed = prepTasks.filter((t) => progressMap.get(t.id)?.status === "completed").length;

    return (
      <>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-base font-semibold text-slate-800">相続手続きナビ</h1>
              <p className="text-xs text-slate-500">
                {subjectLabel}の{userRole === "self" ? "終活" : "相続"}準備チェックリスト
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {CaseSwitcher}
              {!isPremium && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">無料プラン</span>
              )}
              {isPremium && isOwner && (
                <>
                  <a href="/specialists" className="text-xs text-blue-600 hover:underline">専門家を探す</a>
                  <a href={`/assets?case=${caseId}`} className="text-xs text-slate-400 hover:text-slate-600">財産一覧表</a>
                  <a href="/settings/family" className="text-xs text-slate-400 hover:text-slate-600">家族を招待</a>
                  <a href="/settings" className="text-xs text-slate-400 hover:text-slate-600">通知設定</a>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8">
          <ProgressCard
            total={total}
            completed={completed}
            nextDeadline={null}
          />

          <div className="mb-6 rounded-2xl bg-green-50 border border-green-100 p-5">
            <h2 className="mb-1 font-semibold text-green-800">
              📋 「いざ」というときに困らないための準備リスト
            </h2>
            <p className="text-sm text-green-700">
              {userRole === "self"
                ? "ご自身の意思をまとめておくことで、残された家族の負担を大幅に減らせます。"
                : "元気なうちに確認・準備しておくことで、手続きの負担を大幅に減らせます。"}
              完了したタスクにチェックを入れていきましょう。
            </p>
          </div>

          {!isPremium && <UpgradeBanner className="mb-6" />}

          {phases.map((phase) => {
            const phaseTasks = prepTasks.filter((t) => t.phase === phase);
            if (phaseTasks.length === 0) return null;
            return (
              <section key={phase} className="mb-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  {PREP_PHASE_LABELS[phase]}
                </h2>
                <div className="space-y-3">
                  {phaseTasks.map(({ condition: _c, ...task }) => {
                    const p = progressMap.get(task.id);
                    const status = p?.status ?? "pending";
                    const canViewDetail = isPremium || freeDetailCount < FREE_DETAIL_LIMIT;
                    if (!isPremium && status !== "completed") freeDetailCount++;
                    return (
                      <PrepTaskCard
                        key={task.id}
                        task={task}
                        status={status}
                        caseId={caseId!}
                        isPremium={isPremium}
                        canViewDetail={canViewDetail}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <p className="mb-2 text-sm font-medium text-slate-700">状況が変わったら</p>
            <p className="mb-4 text-sm text-slate-500">ご家族が亡くなった場合は、手続きリストを別途作成できます。</p>
            <a href="/onboarding" className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              新しい手続きリストを作成する
            </a>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            本サービスは情報提供を目的としており、法律相談・税務相談ではありません。
          </p>
          <div className="mt-3 flex justify-center gap-4 text-xs text-slate-300">
            <a href="/terms" className="hover:text-slate-500">利用規約</a>
            <a href="/privacy" className="hover:text-slate-500">プライバシーポリシー</a>
            <a href="/tokushoho" className="hover:text-slate-500">特定商取引法</a>
          </div>
        </main>
      </div>
      <ChatWidget caseContext={caseContext} />
      </>
    );
  }

  // ── 通常モード（手続き対応中）──
  const tasks = getApplicableTasks(caseData);
  const total = tasks.length;
  const completedCount = tasks.filter((t) => progressMap.get(t.id)?.status === "completed").length;

  const urgentTasks = tasks.filter((t) => {
    if (t.deadlineDays === null || !caseData.death_date) return false;
    const remaining = getDaysRemaining(caseData.death_date, t.deadlineDays);
    return remaining <= 30 && remaining >= 0 && progressMap.get(t.id)?.status !== "completed";
  });

  // 次の期限タスク（最も近い未完了タスク）
  const nextDeadlineTask = tasks
    .filter((t) => t.deadlineDays !== null && caseData.death_date && progressMap.get(t.id)?.status !== "completed")
    .map((t) => ({ ...t, remaining: getDaysRemaining(caseData.death_date!, t.deadlineDays!) }))
    .sort((a, b) => a.remaining - b.remaining)[0] ?? null;

  const phases: TaskPhase[] = ["P1", "P2", "P3", "P4"];

  return (
    <>
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-base font-semibold text-slate-800">相続手続きナビ</h1>
            <p className="text-xs text-slate-500">{subjectLabel}の相続手続き</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {CaseSwitcher}
            {!isPremium && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">無料プラン</span>
            )}
            {isPremium && (
              <>
                <a href="/specialists" className="text-xs text-blue-600 hover:underline">専門家を探す</a>
                {isOwner && (
                  <>
                    <a href={`/assets?case=${caseId}`} className="text-xs text-slate-400 hover:text-slate-600">財産一覧表</a>
                    <a href={`/cases/print?case=${caseId}`} target="_blank" className="text-xs text-slate-400 hover:text-slate-600">印刷</a>
                    <a href="/settings/family" className="text-xs text-slate-400 hover:text-slate-600">家族を招待</a>
                    <a href="/settings" className="text-xs text-slate-400 hover:text-slate-600">通知設定</a>
                  </>
                )}
              </>
            )}
            {!isPremium && (
              <a href={`/cases/print?case=${caseId}`} target="_blank" className="text-xs text-slate-400 hover:text-slate-600">印刷</a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <ProgressCard
          total={total}
          completed={completedCount}
          nextDeadline={nextDeadlineTask ? { title: nextDeadlineTask.title, remaining: nextDeadlineTask.remaining } : null}
        />

        {urgentTasks.length > 0 && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-red-700">
              <span>⚠️</span> 今すぐ対応が必要な手続き
            </h2>
            <div className="space-y-2">
              {urgentTasks.map((t) => {
                const remaining = getDaysRemaining(caseData.death_date!, t.deadlineDays!);
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm">
                    <span className="font-medium text-slate-700">{t.title}</span>
                    <span className={`font-bold ${remaining <= 7 ? "text-red-600" : "text-orange-500"}`}>
                      残り{remaining}日
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isPremium && <UpgradeBanner className="mb-6" />}

        {phases.map((phase) => {
          const phaseTasks = tasks.filter((t) => t.phase === phase);
          if (phaseTasks.length === 0) return null;
          return (
            <section key={phase} className="mb-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                {PHASE_LABELS[phase]}
              </h2>
              <div className="space-y-3">
                {phaseTasks.map(({ condition: _c, ...task }) => {
                  const p = progressMap.get(task.id);
                  const status = p?.status ?? "pending";
                  const canViewDetail = isPremium || freeDetailCount < FREE_DETAIL_LIMIT;
                  if (!isPremium && status !== "completed") freeDetailCount++;
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      status={status}
                      notes={p?.notes ?? null}
                      deathDate={caseData.death_date ?? ""}
                      caseId={caseId!}
                      isPremium={isPremium}
                      canViewDetail={canViewDetail}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <p className="mb-2 text-sm font-medium text-slate-700">別の案件を管理する</p>
          <a href="/onboarding" className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            新しい手続きリストを作成する
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          本サービスは情報提供を目的としており、法律相談・税務相談ではありません。
          具体的な判断は専門家にご相談ください。
        </p>
        <div className="mt-3 flex justify-center gap-4 text-xs text-slate-300">
          <a href="/terms" className="hover:text-slate-500">利用規約</a>
          <a href="/privacy" className="hover:text-slate-500">プライバシーポリシー</a>
          <a href="/tokushoho" className="hover:text-slate-500">特定商取引法</a>
        </div>
      </main>
    </div>
    <ChatWidget caseContext={caseContext} />
    </>
  );
}
