# データベース設計 — キョカミル

- 更新日: 2026-07-15(v2: play_modes・メディア・summary カラムを追加)
- 対象: Supabase (PostgreSQL)
- マイグレーションは `supabase/migrations/` に SQL で管理する。以下の DDL が正。

## 1. Enum 定義

```sql
-- 可否ステータス(配信・収益化・切り抜きで共用)
create type approval_status as enum ('allowed', 'conditional', 'prohibited', 'unknown');

-- ネタバレ制限
create type spoiler_status as enum ('none', 'restricted', 'unknown');

-- 音楽・BGM の扱い
create type music_status as enum ('ok', 'partial_mute', 'restricted', 'unknown');

-- 事前申請
create type application_status as enum ('not_required', 'required', 'unknown');

-- 根拠情報の種別
create type source_type as enum ('guideline', 'eula', 'faq', 'dev_statement', 'other');

-- ガイドラインの適用範囲
create type guideline_scope as enum ('publisher_wide', 'title_specific');
```

### 日本語ラベル対応表(`src/lib/labels.ts` に実装)

| enum 値 | ラベル | バッジ色の意図 |
|---------|--------|--------------|
| `allowed` | 可 | 緑 |
| `conditional` | 条件付き可 | 黄 |
| `prohibited` | 不可 | 赤 |
| `unknown` | 不明 | グレー |
| `none` / `restricted` | なし / あり | 緑 / 黄 |
| `ok` / `partial_mute` / `restricted` | 問題なし / 一部ミュート推奨 / 制限あり | 緑 / 黄 / 黄 |
| `not_required` / `required` | 不要 / 必要 | 緑 / 黄 |
| `guideline` / `eula` / `faq` / `dev_statement` / `other` | 公式ガイドライン / EULA / 公式FAQ / 開発者発言 / その他 | — |

### play_mode 値(games.play_modes に格納する固定語彙)

DB 上は enum にせず `text[]` で保持する(Steam カテゴリの将来変化に追従しやすくするため)が、**使用してよい値は以下に限定**し、`src/lib/labels.ts` で一元管理する。

| 値 | ラベル | 由来(Steam カテゴリ) |
|----|--------|---------------------|
| `singleplayer` | ソロ | シングルプレイヤー |
| `online_pvp` | オンライン対戦 | オンライン PvP |
| `online_coop` | オンライン協力 | オンライン協力プレイ |
| `local_multi` | ローカルマルチ | 画面分割・ローカル PvP・ローカル協力 |
| `mmo` | MMO | MMO |

※ Steam API は正確な人数を返さないため「プレイ人数」ではなく「プレイスタイル」として扱う。マッピングの詳細は steam-integration.md §2。

## 2. テーブル定義

```sql
create table publishers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                -- URL 用 (例: "team-cherry")。英小文字・数字・ハイフンのみ
  name text not null,                       -- 表示名(日本語または原語)
  name_en text,                             -- 英語名(name と同じなら null 可)
  official_site_url text,
  guideline_url text,                       -- 包括ガイドラインの URL(ない場合 null)
  guideline_summary text,                   -- 包括ガイドラインの要約(運営執筆。転載禁止)
  default_streaming_status approval_status, -- 包括ガイドラインの既定値。包括 GL がなければ null
  default_monetization_status approval_status,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                -- URL 用 (例: "hollow-knight")
  title text not null,                      -- 日本語タイトル(なければ英語タイトルを入れる)
  title_en text,                            -- 英語タイトル
  publisher_id uuid not null references publishers(id),
  release_date date,
  genres text[] not null default '{}',      -- Steam のジャンルをそのまま格納(日本語)
  steam_app_id integer unique,              -- 国内タイトル等 Steam 外は null 可
  header_image_url text,                    -- Steam CDN の URL(ホットリンク用)。自前ホスト禁止
  play_modes text[] not null default '{}',  -- プレイスタイル(§1 の play_mode 固定語彙のみ)
  screenshots text[] not null default '{}', -- Steam CDN の URL 最大 6 件(ホットリンク用)。自前ホスト禁止
  movie_url text,                           -- トレーラー動画(Steam CDN の mp4 URL)。自前ホスト禁止
  movie_thumbnail_url text,                 -- 動画ポスター画像(Steam CDN)
  summary text,                             -- 運営執筆の一言紹介(1〜2 文、200 文字まで)。Steam 説明文の転載禁止
  guideline_scope guideline_scope not null default 'title_specific',

  -- 許諾情報(すべて必須。不明なら 'unknown' を明示的に選ぶ)
  streaming_status approval_status not null default 'unknown',
  monetization_status approval_status not null default 'unknown',
  spoiler_restriction spoiler_status not null default 'unknown',
  music_restriction music_status not null default 'unknown',
  clip_archive_status approval_status not null default 'unknown',
  prior_application application_status not null default 'unknown',
  notes text,                               -- 条件付きの場合の具体的条件・注意点

  last_verified_at date,                    -- 運営の最終確認日
  published boolean not null default false, -- true のみ公開ページに表示
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index games_publisher_id_idx on games(publisher_id);
create index games_published_idx on games(published) where published = true;
create index games_play_modes_idx on games using gin (play_modes); -- mode フィルタ(配列の重なり検索)用

create table sources (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  url text not null,
  source_type source_type not null,
  label text,                               -- 表示用ラベル(例: "公式配信ガイドライン")
  noted_at date,                            -- その情報の日付・改定日(判明時のみ)
  created_at timestamptz not null default now()
);

create index sources_game_id_idx on sources(game_id);
```

