import Link from "next/link";

export function Header() {
  return (
    <header className="z-20 border-b border-[var(--border-color)] bg-[var(--page-background-deep)] shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link
            href="/"
            className="shrink-0 text-xl font-black text-[var(--text-primary)] no-underline"
          >
            キョカミル
          </Link>

          <form action="/games" className="order-3 flex w-full md:order-none md:flex-1">
            <label htmlFor="site-search" className="sr-only">
              ゲーム名・パブリッシャー名で検索
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="ゲーム名・パブリッシャー名で検索"
              className="min-h-10 min-w-0 flex-1 border border-r-0 border-[var(--border-color)] bg-[var(--input-background)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
            <button
              type="submit"
              className="min-h-10 border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-bold text-[var(--page-background-deep)] hover:bg-[var(--accent-strong)]"
            >
              検索
            </button>
          </form>

          <nav aria-label="メインナビゲーション" className="ml-auto">
            <ul className="flex flex-wrap items-center gap-4 text-sm">
              <li>
                <Link href="/games" className="text-[var(--text-secondary)] hover:text-white">
                  ゲーム一覧
                </Link>
              </li>
              <li>
                <Link href="/publishers" className="text-[var(--text-secondary)] hover:text-white">
                  パブリッシャー
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[var(--text-secondary)] hover:text-white">
                  このサイトについて
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
