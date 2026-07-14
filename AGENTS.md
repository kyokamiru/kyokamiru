# AGENTS.md — キョカミル開発ガイド(AIエージェント向け)

このリポジトリは「キョカミル」— 配信者がゲームの配信可否・収益化可否を検索できる Web サービス(kyokamiru.com)。

## 最初に読むドキュメント

コーディング前に必ず以下を読むこと。仕様の根拠はすべてここにある。

| ファイル | 内容 |
|---------|------|
| [docs/requirements.md](docs/requirements.md) | 要件定義(なぜ作るか・何を作るか) |
| [docs/architecture.md](docs/architecture.md) | 技術構成・ディレクトリ構造・環境変数 |
| [docs/database.md](docs/database.md) | DB スキーマ(DDL)・RLS ポリシー |
| [docs/screens.md](docs/screens.md) | 全画面仕様(ルート・表示項目・状態) |
| [docs/steam-integration.md](docs/steam-integration.md) | Steam API 連携・画像利用ルール |
| [docs/implementation-plan.md](docs/implementation-plan.md) | 実装フェーズ・受け入れ条件 |

ドキュメントに書かれていないことを勝手に決めない。仕様の解釈に複数の選択肢がある場合は、実装前に質問として提示すること。

## 技術スタック(確定・変更禁止)

- Next.js(App Router)+ TypeScript(strict)
- Tailwind CSS
- Supabase(PostgreSQL + Auth)
- ホスティング: Cloudflare Workers(`@opennextjs/cloudflare`。Pages + next-on-pages は使わない)
- パッケージマネージャ: pnpm

## コマンド

```bash
pnpm install          # 依存インストール
pnpm dev              # 開発サーバー (http://localhost:3000)
pnpm build            # 本番ビルド(コミット前に必ず通すこと)
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm preview          # opennextjs-cloudflare build + wrangler dev(Workers ランタイムでの動作確認)
pnpm deploy           # opennextjs-cloudflare build + wrangler deploy(手動デプロイ)
```

Workers ランタイム固有の挙動(Node API 互換等)が関わる変更は `pnpm preview` でも確認すること。

## コーディング規約

- **デザインは Steam ストアのレイアウト・要素配置を模倣する**(docs/screens.md「デザイン方針」参照)。ダークテーマ固定。ただし Steam/Valve のロゴ・画像アセット・CSS の流用は禁止
- すべての UI 文言は日本語。コード(変数名・コメント)は英語
- Server Components を基本とし、`"use client"` はインタラクションが必要な末端コンポーネントのみ
- データ取得はサーバー側(Server Components / Server Actions / Route Handlers)で行う。クライアントから Supabase に直接クエリしない(管理画面含む)
- DB の enum 値(`allowed` 等)と日本語表示ラベル(「可」等)の対応は `src/lib/labels.ts` に一元化する
- 型は Supabase の生成型(`src/types/database.ts`)を使う。手書きで重複定義しない
- エラーは握りつぶさない。ユーザー向けには日本語のエラーメッセージを表示

## ガードレール(必ず守る)

1. **免責事項**: ゲーム詳細ページには必ず免責注意書きコンポーネント(「本サービスは参考情報です。必ず公式情報を確認してください」+公式リンク)を表示する
2. **根拠の必須化**: 可否ステータスを表示する画面では、根拠 URL(sources)と最終確認日を必ず併記する
3. **画像**: ゲーム画像は Steam CDN の URL をホットリンクする。画像ファイルをリポジトリや Supabase Storage に保存しない(docs/steam-integration.md 参照)
4. **Steam 商標**: Steam ロゴ画像は使わない。テキストリンク「Steam で見る」を使う。フッターに Valve への帰属表示を入れる
5. **ガイドライン本文の転載禁止**: 公式ガイドライン・EULA の全文をデータとして保存・表示しない。要約とリンクのみ
6. **シークレット**: API キー・service_role キーをクライアントバンドルに含めない。`NEXT_PUBLIC_` プレフィックスは anon キーと URL のみ
7. **マイグレーション**: DB 変更は必ず `supabase/migrations/` の SQL ファイルとして残す。ダッシュボードから手動変更した前提のコードを書かない
