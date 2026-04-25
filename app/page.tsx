import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-semibold text-slate-800">相続手続きナビ</span>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-blue-600">
            相続手続きナビ
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            親が亡くなった後の手続き、<br />
            何から始めればいいかわかりますか？
          </h1>
          <p className="mb-8 text-lg text-slate-600">
            死亡届・銀行口座・相続放棄・相続税…締切付きの手続きが数十件同時に発生します。
            あなたの状況に合わせて「今すぐやること」を整理します。
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 sm:w-auto"
            >
              無料で手続きリストを作る
            </Link>
            <p className="text-sm text-slate-500">登録5分・クレジットカード不要</p>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-slate-800">
            こんな状況ではありませんか？
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "⏰",
                title: "期限があることを知らなかった",
                desc: "相続放棄は3ヶ月、準確定申告は4ヶ月。1日でも過ぎると取り返しがつかない手続きがあります。",
              },
              {
                icon: "🏢",
                title: "役所・銀行・士業がバラバラ",
                desc: "それぞれが自分の縦割りしか案内しない。全体を見渡して「次に何をすべきか」教えてくれる人がいない。",
              },
              {
                icon: "📋",
                title: "手続きの数が多すぎる",
                desc: "死亡届・年金停止・口座解約・相続登記・相続税…同時に30件以上の手続きが発生します。",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h3 className="mb-2 font-semibold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-slate-800">
            使い方は3ステップ
          </h2>
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "状況を入力する（約3分）",
                desc: "不動産・遺言書・相続人数など5つの質問に答えるだけ。あなたに必要な手続きだけを絞り込みます。",
              },
              {
                step: "2",
                title: "期限付きタスクリストを確認する",
                desc: "「今すぐやること」「今週中にやること」「来月までにやること」に整理して表示。期限のカウントダウンも確認できます。",
              },
              {
                step: "3",
                title: "必要な時だけ専門家につなぐ",
                desc: "相続放棄・相続税・不動産登記など専門家が必要なタスクは、適切なタイミングで司法書士・税理士を紹介します。",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-slate-800">料金プラン</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="mb-1 text-lg font-semibold text-slate-800">無料プラン</h3>
              <div className="mb-6 text-4xl font-bold text-slate-900">
                ¥0
              </div>
              <ul className="mb-8 space-y-3 text-sm text-slate-600">
                {[
                  "状況ヒアリング（5問）",
                  "手続きタスクリストの表示",
                  "期限・緊急度の確認",
                  "直近タスク3件の詳細閲覧",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                無料で始める
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-2xl bg-blue-600 p-8 text-white shadow-sm">
              <h3 className="mb-1 text-lg font-semibold">プレミアムプラン</h3>
              <div className="mb-1 text-4xl font-bold">
                ¥980<span className="text-lg font-normal">/月</span>
              </div>
              <p className="mb-6 text-sm text-blue-200">または ¥9,800/年（2ヶ月分お得）</p>
              <ul className="mb-8 space-y-3 text-sm text-blue-50">
                {[
                  "全タスクの詳細閲覧",
                  "必要書類・窓口・持参物の一覧",
                  "タスク完了チェック管理",
                  "期限リマインダーメール",
                  "司法書士・税理士への相談案内",
                  "状況の後から更新・複数案件対応",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-blue-200">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=premium"
                className="block w-full rounded-xl bg-white py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                プレミアムで始める
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            信託銀行の遺産整理業務（100万〜300万円）と比べて、情報ナビゲーションに特化することで低価格を実現しています。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-3">
          <p className="text-center text-xs text-slate-400">
            本サービスは情報提供を目的としており、法律相談・税務相談ではありません。
            具体的な法的判断・税務判断については、司法書士・弁護士・税理士等の専門家にご相談ください。
          </p>
          <div className="flex justify-center gap-6 text-xs text-slate-400">
            <a href="/terms" className="hover:text-slate-600">利用規約</a>
            <a href="/privacy" className="hover:text-slate-600">プライバシーポリシー</a>
            <a href="/tokushoho" className="hover:text-slate-600">特定商取引法に基づく表記</a>
          </div>
          <p className="text-center text-xs text-slate-300">© 2026 堀田昂佑</p>
        </div>
      </footer>
    </main>
  );
}
