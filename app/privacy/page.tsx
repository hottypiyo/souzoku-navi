export const metadata = { title: "プライバシーポリシー | 相続手続きナビ" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <a href="/" className="text-base font-semibold text-slate-800">相続手続きナビ</a>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">ダッシュボードへ</a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 space-y-8">
        <h1 className="text-xl font-bold text-slate-800">プライバシーポリシー</h1>

        <p className="text-sm text-slate-600">
          堀田昂佑（以下「当方」）は、相続手続きナビ（以下「本サービス」）における個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
        </p>

        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">1. 収集する情報</h2>
          <div className="text-sm text-slate-600 space-y-2">
            <p>本サービスでは、以下の情報を収集します。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>メールアドレス（アカウント登録時）</li>
              <li>LINEユーザーID（LINE通知連携時）</li>
              <li>相続に関する入力情報（故人名、死亡日、家族構成など）</li>
              <li>決済情報（Stripeを通じて処理され、当方はカード番号を保持しません）</li>
              <li>サービス利用状況（アクセスログ、操作ログ）</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">2. 利用目的</h2>
          <div className="text-sm text-slate-600 space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>本サービスの提供・運営</li>
              <li>手続き期限のリマインダー通知（メール・LINE）</li>
              <li>AIによる相談機能の提供</li>
              <li>サービスの改善・新機能の開発</li>
              <li>お問い合わせへの対応</li>
              <li>利用規約違反への対応</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">3. 第三者への提供</h2>
          <p className="text-sm text-slate-600">
            当方は、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供しません。
            ただし、以下のサービスとデータを共有します。
          </p>
          <div className="rounded-xl border border-slate-200 overflow-hidden text-sm">
            {[
              { name: "Supabase", purpose: "データベース・認証基盤", url: "https://supabase.com/privacy" },
              { name: "Stripe", purpose: "決済処理", url: "https://stripe.com/jp/privacy" },
              { name: "Resend", purpose: "メール送信", url: "https://resend.com/legal/privacy-policy" },
              { name: "LINE", purpose: "LINE通知送信", url: "https://line.me/ja/terms/policy/" },
              { name: "Google（Gemini）", purpose: "AI相談機能", url: "https://policies.google.com/privacy" },
              { name: "Vercel", purpose: "ホスティング", url: "https://vercel.com/legal/privacy-policy" },
            ].map((s, i, arr) => (
              <div key={s.name} className={`flex items-center justify-between px-4 py-3 ${i !== arr.length - 1 ? "border-b border-slate-100" : ""}`}>
                <div>
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <span className="ml-2 text-slate-500">{s.purpose}</span>
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">ポリシー</a>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">4. データの保存・管理</h2>
          <p className="text-sm text-slate-600">
            収集した個人情報は、Supabase（東京リージョン）にて暗号化して保存します。
            アカウント削除をご希望の場合は、下記お問い合わせ先までご連絡ください。速やかにデータを削除します。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">5. Cookieの使用</h2>
          <p className="text-sm text-slate-600">
            本サービスでは、セッション管理のためにCookieを使用します。
            ブラウザの設定によりCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">6. お客様の権利</h2>
          <p className="text-sm text-slate-600">
            ご自身の個人情報について、開示・訂正・削除・利用停止をご希望の場合は、下記お問い合わせ先にご連絡ください。
            本人確認の上、合理的な期間内に対応します。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">7. 未成年者について</h2>
          <p className="text-sm text-slate-600">
            本サービスは18歳以上の方を対象としています。未成年の方がご利用になる場合は、保護者の同意を得てください。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">8. プライバシーポリシーの変更</h2>
          <p className="text-sm text-slate-600">
            本ポリシーは必要に応じて改定することがあります。重要な変更がある場合はサービス内でお知らせします。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-slate-800">9. お問い合わせ</h2>
          <p className="text-sm text-slate-600">
            個人情報の取り扱いに関するお問い合わせは、以下にご連絡ください。
          </p>
          <div className="rounded-xl bg-slate-100 px-5 py-4 text-sm text-slate-700 space-y-1">
            <p>堀田昂佑</p>
            <p>〒110-0005　東京都台東区上野1丁目17番6号　広小路ビル8F-B</p>
            <p>メール：trombonist.kosuke@gmail.com</p>
          </div>
        </section>

        <p className="text-xs text-slate-400 text-center">最終更新日：2026年4月25日</p>
      </main>
    </div>
  );
}
