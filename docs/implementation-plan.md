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

## Phase 3: Workers 基盤+公開ページ

### 3-0. OpenNext 基盤セットアップ(公開ページ実装より先に行う)

Phase 3 の ISR や Phase 4 の Server Actions を Workers ランタイムで検証できるように、この時点で導入する。

- `@opennextjs/cloudflare` と `wrangler` を導入
- `wrangler.jsonc` 作成(`nodejs_compat`、`compatibility_date` は 2024-09-23 以降。architecture.md「Workers ランタイム要件」)
- `open-next.config.ts` 作成(ISR キャッシュ構成: R2 / Durable Object Queue / D1 Tag Cache / Cache Purge。architecture.md「ISR キャッシュ構成」)
- package.json に `preview` / `deploy` / `cf-typegen` スクリプトを追加(architecture.md「ホスティング方式」のコマンド定義に従う)

### 3-1. 公開ページ

- 共通コンポーネント(screens.md §0)→ トップ → ゲーム一覧(フィルタ・ページネーション)→ ゲーム詳細 → パブリッシャー一覧・詳細 → 静的ページ
- ISR 設定(architecture.md §2)

**受け入れ条件**:
- シードデータで全ページが表示できる
- ゲーム詳細に DisclaimerNote・根拠リンク・最終確認日が表示される
- `published = false` のゲームが公開ページに一切出ない(直接 URL でも 404)
- モバイル幅(375px)でレイアウト崩れがない
- **`pnpm preview` で Workers ランタイム上でも全公開ページが表示され、ISR が動作する**

以降のフェーズでも、Workers 固有の処理(ISR・revalidation・Server Actions・バインディング)に関わる変更をした場合は `pnpm preview` での確認を受け入れ条件に含める。

## Phase 4: 管理画面

- Supabase Auth ログイン、`/admin` レイアウトの認証ガード
- パブリッシャー CRUD → ゲーム CRUD(公開バリデーション含む)→ Steam 取込(steam-integration.md)→ ダッシュボード(要再確認リスト)
- 保存時の on-demand revalidation

**受け入れ条件**:
- 未認証で `/admin/*` にアクセスするとログインへリダイレクト
- Steam App ID `367520` で取込 → フォームにプリフィルされる
- sources なし・last_verified_at なしのゲームは公開にできない
- 管理画面で更新 → 公開ページに即反映される(**`pnpm preview` ではローカル R2 / D1 による on-demand revalidation を確認する**。Cloudflare Zone Cache の削除は Phase 6 で確認)

## Phase 5: SEO・仕上げ

- `generateMetadata`(全公開ページ)、JSON-LD(VideoGame)、sitemap.ts、robots.ts(/admin Disallow)
- OGP 画像(MVP はサイト共通の静的画像 1 枚でよい)
- `AdSlot` プレースホルダー設置
- 404 / error ページ、画像フォールバック(steam-integration.md §3-3)

**受け入れ条件**: Lighthouse(モバイル)で SEO 90 以上、`/sitemap.xml` に公開ゲームが列挙される。

## Phase 6: 本番デプロイ

OpenNext / wrangler のセットアップは Phase 3-0 で完了している前提。このフェーズは本番リソースの作成と Git 連携デプロイに集中する。

- 本番用 Cloudflare リソースの作成: R2 バケット(Incremental Cache)、D1(Tag Cache)。Durable Object Queue は `wrangler.jsonc` の binding / migration としてデプロイする(architecture.md「ISR キャッシュ構成」)
- **Workers Builds で GitHub リポジトリを連携**(Cloudflare Pages プロジェクトは作らない):
  - main ブランチへの push で Workers Build が実行される
  - Worker 名と `wrangler.jsonc` の `name` を一致させる
  - **Build Variables**(`NEXT_PUBLIC_*` の 3 変数)と **Runtime Variables / Secrets** を設定する(architecture.md §4。`SUPABASE_SERVICE_ROLE_KEY`、`CACHE_PURGE_API_TOKEN`、`CACHE_PURGE_ZONE_ID` は Worker Secret のみ)
- kyokamiru.com のドメイン割り当て(Cloudflare DNS)
- 本番 Supabase にマイグレーション適用(シードは流さない)
- 運営アカウントを Supabase ダッシュボードで作成

**受け入れ条件**:
- 本番 URL で管理画面からゲームを 1 件登録 → 公開ページに即時表示される(on-demand revalidation と `kyokamiru.com` の Zone Cache Purge が Workers 上で動作している)
- main への push で Workers Build が走り、本番に反映される
- **OpenNext ビルド後の圧縮 Worker サイズを実測し、プランのサイズ上限内であることを確認する**
- **Workers Free プランの CPU 制限内で主要 SSR ページ(ゲーム一覧・詳細)が安定動作することを実測で確認する。超える場合は Workers Paid への移行を検討し、判断を記録する**

### Phase 6 本番検証記録(2026-07-15)

- `main` の commit `6aee114` を Workers Builds で自動ビルド・デプロイし、成功を確認した。
- Build Variables は `NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY` を登録済み。Runtime Variables / Secrets と R2・D1・Durable Object binding も本番 Worker に反映済み。
- Worker の圧縮サイズは 1,606.14 KiB(Free 上限 3 MiB 未満)、起動時間は 32 ms(上限 1 秒未満)。
- `/games` と `/admin/login` を各 10 回リクエストし、すべて成功。平均応答時間はそれぞれ 0.751 秒、0.406 秒だった。
- CPU は P50 6.7 ms、P90 16.17 ms、P99 16.35 ms。CPU 上限超過は 0 件だが、P90 / P99 は [Workers Free の 10 ms 上限](https://developers.cloudflare.com/workers/platform/limits/#account-plan-limits)を超えているため、Free プランでの安定動作は未達と判定する。MVP 検証中は課金防止を優先して Free を継続し、Error 1102 の発生または一般公開前に CPU 最適化を行う。最適化後も P90 が 10 ms を超える場合は Workers Paid へ移行する。
- 未完了: 本番管理画面からゲームを 1 件登録し、公開ページへの即時反映と Zone Cache Purge を確認する。

## スコープ外(実装しないこと)

requirements.md §11 参照。特に以下は実装を**始めない**こと:
- ユーザー登録・お気に入り・通知
- ガイドライン変更履歴
- 自動クロール
- 問い合わせフォームの自作(外部フォームへのリンクで代替)
- AdSense 実タグの組み込み(プレースホルダーまで)
