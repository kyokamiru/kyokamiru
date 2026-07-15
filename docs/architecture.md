# アーキテクチャ — キョカミル

- 更新日: 2026-07-14
- 前提: [requirements.md](requirements.md) §7 の技術スタック決定に基づく

## 1. 全体構成

```
[ユーザー] ──> Cloudflare Workers (Next.js App Router / @opennextjs/cloudflare)
                 ├─ 公開ページ: ISR (revalidate) + Server Components
                 │    ├─ Incremental Cache: R2
                 │    ├─ ISR 再検証の重複排除: Durable Object Queue
                 │    └─ Tag Cache (revalidatePath/Tag): D1
                 ├─ 管理画面 (/admin): 動的レンダリング + Supabase Auth
                 └─ Server Actions / Route Handlers
                       ├──> Supabase (PostgreSQL, RLS)
                       └──> Steam Storefront API (管理画面からの取込時のみ)

[ゲーム画像] ブラウザ ──直接──> Steam CDN (ホットリンク、プロキシしない)
[DNS/ドメイン] kyokamiru.com は Cloudflare DNS で管理
```

### ホスティング方式(確定)

- **Cloudflare Workers + `@opennextjs/cloudflare`(OpenNext アダプタ)** を使う。Cloudflare Pages および `@cloudflare/next-on-pages` は使わない(非推奨経路)
- コマンド(package.json スクリプトとして定義):
  - `preview`: `opennextjs-cloudflare build && opennextjs-cloudflare preview`
  - `deploy`: `opennextjs-cloudflare build && opennextjs-cloudflare deploy`
  - `cf-typegen`: `wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts`
- 本番への Git 連携デプロイは **Workers Builds**(implementation-plan.md Phase 6)。手動デプロイは `pnpm deploy`

### Workers ランタイム要件

