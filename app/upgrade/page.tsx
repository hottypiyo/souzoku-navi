import Link from "next/link";
import CheckoutButtons from "@/components/ui/checkout-buttons";

export const metadata = { title: "プレミアムプランへアップグレード" };

export default function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <Link href="/dashboard" className="mb-6 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          ← ダッシュボードに戻る
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-slate-800">
            プレミアムプランにアップグレード
          </h1>
          <p className="mb-8 text-sm text-slate-500">
            全手続きの詳細・必要書類・専門家への相談案内をすべて利用できます。
          </p>

          {/* プラン選択 */}
          <div className="mb-6 space-y-3">
            {/* 月額 */}
            <div className="rounded-xl border-2 border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">月額プラン</p>
                  <p className="text-sm text-slate-500">いつでもキャンセル可能</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-800">¥980</span>
                  <span className="text-sm text-slate-500">/月</span>
                </div>
              </div>
            </div>

            {/* 年額（推奨） */}
            <div className="relative rounded-xl border-2 border-blue-500 bg-blue-50 p-5">
              <span className="absolute -top-2.5 left-4 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
                おすすめ・2ヶ月分お得
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">年額プラン</p>
                  <p className="text-sm text-slate-500">¥816/月 相当</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-700">¥9,800</span>
                  <span className="text-sm text-slate-500">/年</span>
                </div>
              </div>
            </div>
          </div>

          {/* プレミアム機能一覧 */}
          <div className="mb-8 rounded-xl bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              プレミアムプランで利用できること
            </p>
            <ul className="space-y-2">
              {[
                "全タスクの詳細閲覧（必要書類・窓口・持参物）",
                "よくあるミス・注意点の確認",
                "タスク完了チェック管理",
                "期限リマインダーメール",
                "司法書士・税理士への相談案内",
                "後から状況を更新できる",
                "複数案件の管理（最大10件）",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-blue-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <CheckoutButtons />

          <p className="mt-4 text-center text-xs text-slate-400">
            Stripeの安全な決済でお支払い。解約はいつでも可能。
          </p>
        </div>
      </div>
    </div>
  );
}
