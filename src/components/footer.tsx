import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--page-background-deep)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div className="max-w-3xl text-pretty leading-6 text-[var(--text-muted)]">
          <p>
            本サービスは参考情報の提供を目的としています。配信前に必ず公式情報をご確認ください。
          </p>
          <p className="mt-2">
            ゲーム情報・画像は
            <a
              href="https://store.steampowered.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-1 text-[var(--accent-strong)] underline underline-offset-4"
            >
              Steam
            </a>
            より取得しています。キョカミルは Valve Corporation とは無関係です。
          </p>
        </div>
        <div>
          <nav aria-label="フッターナビゲーション">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[var(--text-secondary)]">
              <li><Link href="/about">サービスについて</Link></li>
              <li><Link href="/terms">免責事項・利用規約</Link></li>
              <li><Link href="/contact">お問い合わせ</Link></li>
            </ul>
          </nav>
          <p className="mt-4 text-xs text-[var(--text-muted)]">© 2026 キョカミル</p>
        </div>
      </div>
    </footer>
  );
}
