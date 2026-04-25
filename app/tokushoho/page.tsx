export const metadata = { title: "特定商取引法に基づく表記 | 相続手続きナビ" };

const rows = [
  { label: "販売業者", value: "堀田昂佑" },
  { label: "代表者", value: "堀田昂佑" },
  { label: "所在地", value: "〒110-0005　東京都台東区上野1丁目17番6号　広小路ビル8F-B" },
  { label: "電話番号", value: "080-4026-5525（受付時間：平日10:00〜18:00）" },
  { label: "メールアドレス", value: "trombonist.kosuke@gmail.com" },
  { label: "サービス名", value: "相続手続きナビ プレミアムプラン" },
  {
    label: "販売価格",
    value: "月額プラン：980円（税込）／ 年額プラン：9,800円（税込）",
  },
  { label: "支払方法", value: "クレジットカード（Visa・Mastercard・American Express・JCB）" },
  { label: "支払時期", value: "お申し込み時に即時決済" },
  { label: "サービス提供時期", value: "決済完了後、直ちに利用可能" },
  {
    label: "解約について",
    value:
      "マイページより随時解約できます。解約後は次回更新日まで引き続きご利用いただけます。月額プランは翌月以降、年額プランは翌年以降の請求が停止されます。",
  },
  {
    label: "返品・返金",
    value:
      "デジタルコンテンツの性質上、決済完了後の返金は原則としてお受けできません。ただし、サービスの重大な不具合によりご利用いただけなかった場合はこの限りではありません。お問い合わせください。",
  },
  {
    label: "動作環境",
    value: "最新版のGoogle Chrome・Safari・Firefox・Microsoft Edgeを推奨します。",
  },
];

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <a href="/" className="text-base font-semibold text-slate-800">相続手続きナビ</a>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">ダッシュボードへ</a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-8 text-xl font-bold text-slate-800">特定商取引法に基づく表記</h1>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex flex-col gap-1 px-6 py-4 sm:flex-row sm:gap-6 ${
                i !== rows.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <dt className="w-36 shrink-0 text-sm font-medium text-slate-500">{row.label}</dt>
              <dd className="text-sm text-slate-700">{row.value}</dd>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-400 text-center">
          最終更新日：2026年4月25日
        </p>
      </main>
    </div>
  );
}
