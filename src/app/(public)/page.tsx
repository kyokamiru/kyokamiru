import type { Metadata } from "next";
import Link from "next/link";

import { GameCapsule } from "@/components/game-capsule";
import { StatusBadge } from "@/components/status-badge";
import { getNewGames, getRecentlyVerifiedGames } from "@/lib/queries";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "ゲーム配信ガイドラインDB",
  description: "ゲームの配信可否・収益化可否と、判断の根拠になる公式情報を10秒で確認できます。",
  path: "/",
});

export const revalidate = 3600;

function GameSection({
  eyebrow,
  title,
  games,
}: {
  eyebrow: string;
  title: string;
  games: Awaited<ReturnType<typeof getNewGames>>;
}) {
  return (
    <section className="py-9 sm:py-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--accent-strong)]">{eyebrow}</p>
          <h2 className="mt-1 text-balance text-2xl font-black text-[var(--text-primary)]">{title}</h2>
        </div>
        <Link href="/games" className="text-sm text-[var(--accent-strong)] underline underline-offset-4">すべて見る</Link>
      </div>
      {games.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game) => <GameCapsule key={game.id} game={game} />)}
        </div>
      ) : (
        <div className="border border-[var(--border-color)] bg-[var(--panel-background)] p-6 text-pretty text-sm text-[var(--text-muted)]">
          掲載ゲームを準備しています。<Link href="/contact" className="ml-1 text-[var(--accent-strong)] underline underline-offset-4">掲載リクエストはこちら</Link>
        </div>
      )}
    </section>
  );
}

export default async function HomePage() {
  const [newGames, recentlyVerifiedGames] = await Promise.all([
    getNewGames(8),
    getRecentlyVerifiedGames(8),
  ]);

  return (
    <>
      <section className="border-b border-[var(--border-color)] bg-[var(--panel-background-muted)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-4xl border-l-4 border-[var(--accent)] pl-5 sm:pl-7">
            <p className="text-sm font-bold text-[var(--accent-strong)]">配信ガイドラインデータベース</p>
            <h1 className="mt-3 text-balance text-3xl font-black leading-tight text-[var(--text-primary)] sm:text-5xl">
              このゲーム、<span className="whitespace-nowrap">収益化配信して</span>大丈夫？
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
              配信可否・収益化可否と、その判断の根拠になる公式情報を10秒で確認できます。
            </p>
          </div>

          <form action="/games" className="mt-8 flex max-w-4xl border border-[var(--border-color)] bg-[var(--page-background-deep)] p-2 shadow-lg">
            <label htmlFor="hero-search" className="sr-only">ゲーム名・パブリッシャー名で検索</label>
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="ゲーム名・パブリッシャー名を入力"
              className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
            <button type="submit" className="min-h-12 bg-[var(--accent)] px-5 font-bold text-[var(--page-background-deep)] hover:bg-[var(--accent-strong)] sm:px-8">
              検索
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl divide-y divide-[var(--border-color)] px-4 sm:px-6 lg:px-8">
        <GameSection eyebrow="新しく追加" title="新着ゲーム" games={newGames} />
        <GameSection eyebrow="確認情報を更新" title="最近確認したゲーム" games={recentlyVerifiedGames} />

        <section className="py-9 sm:py-12">
          <p className="text-sm font-semibold text-[var(--accent-strong)]">可否表示について</p>
          <h2 className="mt-1 text-balance text-2xl font-black text-[var(--text-primary)]">情報の見方</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([
              ["allowed", "公式情報で許可を確認"],
              ["conditional", "条件・注意事項あり"],
              ["prohibited", "配信または収益化不可"],
              ["unknown", "公式情報で判断できない"],
            ] as const).map(([status, description]) => (
              <div key={status} className="border border-[var(--border-color)] bg-[var(--panel-background)] p-4">
                <StatusBadge kind="approval" value={status} />
                <p className="mt-3 text-pretty text-sm leading-6 text-[var(--text-muted)]">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
