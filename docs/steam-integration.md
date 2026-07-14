# Steam 連携仕様 — キョカミル

- 更新日: 2026-07-14
- 目的: ゲームの基本メタデータ入力を自動化する(許諾情報は常に人力)。

## 1. 使用 API

**Steam Storefront API(appdetails)** — API キー不要の公開エンドポイント。

```
GET https://store.steampowered.com/api/appdetails?appids={appId}&cc=jp&l=japanese
```

- 呼び出しは**管理画面の「Steam から取得」操作時のみ**(Server Action 内)。公開ページのリクエスト時には絶対に呼ばない
- 非公式レートリミットが存在する(目安: 200 リクエスト/5 分)。運用上は 1 件ずつの手動取込なので問題にならないが、リトライを実装する場合も最大 1 回に留める
- レスポンスの `success: false` やタイムアウト(10 秒)時は、日本語エラーを返してフォームは手入力継続できるようにする

## 2. フィールドマッピング

`response[appId].data` から以下を取得してフォームにプリフィルする:

| Steam フィールド | games カラム | 備考 |
|-----------------|-------------|------|
| `name` | `title_en`(および `title` の初期値) | 日本語名が返る場合はそのまま title に。運営が手で直せる |
| `publishers[0]` | パブリッシャー名の候補 | 既存 publishers と名前で突合し、あれば選択・なければ新規作成を提案 |
| `release_date.date` | `release_date` | 日本語ロケールの日付文字列(例: "2017年2月24日")をパースする。パース失敗時は空にして手入力 |
| `genres[].description` | `genres` | 日本語ジャンル名の配列 |
| `header_image` | `header_image_url` | Steam CDN URL をそのまま保存 |
| (入力値) | `steam_app_id` | — |

ストア URL(`https://store.steampowered.com/app/{id}/...`)が入力された場合は App ID を正規表現で抽出する。

## 3. 画像の取り扱いルール(必ず遵守)

requirements.md §10 の調査(2026-07-14)に基づく確定方針:

1. **ホットリンクのみ**: `header_image_url` に保存した Steam CDN の URL を `<img src>` で直接参照する。画像ファイルのダウンロード・再ホスティング(Supabase Storage / public/ / Workers 経由のプロキシ)は**禁止**
2. 画像最適化(サーバー側でのリサイズ・再エンコード)は行わない。最適化を通すと自サーバーからの「再配信」に近くなるため、**素の `<img>`(または `next/image` の `unoptimized`)で Steam CDN から直接配信する**(`loading="lazy"` と `width/height` 指定で代替)。Cloudflare Images / Workers での画像プロキシも使わない
3. 画像が 404 になった場合(ストア取り下げ等)に備え、`onError` 相当のフォールバック(タイトル文字のプレースホルダー)を用意する
4. Steam ロゴ・商標画像は使わない。「Steam で見る」テキストリンクのみ
5. フッターに Valve 帰属表示(screens.md §0 Footer)

## 4. Steam ストアへのリンク

- 詳細ページの「Steam で見る」リンク: `https://store.steampowered.com/app/{steam_app_id}`
- `steam_app_id` が null のゲーム(国内タイトル等)ではリンク自体を表示しない

## 5. 実装ノート

- `src/lib/steam.ts` に `fetchSteamAppDetails(appId: number)` を実装。戻り値はマッピング済みの型付きオブジェクト(`SteamImportResult`)
- Zod 等でレスポンスをバリデーションし、想定外の構造でもクラッシュせずエラーメッセージを返す
- テスト用の既知 App ID: 367520(Hollow Knight)、1145360(Hades)、413150(Stardew Valley)
