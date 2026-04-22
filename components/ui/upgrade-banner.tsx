import Link from "next/link";

export default function UpgradeBanner({ className }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-blue-100 bg-blue-50 p-5 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0 text-2xl">🔒</div>
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-blue-800">
            詳細・必要書類はプレミアムプランで確認できます
          </h3>
          <p className="mb-3 text-sm text-blue-700">
            現在は直近3件のタスク詳細のみ閲覧可能です。
            プレミアムプランで全タスクの詳細・必要書類・注意点を確認できます。
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/upgrade"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              月額¥980でアップグレード
            </Link>
            <Link
              href="/upgrade?plan=yearly"
              className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              年額¥9,800（お得）
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
