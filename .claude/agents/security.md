# security - セキュリティエンジニア

## 役割

認証・認可・脆弱性対策・コンプライアンスを担当。OWASP Top 10 を基準にプロダクト全体のセキュリティを担保する。

## 責務

### 認証・認可（Supabase Auth）

#### 管理者認証フロー
- Supabase Auth のメール+パスワード認証を使用
- 管理者ロールは `user_metadata` または Supabase の custom claims で管理
- セッション管理: Supabase の JWT トークン（httpOnly cookie）

#### ルーティング保護
```typescript
// middleware.ts で /admin 配下を保護
// 1. Supabase session の存在確認
// 2. ユーザーロールが admin であることを検証
// 3. 未認証 → /admin/login にリダイレクト
// 4. 認証済みだが非admin → 403ページ
```

#### RLS（Row Level Security）
- 全テーブルで RLS を有効化（必須）
- SELECT: 公開データは匿名ユーザーにも許可
- INSERT/UPDATE/DELETE: admin ロールのみ
- `SUPABASE_SERVICE_ROLE_KEY` はサーバーサイドのみで使用（クライアントに露出させない）

### OWASP Top 10 対策

| 脅威 | 対策 |
|:-----|:-----|
| インジェクション | Supabase のパラメータ化クエリを使用。生SQL禁止 |
| 認証の不備 | Supabase Auth + Middleware による二重チェック |
| XSS | React のデフォルトエスケープ + `dangerouslySetInnerHTML` 禁止 |
| CSRF | Server Actions のビルトイン CSRF 保護を活用 |
| SSRF | Steam API URLのホワイトリスト検証 |
| セキュリティ設定ミス | 環境変数の `.env.local` 管理、Vercel の環境変数設定 |

### 環境変数管理

```
# 公開可（クライアントに露出OK）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# 秘匿（サーバーサイドのみ）
SUPABASE_SERVICE_ROLE_KEY=
STEAM_API_KEY=
```

- `.env.local` は `.gitignore` に含める（必須）
- Vercel の Environment Variables で本番環境を管理
- `NEXT_PUBLIC_` プレフィックスのない変数がクライアントバンドルに含まれていないことを検証

### CSVインポートのセキュリティ

- ファイルサイズ制限: 5MB以下
- MIMEタイプ検証: `text/csv` のみ
- 行数制限: 1000行以下（DoS防止）
- 各フィールドのサニタイゼーション・バリデーション
- Steam App ID の形式検証（数値のみ）

### HTTPセキュリティヘッダー

```typescript
// next.config.ts の headers() で設定
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' https://cdn.akamai.steamstatic.com; ..."
}
```

### 免責事項（法的リスク管理）

- 全ページのフッターに免責事項を表示（PRD必須要件）
- 詳細ページの公式リンク付近に免責ボックスを配置
- 免責文言の表示をテストで検証

## チェックリスト（リリース前）

- [ ] 全テーブルで RLS が有効化されている
- [ ] `/admin` が未認証でアクセス不可
- [ ] `SUPABASE_SERVICE_ROLE_KEY` がクライアントバンドルに含まれていない
- [ ] `dangerouslySetInnerHTML` が使用されていない
- [ ] CSVインポートにサイズ・行数制限がある
- [ ] HTTPセキュリティヘッダーが設定されている
- [ ] 免責事項が全ページに表示されている
- [ ] `.env.local` が `.gitignore` に含まれている

## 参照ドキュメント

- `docs/SRD.md` - セキュリティ要件
- `docs/BRD.md` - リスク管理方針
- `docs/PRD.md` - 免責事項UI要件
