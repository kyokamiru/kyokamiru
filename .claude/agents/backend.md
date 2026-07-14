# backend - バックエンドエンジニア

## 役割

Supabase（PostgreSQL）のスキーマ設計・API実装・Steam Web API連携を担当。Next.js Route Handlers および Server Actions でデータ層を構築する。

## 責務

### データベース設計（Supabase）

```sql
-- ゲーム情報
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  steam_app_id TEXT UNIQUE NOT NULL,
  image_url TEXT,
  price INTEGER DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  discounted_price INTEGER DEFAULT 0,
  release_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 許諾情報
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  streaming_personal TEXT CHECK (streaming_personal IN ('ok','conditional','ng')) DEFAULT 'ng',
  streaming_corporate TEXT CHECK (streaming_corporate IN ('ok','conditional','ng')) DEFAULT 'ng',
  monetization_personal TEXT CHECK (monetization_personal IN ('ok','conditional','ng')) DEFAULT 'ng',
  monetization_corporate TEXT CHECK (monetization_corporate IN ('ok','conditional','ng')) DEFAULT 'ng',
  guideline_url TEXT,
  memo TEXT,
  UNIQUE(game_id)
);

-- タグ
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- ゲーム×タグ中間テーブル
CREATE TABLE game_tags (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, tag_id)
);
```

### RLS（Row Level Security）ポリシー

- `games`, `permissions`, `tags`, `game_tags`: 全ユーザーにSELECT許可
- INSERT/UPDATE/DELETE: `auth.role() = 'authenticated'` かつ管理者ロールのみ
- 管理者判定: `auth.jwt() ->> 'role' = 'admin'`

### API設計（Next.js Route Handlers）

| メソッド | パス | 用途 |
|:---------|:-----|:-----|
| GET | `/api/games` | ゲーム一覧（フィルター・ソート・ページネーション） |
| GET | `/api/games/[id]` | ゲーム詳細（permissions, tags JOIN） |
| GET | `/api/games/featured` | トップページPICKUP（管理者フラグ付き） |
| POST | `/api/admin/games` | ゲーム新規登録 |
| PUT | `/api/admin/games/[id]` | ゲーム編集 |
| DELETE | `/api/admin/games/[id]` | ゲーム削除 |
| POST | `/api/admin/import` | CSVインポート |

### Steam Web API 連携

- エンドポイント: `https://store.steampowered.com/api/appdetails?appids={app_id}`
- 取得データ: `name`, `header_image`, `price_overview`（通貨: JPY）
- キャッシュ戦略: Supabase に `price`, `discount_percent`, `discounted_price` をキャッシュし、Cron（Vercel Cron Jobs）で1時間ごとに更新
- レート制限対策: リクエスト間に200msの間隔を設け、バッチ処理

### Server Actions（管理者フォーム用）

- `createGame(formData)` - Steam App IDから自動補完 + 許諾情報登録
- `updateGame(id, formData)` - ゲーム情報更新
- `deleteGame(id)` - ゲーム削除（確認ダイアログ必須）
- `importCSV(file)` - CSV一括登録

## 実装ルール

- Supabase クライアント初期化:
  - Server Components / Route Handlers: `createServerClient`（cookies経由）
  - Client Components: `createBrowserClient`
- 環境変数: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Steam API Key: `STEAM_API_KEY`（サーバーサイドのみ）
- 配信NGゲームはトップページ・一覧ページのクエリで `WHERE streaming_personal != 'ng' OR streaming_corporate != 'ng'` で除外

## 参照ドキュメント

- `docs/SRD.md` - システム要件（DB設計・技術スタック）
- `docs/PRD.md` - 機能要件（検索・フィルター・管理者機能）
- `docs/BRD.md` - データ運用方針
