<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:governance-protocol -->
# 開発プロトコル

## アクション前
1. `docs/exec-plans/active/` の進行中プランを確認する
2. 法令・判例に関わる実装は `docs/legal/` を先に確認する

## コミット時
- 変更内容を `docs/exec-plans/active/` の該当プランに追記してから push する

## 禁止事項
- 法的判断が必要な文言変更をレビューなしで実装しない
- 相続税額・法定相続分の計算ロジックは `docs/specs/` のスペックを先に書いてから実装する
<!-- END:governance-protocol -->

<!-- BEGIN:index -->
# ナレッジベース索引

**リポジトリ外の知識（Slack・口頭・チャット）はエージェントには見えない＝存在しない。すべてをリポジトリに記録する。**

詳細は [`docs/index.md`](docs/index.md) を参照。

## 開発プロセス
→ [`docs/harness/implementation-steps.md`](docs/harness/implementation-steps.md) — 実装ステップ・3ファイルルール・評価
→ [`docs/harness/context-rules.md`](docs/harness/context-rules.md) — コンテキスト管理・状態管理
→ [`docs/harness/mvp-checklist.md`](docs/harness/mvp-checklist.md) — 実装前MVP4問・仕様駆動
→ [`docs/harness/session-protocol.md`](docs/harness/session-protocol.md) — セッション開始・終了・黄金の原則

## 仕様・法務・計画
→ [`docs/specs/`](docs/specs/) — 機能仕様書（実装前に作成）
→ [`docs/legal/`](docs/legal/) — 法的判断・法令確認ログ
→ [`docs/exec-plans/active/`](docs/exec-plans/active/) — 進行中の実行プラン

## 記録
→ [`docs/errors.md`](docs/errors.md) — 既知のエラー・解決策
<!-- END:index -->
