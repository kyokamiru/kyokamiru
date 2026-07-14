import Link from "next/link";

const previewGames = [
  {
    title: "海外インディーゲーム",
    publisher: "公開データ準備中",
    status: "可否を公式情報から確認",
  },
  {
    title: "話題の新作タイトル",
    publisher: "公開データ準備中",
    status: "根拠リンクと確認日を掲載",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-[var(--page-background)]">
      <header className="border-b border-[var(--border-color)] bg-[var(--page-background-deep)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-xl font-bold text-[var(--text-primary)] no-underline"
          >
            キョカミル
          </Link>
          <span className="rounded-sm border border-[var(--border-color)] px-3 py-1 text-xs text-[var(--text-muted)]">
            公開準備中
          </span>
        </div>
      </header>

      <main>
        <section className="border-b border-[var(--border-color)] bg-[var(--panel-background-muted)]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="mb-3 text-sm font-semibold text-[var(--accent-strong)]">
              配信ガイドラインデータベース
            </p>
            <h1 className="max-w-3xl text-balance text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-5xl">
              このゲーム、収益化配信して大丈夫？
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 sm:text-lg">
              配信可否・収益化可否と、その判断の根拠になる公式情報を
              10秒で確認できるデータベースです。
            </p>

            <div className="mt-8 max-w-3xl border border-[var(--border-color)] bg-[var(--page-background-deep)] p-2 shadow-lg">
              <div className="flex min-h-12 items-center gap-3 px-3 text-[var(--text-muted)]">
                <svg
                  aria-hidden="true"
                  className="size-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
                <span className="text-sm sm:text-base">
                  ゲーム名・パブリッシャー名で検索
                </span>
                <span className="ml-auto hidden bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--page-background-deep)] sm:block">
                  近日公開
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--accent-strong)]">掲載準備中</p>
              <h2 className="mt-1 text-balance text-2xl font-bold text-[var(--text-primary)]">
                掲載予定の情報
              </h2>
            </div>
            <p className="hidden text-sm text-[var(--text-muted)] sm:block">
              一次情報を運営が確認して掲載
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {previewGames.map((game) => (
              <article
                key={game.title}
                className="grid grid-cols-[7rem_1fr] overflow-hidden border border-[var(--border-color)] bg-[var(--panel-background)] shadow-md sm:grid-cols-[10rem_1fr]"
              >
                <div className="flex min-h-28 items-center justify-center border-r border-[var(--border-color)] bg-[var(--page-background-deep)] px-4 text-center text-xs text-[var(--text-muted)]">
                  ゲーム画像
                </div>
                <div className="flex min-w-0 flex-col justify-center p-4">
                  <h3 className="truncate font-semibold text-[var(--text-primary)]">
                    {game.title}
                  </h3>
                  <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
                    {game.publisher}
                  </p>
                  <p className="mt-4 text-pretty text-sm text-[var(--status-allowed)]">
                    ● {game.status}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-color)] bg-[var(--page-background-deep)]">
        <div className="mx-auto grid max-w-6xl gap-2 px-4 py-6 text-pretty text-xs leading-5 text-[var(--text-muted)] sm:px-6">
          <p>
            本サービスは参考情報の提供を目的としています。配信前に必ず公式情報をご確認ください。
          </p>
          <p>
            ゲーム情報・画像は
            <a
              href="https://store.steampowered.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-1 text-[var(--accent-strong)] underline underline-offset-2"
            >
              Steam
            </a>
            より取得しています。キョカミルは Valve Corporation
            とは無関係です。
          </p>
        </div>
      </footer>
    </div>
  );
}
