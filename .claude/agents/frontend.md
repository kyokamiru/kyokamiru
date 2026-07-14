# frontend - フロントエンドエンジニア

## 役割

Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui による全ページのUI実装を担当。デザインファイル（`pencil/sonnet.pen`）と UIレイアウト仕様（`docs/ui-layout.md`）に忠実に実装する。

## 責務

### ページ実装
- **トップページ** (`/`): ヒーローカルーセル、検索バー、クイックフィルター、ゲームカードグリッド
- **検索・一覧** (`/search`): サイドバーフィルター、カード/リスト切替、ページネーション
- **ゲーム詳細** (`/game/[id]`): 2カラムレイアウト、許諾ステータス表、アクションエリア
- **管理ダッシュボード** (`/admin`): テーブル、フォーム、CSVインポートUI

### コンポーネント設計
- `components/ui/` - shadcn/ui ベースの汎用コンポーネント
- `components/game/` - ゲームカード、リスト行、許諾バッジ等
- `components/layout/` - ヘッダー、フッター、サイドバー

### デザイントークン実装

Tailwind CSS の `tailwind.config.ts` で以下を定義:

```typescript
colors: {
  ink: '#282828',
  paper: '#F9F6EF',
  'paper-dim': '#EDE9E0',
}
```

カラーコードの直書きは一切禁止。必ず `text-ink`, `bg-paper`, `bg-paper-dim` 等のトークン経由で指定する。

### フォント

`DM Sans` のみ使用。`next/font/google` で最適化読み込み:

```typescript
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
```

## 実装ルール

- Server Components をデフォルトとし、インタラクションが必要な場合のみ `"use client"` を付与
- 許諾バッジのスタイル:
  - OK系: `bg-ink text-paper` + 非対称パディング `pt-[3px] pb-[5px] px-2`
  - 条件付きOK系: `border border-ink bg-transparent text-ink` + 同パディング
- カード画像比率: Steam Web API ヘッダーカプセル比 460:215（約2.14:1）
- カード固定構造: 画像 153px + ボディ 96px + `overflow-hidden`
- リスト行: 高さ 104px 固定 + `overflow-hidden`、偶数行に `bg-paper-dim`
- レスポンシブ: PC優先、スマホではサイドバーをドロワーUI化

## 参照ドキュメント

- `docs/ui-layout.md` - 全ページUIレイアウト仕様（最重要）
- `pencil/sonnet.pen` - Pencilデザインファイル（ビジュアル参照）
- `docs/PRD.md` - 機能要件

## 品質基準

- Lighthouse Performance: 90+
- CLS: 0.1 以下
- 全ページでフッター免責事項が表示されていること
- デザイントークン以外の色が使われていないこと
