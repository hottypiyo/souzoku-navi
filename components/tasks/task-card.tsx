"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDaysRemaining } from "@/lib/tasks/definitions";
import type { TaskDefinition } from "@/lib/tasks/definitions";
import type { TaskStatus } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";
import { posthog } from "@/lib/posthog";

interface TaskCardProps {
  task: Omit<TaskDefinition, "condition">;
  status: TaskStatus | string;
  notes: string | null;
  deathDate: string;
  caseId: string;
  isPremium: boolean;
  canViewDetail: boolean;
}

export default function TaskCard({
  task,
  status,
  notes: initialNotes,
  deathDate,
  caseId,
  isPremium,
  canViewDetail,
}: TaskCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const remaining = task.deadlineDays !== null
    ? getDaysRemaining(deathDate, task.deadlineDays)
    : null;

  const isOverdue = remaining !== null && remaining < 0;
  const isUrgent = remaining !== null && remaining <= 7 && remaining >= 0;

  async function toggleComplete() {
    if (!isPremium) { router.push("/upgrade"); return; }
    setLoading(true);
    const supabase = createClient();
    const newStatus: TaskStatus = currentStatus === "completed" ? "pending" : "completed";
    await supabase.from("task_progress").upsert({
      case_id: caseId,
      task_id: task.id,
      status: newStatus,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    }, { onConflict: "case_id,task_id" });
    posthog.capture(newStatus === "completed" ? "task_completed" : "task_uncompleted", {
      task_id: task.id,
      task_title: task.title,
    });
    setCurrentStatus(newStatus);
    setLoading(false);
    if (newStatus === "completed") {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 2500);
    }
    router.refresh();
  }

  function handleNoteChange(val: string) {
    setNotes(val);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => saveNote(val), 1000);
  }

  async function saveNote(val: string) {
    setSavingNote(true);
    await fetch("/api/task-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, taskId: task.id, notes: val }),
    });
    setSavingNote(false);
  }

  const handleExpand = () => {
    if (!canViewDetail && !expanded) { router.push("/upgrade"); return; }
    setExpanded((v) => !v);
  };

  const urgencyColors: Record<string, string> = {
    critical: "border-red-200 bg-red-50",
    high: "border-orange-100 bg-orange-50",
    medium: "border-slate-100 bg-white",
    low: "border-slate-100 bg-white",
  };

  const baseClass = currentStatus === "completed"
    ? "border-slate-100 bg-slate-50 opacity-60"
    : urgencyColors[task.urgency] ?? "border-slate-100 bg-white";

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
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium leading-snug ${currentStatus === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
              {task.title}
            </p>
            {remaining !== null && currentStatus !== "completed" && (
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isOverdue ? "bg-red-100 text-red-700"
                  : isUrgent ? "bg-orange-100 text-orange-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {isOverdue ? `${Math.abs(remaining)}日超過` : `残り${remaining}日`}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
            <span>{task.deadlineLabel}</span>
            <span>·</span>
            <span>{task.assignee}</span>
            {task.estimatedTime && (
              <>
                <span>·</span>
                <span>⏱ {task.estimatedTime}</span>
              </>
            )}
            {task.estimatedCost && (
              <>
                <span>·</span>
                <span>💴 {task.estimatedCost}</span>
              </>
            )}
            {task.needsProfessional && (
              <>
                <span>·</span>
                <span className="text-blue-500">専門家推奨</span>
              </>
            )}
          </div>

          <button
            onClick={handleExpand}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            {expanded ? "詳細を閉じる" : canViewDetail ? "詳細を見る" : "🔒 プレミアムで詳細を確認"}
          </button>
        </div>
      </div>

      {justCompleted && (
        <div className="animate-fade-in-down flex items-center gap-2 border-t border-green-100 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          お疲れさまでした。1件完了です。
        </div>
      )}

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500">どこで行う</p>
              <p className="text-slate-700">{task.where}</p>
            </div>
            {task.estimatedTime && (
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500">所要時間の目安</p>
                <p className="text-slate-700">{task.estimatedTime}</p>
              </div>
            )}
            {task.estimatedCost && (
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500">費用の目安</p>
                <p className="text-slate-700">{task.estimatedCost}</p>
              </div>
            )}
          </div>

          {task.requiredDocs.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500">必要な書類・持参物</p>
              <ul className="space-y-1">
                {task.requiredDocs.map((doc) => (
                  <li key={doc} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-0.5 shrink-0 text-slate-400">•</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {task.commonMistakes.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="mb-1 text-xs font-semibold text-amber-700">よくあるミス・注意点</p>
              <ul className="space-y-1">
                {task.commonMistakes.map((m) => (
                  <li key={m} className="flex items-start gap-2 text-sm text-amber-800">
                    <span className="mt-0.5 shrink-0">⚠</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {task.needsProfessional && task.professionalType && (
            <div className="rounded-lg bg-blue-50 p-3 flex items-center justify-between gap-3">
              <p className="text-sm text-blue-700">
                この手続きは <strong>{task.professionalType}</strong> への依頼をおすすめします。
              </p>
              <a href="/specialists" className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                専門家を探す
              </a>
            </div>
          )}

          {/* メモ */}
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">
              メモ
              {savingNote && <span className="ml-2 font-normal text-slate-400">保存中…</span>}
            </p>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="「○月○日に窓口へ行った」など自由に記録できます"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
