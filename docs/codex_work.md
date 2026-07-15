# Codex 作業記録

- 対象: キョカミル MVP
- 作業期間: 2026-07-14〜2026-07-15
- 本番 URL: https://kyokamiru.com
- GitHub: https://github.com/kyokamiru/kyokamiru

## 実施内容の概要

### 1. プロジェクト基盤

- Next.js(App Router)、TypeScript(strict)、Tailwind CSS、pnpm の開発基盤を構築した。
- ESLint、型チェック、本番ビルド用スクリプトを整備した。
- Supabase のサーバークライアント、表示ラベル、生成 DB 型の基盤を追加した。

### 2. Supabase・データベース

- 本番 Supabase プロジェクト `ubhawtrxufgqevzblhjr` に接続した。
- `publishers`、`games`、`sources` テーブル、enum、外部キー、インデックス、更新日時トリガーをマイグレーションで作成した。
- 3テーブルすべてに RLS を有効化し、公開済みデータだけを匿名ユーザーが参照できるポリシーを設定した。
- `set_updated_at` 関数の `search_path` 未固定警告を追加マイグレーションで解消した。
- 本番環境にはシードデータを投入せず、運営アカウントを Supabase Auth に作成した。

### 3. 公開ページ・管理画面

- Steam ストアを参考にしたダークテーマの公開ページを実装した。
- トップ、ゲーム一覧・詳細、パブリッシャー一覧・詳細、サービス説明、利用規約、問い合わせページを追加した。
- ゲーム検索、絞り込み、並び替え、ページネーションを実装した。
- ゲーム詳細に免責事項、根拠 URL、最終確認日、Steam テキストリンクを表示した。
- Supabase Auth を利用した管理画面のログイン・認証ガードを実装した。
- パブリッシャーとゲームの CRUD、公開バリデーション、Steam App ID からの情報取込、要再確認一覧を実装した。
- 未公開ゲームは公開ページおよび直接 URL から参照できないようにした。

### 4. SEO・仕上げ

- canonical、OGP、Twitter Card、JSON-LD、`robots.txt`、`sitemap.xml` を追加した。
- 共通 OGP 画像、404・エラー画面、Steam 画像フォールバック、広告プレースホルダーを追加した。
- Lighthouse モバイル SEO 100 を確認した。

### 5. Cloudflare Workers 本番構成

重要な方針変更として、Cloudflare Pages / `next-on-pages` は使用せず、`@opennextjs/cloudflare` を利用した Cloudflare Workers 構成に統一した。通常運用に Docker は使用しない。

- Worker 名: `kyokamiru`
- OpenNext Incremental Cache 用 R2: `kyoka-miru-opennext-cache`
- Tag Cache 用 D1: `kyoka-miru-opennext-tag-cache`
- D1 ID: `2eaeb486-e656-422c-842e-c1e10106613b`
- Durable Object Queue、Worker 自己参照、Static Assets binding を設定した。
- `nodejs_compat` と OpenNext が必要とする compatibility date を設定した。
- Supabase、本番サイト URL、Zone Cache Purge に必要な Runtime Variables / Secrets を登録した。シークレット値は Git に含めていない。
- `kyokamiru.com` を Worker のカスタムドメインとして割り当てた。
- GitHub リポジトリと Workers Builds を連携し、`main` push で自動ビルド・デプロイされるようにした。
- Build Variables として3つの `NEXT_PUBLIC_*` 変数を設定した。

## 本番検証

- OpenNext の圧縮 Worker サイズ: 1,606.14 KiB。Workers Free の 3 MiB 上限内。
- Worker 起動時間: 32 ms。1秒上限内。
- `/games` と `/admin/login` を各10回リクエストし、すべて成功した。
- 本番管理画面から「めっちゃカメレオン」を登録し、ゲーム一覧・詳細ページへの即時反映を確認した。
- 詳細ページで免責、根拠 URL、最終確認日、Steam リンクを確認した。
- on-demand revalidation と Cloudflare Zone Cache Purge により、詳細ページとサイトマップが再生成されることを確認した。
- `sitemap.xml` に新規ゲームが即時反映されない不具合を発見し、ゲーム・パブリッシャーの作成、更新、削除時にサイトマップも再検証するよう修正した。
- 最終 Workers Build と本番デプロイの成功を確認した。

## 重要なコミット

- `563f523`: Phase 1 のプロジェクト基盤
- `93ec590`: ホスティングを Cloudflare Workers に変更
- `84e94d8`: Supabase プロジェクト設定と初期スキーマ
- `6aee114`: MVP と Cloudflare Workers 本番構成
- `eb89c5f`: 公開更新時のサイトマップ再検証を修正
- `ca93658`: Phase 6 公開反映テスト完了を記録

## 現在の状態と残対応

- MVP の主要機能と Phase 1〜6 の本番公開確認は完了している。
- `main` と `origin/main` は同期済み。
- Workers CPU は P50 6.7 ms、P90 16.17 ms、P99 16.35 ms。CPU 上限超過エラーは0件だが、P90 / P99 は Workers Free の10 ms上限を超えている。
- MVP 検証中は課金防止を優先して Free を継続する。一般公開前に CPU を最適化し、P90 が10 msを超える場合は Workers Paid への移行を検討する。
- `.env.local` と `.dev.vars` はローカル専用であり、APIキーやシークレットをコミットしないこと。

## 関連ドキュメント

- [実装計画](implementation-plan.md)
- [アーキテクチャ](architecture.md)
- [データベース](database.md)
- [画面仕様](screens.md)
- [Steam 連携](steam-integration.md)
