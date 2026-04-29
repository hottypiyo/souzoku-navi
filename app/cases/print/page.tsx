import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getApplicableTasks,
  getDaysRemaining,
  PHASE_LABELS,
} from "@/lib/tasks/definitions";
import type { TaskPhase } from "@/lib/tasks/definitions";

export default async function PrintPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  let caseId = params.case;

  if (!caseId) {
    const { data: cases } = await supabase.from("cases").select("id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
    if (!cases || cases.length === 0) redirect("/onboarding");
    caseId = cases[0].id;
  }

  const { data: caseData } = await supabase.from("cases").select("*").eq("id", caseId).eq("user_id", user.id).single();
  if (!caseData) redirect("/dashboard");

  const { data: progress } = await supabase.from("task_progress").select("task_id, status, notes").eq("case_id", caseId);
  const progressMap = new Map((progress ?? []).map((p) => [p.task_id, p]));

  const tasks = getApplicableTasks(caseData);
  const phases: TaskPhase[] = ["P1", "P2", "P3", "P4"];

  const total = tasks.length;
  const completed = tasks.filter((t) => progressMap.get(t.id)?.status === "completed").length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <title>{caseData.deceased_name ? `${caseData.deceased_name}さんの相続手続きリスト` : "相続手続きリスト"}</title>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { font-size: 11pt; }
            .page-break { page-break-before: always; }
          }
          body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; color: #1e293b; margin: 0; padding: 20px; }
          h1 { font-size: 1.3rem; }
          h2 { font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 0.82rem; }
          th { background: #f8fafc; text-align: left; padding: 6px 8px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; }
          td { padding: 6px 8px; border: 1px solid #e2e8f0; vertical-align: top; }
          .done { text-decoration: line-through; color: #94a3b8; }
          .overdue { color: #dc2626; font-weight: 600; }
          .urgent { color: #ea580c; font-weight: 600; }
        `}</style>
      </head>
      <body>
        <div className="no-print" style={{ marginBottom: 16 }}>
          <button onClick={() => window.print()} style={{ padding: "8px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
            印刷する
          </button>
          <a href="/dashboard" style={{ marginLeft: 12, fontSize: 14, color: "#2563eb" }}>← ダッシュボードへ戻る</a>
        </div>

        <h1>{caseData.deceased_name ? `${caseData.deceased_name}さんの相続手続きリスト` : "相続手続きリスト"}</h1>
        <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
          ご逝去日：{caseData.death_date ?? "未設定"}　出力日：{new Date().toLocaleDateString("ja-JP")}　進捗：{completed}/{total} 完了（{pct}%）
        </p>

        {phases.map((phase) => {
          const phaseTasks = tasks.filter((t) => t.phase === phase);
          if (phaseTasks.length === 0) return null;
          return (
            <div key={phase}>
              <h2>{PHASE_LABELS[phase]}</h2>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>完了</th>
                    <th style={{ width: "35%" }}>手続き</th>
                    <th style={{ width: "15%" }}>期限</th>
                    <th style={{ width: "15%" }}>担当</th>
                    <th style={{ width: "30%" }}>メモ</th>
                  </tr>
                </thead>
                <tbody>
                  {phaseTasks.map(({ condition: _c, ...task }) => {
                    const p = progressMap.get(task.id);
                    const isDone = p?.status === "completed";
                    const remaining = task.deadlineDays !== null && caseData.death_date
                      ? getDaysRemaining(caseData.death_date, task.deadlineDays)
                      : null;
                    return (
                      <tr key={task.id}>
                        <td style={{ textAlign: "center" }}>{isDone ? "✓" : "□"}</td>
                        <td className={isDone ? "done" : ""}>{task.title}</td>
                        <td className={remaining !== null && remaining < 0 ? "overdue" : remaining !== null && remaining <= 7 ? "urgent" : ""}>
                          {remaining !== null
                            ? remaining < 0 ? `${Math.abs(remaining)}日超過` : `残り${remaining}日`
                            : task.deadlineLabel}
                        </td>
                        <td>{task.assignee}</td>
                        <td style={{ color: "#64748b" }}>{p?.notes ?? ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        <p style={{ marginTop: 24, fontSize: "0.75rem", color: "#94a3b8" }}>
          本リストは情報提供を目的としており、法律相談・税務相談ではありません。具体的な判断は専門家にご相談ください。
        </p>
      </body>
    </html>
  );
}
