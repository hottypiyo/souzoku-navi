interface ProgressCardProps {
  total: number;
  completed: number;
  nextDeadline: { title: string; remaining: number } | null;
}

export default function ProgressCard({ total, completed, nextDeadline }: ProgressCardProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="mb-1 text-sm font-semibold text-slate-700">全体の進捗</p>
          <div className="flex items-center gap-3">
            <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-bold text-slate-800">{pct}%</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {completed} / {total} タスク完了
          </p>
        </div>

        {nextDeadline && (
          <div className={`shrink-0 rounded-xl px-4 py-3 text-right ${
            nextDeadline.remaining <= 7 ? "bg-red-50" : "bg-amber-50"
          }`}>
            <p className="text-xs font-medium text-slate-500">次の期限</p>
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[160px]">{nextDeadline.title}</p>
            <p className={`text-xs font-bold ${nextDeadline.remaining <= 7 ? "text-red-600" : "text-amber-600"}`}>
              {nextDeadline.remaining < 0
                ? `${Math.abs(nextDeadline.remaining)}日超過`
                : `残り${nextDeadline.remaining}日`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
