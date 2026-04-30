export const metadata = {
  title: "利用規約",
  description: "相続手続きナビのサービス利用に関する規約です。",
  alternates: { canonical: "https://souzoku-navi.app/terms" },
  robots: { index: true, follow: false },
};

const sections = [
  {
    title: "1. 適用",
    body: "本規約は、堀田昂佑（以下「当方」）が提供する相続手続きナビ（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意した上で本サービスをご利用ください。",
  },
  {
    title: "2. サービスの内容",
    body: "本サービスは、日本の相続手続きに関する情報提供・チェックリスト管理・AIによる質問応答・リマインダー通知を提供します。本サービスは情報提供を目的としており、法律相談・税務相談・その他の専門的アドバイスを提供するものではありません。具体的な判断は専門家（弁護士・司法書士・税理士等）にご相談ください。",
  },
  {
    title: "3. アカウント",
    body: "ユーザーはメールアドレスとパスワードを使用してアカウントを作成します。アカウント情報の管理はユーザー自身の責任で行ってください。不正利用が発覚した場合は直ちに当方にご連絡ください。",
  },
  {
    title: "4. 料金・決済",
    body: "本サービスには無料プランとプレミアムプラン（月額980円または年額9,800円、いずれも税込）があります。プレミアムプランの料金はStripeを通じてクレジットカードにて決済されます。",
  },
  {
    title: "5. 解約・返金",
    body: "プレミアムプランはマイページからいつでも解約できます。解約後は次回更新日まで引き続きご利用いただけます。デジタルコンテンツの性質上、原則として返金はお受けできません。ただし、サービスの重大な不具合によりご利用いただけなかった場合はこの限りではありません。",
  },
  {
    title: "6. 禁止事項",
    body: "ユーザーは以下の行為を行ってはなりません。\n・法令または公序良俗に違反する行為\n・当方または第三者の知的財産権・プライバシー・名誉を侵害する行為\n・本サービスの運営を妨害する行為\n・他のユーザーに成りすます行為\n・本サービスを通じて得た情報を商業目的で無断使用する行為\n・その他、当方が不適切と判断する行為",
  },
  {
    title: "7. 知的財産権",
    body: "本サービスに含まれるコンテンツ（テキスト・デザイン・ロゴ等）に関する知的財産権は当方に帰属します。ユーザーは個人的・非商業的な目的の範囲内でのみ利用できます。",
  },
  {
    title: "8. 免責事項",
    body: "当方は本サービスの情報の正確性・完全性・最新性を保証しません。本サービスの利用により生じた損害について、当方の故意または重過失による場合を除き、責任を負いません。また、外部サービス（Stripe・LINE・Supabase等）の障害・仕様変更による影響について当方は責任を負いません。",
  },
  {
    title: "9. サービスの変更・停止",
    body: "当方は、ユーザーへの事前通知なく本サービスの内容を変更、または提供を一時停止・終了することがあります。これによりユーザーに生じた損害について、当方は責任を負いません。",
  },
  {
    title: "10. 規約の変更",
    body: "当方は必要に応じて本規約を変更することがあります。重要な変更がある場合はサービス内または登録メールアドレスへの通知によりお知らせします。変更後もサービスを継続してご利用の場合は、変更に同意したものとみなします。",
  },
  {
    title: "11. 準拠法・裁判管轄",
    body: "本規約は日本法に準拠します。本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。",
  },
  {
    title: "12. お問い合わせ",
    body: "本規約に関するお問い合わせは、info@souzoku-navi.app までご連絡ください。",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <a href="/" className="text-base font-semibold text-slate-800">相続手続きナビ</a>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">ダッシュボードへ</a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 space-y-8">
        <h1 className="text-xl font-bold text-slate-800">利用規約</h1>

        <p className="text-xs text-slate-500">制定日：2026年4月25日</p>

        <div className="space-y-6">
          {sections.map((s) => (
            <section key={s.title} className="space-y-2">
              <h2 className="font-semibold text-slate-800">{s.title}</h2>
              <p className="text-sm text-slate-600 whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center">最終更新日：2026年4月25日</p>
      </main>
    </div>
  );
}