- `wrangler.jsonc` で `nodejs_compat` を有効化する。**@opennextjs/cloudflare で Next.js を動かすための前提要件**(@supabase/supabase-js もこの上で動く)
- `compatibility_date` は **2024-09-23 以降**
- Next.js は**デフォルトの Node.js ランタイム**を使う。`export const runtime = "edge"` はどのルートにも書かない
- 参考: [Cloudflare の Next.js ガイド](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)、[OpenNext Get Started](https://opennext.js.org/cloudflare/get-started)

### ISR キャッシュ構成(MVP 確定)

`open-next.config.ts` で以下を構成する(参考: [OpenNext Caching](https://opennext.js.org/cloudflare/caching)):

| 役割 | 使用リソース |
|------|-------------|
| Incremental Cache(ISR ページ本体の保存) | **R2** |
| 時間ベース ISR(revalidate: 3600)の再検証の重複排除 | **Durable Object Queue** |
| `revalidatePath` / `revalidateTag` の管理 | **D1 Tag Cache** |
| on-demand revalidation 時のキャッシュ削除 | **Cache Purge 構成** |

- **Workers KV は使わない**: 結果整合性のため revalidation 後も古いデータが残る可能性があり、「管理画面で更新→即反映」の要件(screens.md / implementation-plan.md Phase 4)と両立しないため MVP では採用しない
- R2 の Incremental Cache 単体では on-demand revalidation は完結しない。Tag Cache(D1)+ Queue + Cache Purge を併せて構成すること

## 2. レンダリング戦略

| ページ | 戦略 | 理由 |
|--------|------|------|
| トップ `/` | ISR(revalidate: 3600) | 新着表示があるが即時性不要 |
| ゲーム一覧 `/games` | 動的(searchParams でフィルタ) | 検索・フィルタはクエリパラメータ駆動 |
| ゲーム詳細 `/games/[slug]` | ISR(revalidate: 3600)+ generateStaticParams | SEO 最重要ページ。ビルド時に全件生成 |
| パブリッシャー `/publishers/[slug]` | ISR(revalidate: 3600) | 同上 |
| 静的ページ | 静的 | — |
| 管理画面 `/admin/*` | 動的(no-store) | 常に最新データ |

- 管理画面でデータを更新したら `revalidatePath` / `revalidateTag` で該当公開ページを即時再生成する(on-demand revalidation)。

## 3. ディレクトリ構造

```
kyoka-miru/
├── AGENTS.md
├── docs/                        # 仕様ドキュメント(本ファイル群)
├── supabase/
│   ├── migrations/              # SQL マイグレーション(番号順)
│   └── seed.sql                 # 開発用シードデータ
├── public/
├── src/
│   ├── app/
│   │   ├── (public)/            # 公開ページ群(共通レイアウト: ヘッダー/フッター)
│   │   │   ├── page.tsx                     # トップ
│   │   │   ├── games/page.tsx               # 一覧・検索
│   │   │   ├── games/[slug]/page.tsx        # 詳細
│   │   │   ├── publishers/page.tsx
│   │   │   ├── publishers/[slug]/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── terms/page.tsx               # 免責事項・利用規約
│   │   │   └── contact/page.tsx
│   │   ├── admin/               # 管理画面(認証必須)
│   │   │   ├── layout.tsx                   # 認証ガード
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx                     # ダッシュボード(登録数・要再確認一覧)
│   │   │   ├── games/page.tsx               # ゲーム管理一覧
│   │   │   ├── games/new/page.tsx           # 新規登録(Steam 取込含む)
│   │   │   ├── games/[id]/page.tsx          # 編集
│   │   │   └── publishers/...               # 同様の CRUD
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── layout.tsx
│   ├── components/              # 共有 UI(StatusBadge, DisclaimerNote, GameCard 等)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts        # サーバー用クライアント(cookies 連携)
│   │   │   └── admin.ts         # service_role クライアント(Server Action 専用)
│   │   ├── steam.ts             # Steam Storefront API クライアント
│   │   ├── labels.ts            # enum 値 → 日本語ラベルの一元定義
│   │   └── queries.ts           # 公開ページ用のデータ取得関数
│   └── types/
│       └── database.ts          # supabase gen types で生成
├── package.json
└── ...
```

## 4. 環境変数

| 変数 | 公開範囲 | 用途 |
|------|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | クライアント可 | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | クライアント可 | anon キー(RLS 前提) |
| `SUPABASE_SERVICE_ROLE_KEY` | **サーバーのみ** | 管理画面の書き込み(Server Actions 内のみで使用) |
| `NEXT_PUBLIC_SITE_URL` | クライアント可 | `https://kyokamiru.com`(OGP・sitemap 用) |
| `CACHE_PURGE_API_TOKEN` | **サーバーのみ** | on-demand revalidation 時に Cloudflare Zone Cache を削除する API トークン |
| `CACHE_PURGE_ZONE_ID` | **サーバーのみ** | `kyokamiru.com` を管理する Cloudflare Zone ID |

### ビルド時と実行時は別管理(重要)

Cloudflare では「ビルド時に必要な変数」と「Worker 実行時の変数」が**別の場所で管理される**(参考: [Workers Builds Configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/))。

| タイミング | 設定場所 | 対象変数 |
|-----------|---------|---------|
| **ビルド時**(Workers Builds の **Build Variables**) | Cloudflare ダッシュボードのビルド設定 | `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`NEXT_PUBLIC_SITE_URL`。`generateStaticParams` / `generateMetadata` / ビルド時データ取得で必要 |
| **実行時**(公開可能な値) | `wrangler.jsonc` の `vars`(または Worker の Variables) | `NEXT_PUBLIC_*` の 3 変数 |
| **実行時**(シークレット) | **Worker Secret のみ**(`wrangler secret put`) | `SUPABASE_SERVICE_ROLE_KEY`、`CACHE_PURGE_API_TOKEN`、`CACHE_PURGE_ZONE_ID` |

- `SUPABASE_SERVICE_ROLE_KEY` と `CACHE_PURGE_*` を **Build Variables や `wrangler.jsonc` に書かない**(実行時 Secret のみ)
- Cache Purge は Cloudflare Zone(カスタムドメイン)上でのみ有効。ローカルの `pnpm preview` では R2 / D1 による on-demand revalidation を確認し、Zone Cache の削除は Phase 6 で `kyokamiru.com` 上から確認する
- ローカル開発: `.env.local`(`.env.local.example` を用意し、実キーはコミットしない)

## 5. 認証(管理画面)

- Supabase Auth のメール+パスワード。運営アカウントのみ(サインアップ画面は作らない。アカウントは Supabase ダッシュボードで作成)
- `/admin/*` は `layout.tsx` でセッション検証し、未認証は `/admin/login` へリダイレクト
- 書き込みは Server Actions 経由。Action 冒頭で必ずセッションを再検証してから service_role クライアントを使う

## 6. SEO 要件

- 各ゲーム詳細ページ: `generateMetadata` で title(`{ゲーム名}の配信・収益化ガイドライン | キョカミル`)、description、OGP を生成
- JSON-LD: `VideoGame` スキーマを詳細ページに埋め込む
- `sitemap.ts` で全公開ゲーム・パブリッシャーページを列挙
- `robots.ts` で `/admin` を Disallow

## 7. 広告(AdSense)

- MVP では **広告スロットのプレースホルダーコンポーネント**(`<AdSlot />`)だけ実装する(一覧ページのカード間、詳細ページの下部)
- AdSense の実タグ導入はサイト審査後。スクリプト読み込みは環境変数でオン/オフできる構造にする