### updated_at 自動更新

```sql
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

alter function public.set_updated_at() set search_path = '';

create trigger publishers_updated_at before update on publishers
  for each row execute function set_updated_at();
create trigger games_updated_at before update on games
  for each row execute function set_updated_at();
```

## 3. RLS ポリシー

方針: **公開データは匿名 read のみ許可。書き込みはすべて service_role(Server Actions)経由で行うため、authenticated への insert/update ポリシーは作らない。**

```sql
alter table publishers enable row level security;
alter table games enable row level security;
alter table sources enable row level security;

-- 匿名(anon)からの読み取り
create policy "public read publishers" on publishers
  for select using (true);

create policy "public read published games" on games
  for select using (published = true);

create policy "public read sources of published games" on sources
  for select using (
    exists (select 1 from games where games.id = sources.game_id and games.published = true)
  );
```

- 管理画面の読み取り(下書き含む全件)と書き込みは service_role キーを使うため RLS をバイパスする。service_role の使用は認証済みセッションを検証した Server Action 内に限定すること(architecture.md §5)。

### 適用済み DB への追加マイグレーション(v2)

初期スキーマは本番適用済みのため、v2 のカラム追加は**新規マイグレーションファイル**として作成する(初期スキーマの書き換え禁止):

```sql
-- supabase/migrations/<timestamp>_add_media_and_play_modes.sql
alter table games
  add column play_modes text[] not null default '{}',
  add column screenshots text[] not null default '{}',
  add column movie_url text,
  add column movie_thumbnail_url text,
  add column summary text;

create index games_play_modes_idx on games using gin (play_modes);
```

適用後は型生成(§5)を必ず実行する。

## 4. ビジネスルール

1. **公開条件**: `published = true` にできるのは、`sources` が 1 件以上あり、`last_verified_at` が入っているゲームのみ。管理画面のバリデーションで強制する(DB 制約にはしない)
2. **パブリッシャー既定値の継承**: ゲーム詳細で各ステータスが `unknown` かつ `guideline_scope = 'publisher_wide'` の場合、パブリッシャーの `default_*_status` を表示に使い、「パブリッシャー包括ガイドラインに準拠」と明示する。**継承は表示ロジックで行い、DB には書き込まない**(ガイドライン改定時にパブリッシャー側の更新だけで済ませるため)
3. **slug**: 一度公開したゲームの slug は変更しない(SEO)。変更が必要な場合は要リダイレクト設計(MVP ではやらない)

## 5. 型生成

スキーマ変更後は必ず実行:

```bash
supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

## 6. シードデータ

`supabase/seed.sql` に開発用のダミーデータを用意する:
- パブリッシャー 3 件(包括ガイドラインあり 1、なし 2)
- ゲーム 10 件(各ステータスの組み合わせを網羅: 全部 allowed / conditional+notes あり / prohibited / unknown / 未公開下書き / steam_app_id なし国内タイトル、を含める)
- sources 各ゲーム 1〜2 件

実データ(初期登録タイトル)は運営が管理画面から登録するため、シードには含めない。
