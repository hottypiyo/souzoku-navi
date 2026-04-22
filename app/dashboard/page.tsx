import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplicableTasks, getDaysRemaining, PHASE_LABELS } from "@/lib/tasks/definitions";
import type { TaskPhase } from "@/lib/tasks/definitions";
import TaskCard from "@/components/tasks/task-card";
import UpgradeBanner from "@/components/ui/upgrade-banner";

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

  // プロフィール取得（プランチェック用）
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, premium_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (profile.premium_expires_at === null ||
      new Date(profile.premium_expires_at) > new Date());

  // 案件取得
  let caseId: string | undefined = params.case;
  if (!caseId) {
    const { data: cases } = await supabase
      .from("cases")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (!cases || cases.length === 0) redirect("/onboarding");
    caseId = cases[0].id;
  }

  const { data: caseData } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId as string)
    .eq("user_id", user.id)
    .single();

  if (!caseData) redirect("/onboarding");

  // タスク進捗取得
  const { data: progress } = await supabase
    .from("task_progress")
    .select("task_id, status")
    .eq("case_id", caseId as string);

  const progressMap = new Map(
    (progress ?? []).map((p) => [p.task_id, p.status])
  );

  // 適用タスクを取得してフェーズ別に分類
  const tasks = getApplicableTasks(caseData);

  // 緊急タスク（残り30日以内）
  const urgentTasks = tasks.filter((t) => {
    if (t.deadlineDays === null) return false;
    const remaining = getDaysRemaining(caseData.death_date, t.deadlineDays);
    return remaining <= 30 && remaining >= 0 && progressMap.get(t.id) !== "completed";
  });

  const phases: TaskPhase[] = ["P1", "P2", "P3", "P4"];

  // フリーユーザーの詳細閲覧上限
  const FREE_DETAIL_LIMIT = 3;
  let freeDetailCount = 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-800">相続手続きナビ</h1>
            {caseData.deceased_name && (
              <p className="text-xs text-slate-500">{caseData.deceased_name} さんの相続手続き</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isPremium && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                無料プラン
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* 緊急アラート */}
        {urgentTasks.length > 0 && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-red-700">
              <span>⚠️</span> 今すぐ対応が必要な手続き
            </h2>
            <div className="space-y-2">
              {urgentTasks.map((t) => {
                const remaining = getDaysRemaining(caseData.death_date, t.deadlineDays!);
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

        {/* プレミアムアップグレードバナー */}
        {!isPremium && <UpgradeBanner className="mb-6" />}

        {/* フェーズ別タスクリスト */}
        {phases.map((phase) => {
          const phaseTasks = tasks.filter((t) => t.phase === phase);
          if (phaseTasks.length === 0) return null;

          return (
            <section key={phase} className="mb-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                {PHASE_LABELS[phase]}
              </h2>
              <div className="space-y-3">
                {phaseTasks.map((task) => {
                  const status = progressMap.get(task.id) ?? "pending";
                  const canViewDetail = isPremium || freeDetailCount < FREE_DETAIL_LIMIT;
                  if (!isPremium && status !== "completed") freeDetailCount++;

                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      status={status}
                      deathDate={caseData.death_date}
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

        {/* 免責 */}
        <p className="mt-8 text-center text-xs text-slate-400">
          本サービスは情報提供を目的としており、法律相談・税務相談ではありません。
          具体的な判断は専門家にご相談ください。
        </p>
      </main>
    </div>
  );
}
