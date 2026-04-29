"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PrepTaskDefinition } from "@/lib/tasks/definitions";

interface PrepTaskCardProps {
  task: Omit<PrepTaskDefinition, "condition">;
  status: string;
  caseId: string;
  isPremium: boolean;
  canViewDetail: boolean;
}

export default function PrepTaskCard({
  task,
  status,
  caseId,
  isPremium,
  canViewDetail,
}: PrepTaskCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  async function toggleComplete() {
    if (!isPremium) { router.push("/upgrade"); return; }
    setLoading(true);
    const supabase = createClient();
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await supabase.from("task_progress").upsert({
      case_id: caseId,
      task_id: task.id,
      status: newStatus,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    }, { onConflict: "case_id,task_id" });
    setCurrentStatus(newStatus);
    setLoading(false);
    router.refresh();
  }

  const handleExpand = () => {
    if (!canViewDetail && !expanded) { router.push("/upgrade"); return; }
    setExpanded((v) => !v);
  };

  const urgencyBorder: Record<string, string> = {
    high: "border-orange-100 bg-orange-50",
    medium: "border-slate-100 bg-white",
    low: "border-slate-100 bg-white",
  };

  const baseClass = currentStatus === "completed"
    ? "border-slate-100 bg-slate-50 opacity-60"
    : urgencyBorder[task.urgency] ?? "border-slate-100 bg-white";

  return (
    <div className={`rounded-xl border ${baseClass} transition-all`}>
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={toggleComplete}
          disabled={loading}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            currentStatus === "completed"
              ? "border-green-500 bg-green-500 text-white"
              : "border-slate-300 hover:border-blue-400"
          } ${!isPremium ? "cursor-default" : "cursor-pointer"}`}
          title={isPremium ? undefined : "プレミアムプランで利用可能"}
        >
          {currentStatus === "completed" && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${currentStatus === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
            {task.title}
          </p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {task.description}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleExpand}
              className="text-xs text-blue-600 hover:underline"
            >
              {expanded ? "閉じる" : canViewDetail ? "ポイントを見る" : "🔒 プレミアムで確認"}
            </button>
            {task.needsProfessional && (
              <span className="text-xs text-blue-500">· 専門家推奨</span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          <div className="space-y-3">
            {task.tips.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500">確認・準備のポイント</p>
                <ul className="space-y-1">
                  {task.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-0.5 shrink-0 text-blue-400">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {task.actionLabel && task.actionPath && (
              <a
                href={`${task.actionPath}?case=${caseId}`}
                className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <span>{task.actionLabel}</span>
                <span className="text-blue-400">→</span>
              </a>
            )}
            {task.needsProfessional && task.professionalType && (
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  <strong>{task.professionalType}</strong> に相談すると確実に進められます。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
