import type { Metadata } from "next";
import Link from "next/link";

import { GameCapsule } from "@/components/game-capsule";
import { HeroCarousel } from "@/components/hero-carousel";
import { StatusBadge } from "@/components/status-badge";
import { getGameGenres, getNewGames, getRecentlyVerifiedGames } from "@/lib/queries";
import { createPageMetadata } from "@/lib/metadata";
import { playModeLabels } from "@/lib/labels";

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
  const [heroGames, newGames, recentlyVerifiedGames, genres] = await Promise.all([
    getNewGames(5),
    getNewGames(8),
    getRecentlyVerifiedGames(8),
    getGameGenres(),
  ]);

  return (
    <>
      <section className="border-b border-[var(--border-color)] bg-[var(--panel-background-muted)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <p className="mb-3 text-sm font-bold text-[var(--accent-strong)]">このゲーム、収益化配信して大丈夫？</p>
          <HeroCarousel games={heroGames} />
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
          <div className="mt-8 grid gap-6 border-t border-[var(--border-color)] pt-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">ジャンルから探す</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {genres.slice(0, 8).map((genre) => <Link key={genre} href={`/games?genre=${encodeURIComponent(genre)}`} className="border border-[var(--border-color)] bg-[var(--panel-background)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-muted)] hover:text-white">{genre}</Link>)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">プレイ形式から探す</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(playModeLabels).map(([mode, label]) => <Link key={mode} href={`/games?mode=${mode}`} className="border border-[var(--border-color)] bg-[var(--panel-background)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-muted)] hover:text-white">{label}</Link>)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
