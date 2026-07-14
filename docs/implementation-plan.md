# 実装計画 — キョカミル MVP

- 更新日: 2026-07-14
- フェーズ順に実装する。各フェーズの受け入れ条件を満たしてから次へ進むこと。
- 各フェーズ完了時に `pnpm build` `pnpm lint` `pnpm typecheck` がすべて通ること。

## Phase 1: プロジェクト基盤

- Next.js(App Router)+ TypeScript(strict)+ Tailwind CSS + pnpm でスキャフォールド
- ESLint 設定、`typecheck` スクリプト追加
- `.env.local.example` 作成(architecture.md §4 の変数)
- `src/lib/supabase/server.ts`(@supabase/ssr 使用)、`src/lib/labels.ts` の骨格

**受け入れ条件**: `pnpm dev` でトップページ(仮)が表示される。

## Phase 2: データベース

- `supabase/migrations/` に database.md §1〜§3 の DDL をマイグレーションとして作成
- `supabase/seed.sql`(database.md §6 の構成)
- 型生成(`src/types/database.ts`)
- `src/lib/queries.ts`: 公開ページ用取得関数(一覧+フィルタ、詳細、パブリッシャー、新着)。パブリッシャー既定値の継承ロジック(database.md §4-2)もここに実装

**受け入れ条件**: ローカル Supabase(または開発プロジェクト)でマイグレーション+シードが通り、queries の各関数が期待通りの結果を返す。

## Phase 3: 公開ページ

- 共通コンポーネント(screens.md §0)→ トップ → ゲーム一覧(フィルタ・ページネーション)→ ゲーム詳細 → パブリッシャー一覧・詳細 → 静的ページ
- ISR 設定(architecture.md §2)

**受け入れ条件**:
- シードデータで全ページが表示できる
- ゲーム詳細に DisclaimerNote・根拠リンク・最終確認日が表示される
- `published = false` のゲームが公開ページに一切出ない(直接 URL でも 404)
- モバイル幅(375px)でレイアウト崩れがない

## Phase 4: 管理画面

- Supabase Auth ログイン、`/admin` レイアウトの認証ガード
- パブリッシャー CRUD → ゲーム CRUD(公開バリデーション含む)→ Steam 取込(steam-integration.md)→ ダッシュボード(要再確認リスト)
- 保存時の on-demand revalidation

**受け入れ条件**:
- 未認証で `/admin/*` にアクセスするとログインへリダイレクト
- Steam App ID `367520` で取込 → フォームにプリフィルされる
- sources なし・last_verified_at なしのゲームは公開にできない
- 管理画面で更新 → 公開ページに即反映される

## Phase 5: SEO・仕上げ

- `generateMetadata`(全公開ページ)、JSON-LD(VideoGame)、sitemap.ts、robots.ts(/admin Disallow)
- OGP 画像(MVP はサイト共通の静的画像 1 枚でよい)
- `AdSlot` プレースホルダー設置
- 404 / error ページ、画像フォールバック(steam-integration.md §3-3)

**受け入れ条件**: Lighthouse(モバイル)で SEO 90 以上、`/sitemap.xml` に公開ゲームが列挙される。

## Phase 6: デプロイ

- `@opennextjs/cloudflare` + `wrangler.jsonc` のセットアップ(`nodejs_compat`、ISR 用 R2/KV バインディング、`preview` / `deploy` スクリプト)
- `pnpm preview` で Workers ランタイム上の全機能(ISR、Server Actions、on-demand revalidation)を確認
- Cloudflare Workers へデプロイ、環境変数(`vars`)+ Worker Secret(`SUPABASE_SERVICE_ROLE_KEY`)設定、kyokamiru.com のドメイン割り当て(Cloudflare DNS)
- 本番 Supabase にマイグレーション適用(シードは流さない)
- 運営アカウントを Supabase ダッシュボードで作成

**受け入れ条件**: 本番 URL で管理画面からゲームを 1 件登録 → 公開ページに表示される(on-demand revalidation が Workers 上で動作している)。

## スコープ外(実装しないこと)

requirements.md §11 参照。特に以下は実装を**始めない**こと:
- ユーザー登録・お気に入り・通知
- ガイドライン変更履歴
- 自動クロール
- 問い合わせフォームの自作(外部フォームへのリンクで代替)
- AdSense 実タグの組み込み(プレースホルダーまで)
