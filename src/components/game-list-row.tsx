import Link from "next/link";

import { formatDate } from "@/lib/utils";

import type { PublicGameSummary } from "./game-types";
import { SourceLink } from "./source-link";
import { StatusBadge } from "./status-badge";
import { SteamImage } from "./steam-image";

export function GameListRow({ game }: { game: PublicGameSummary }) {
  return (
    <article className="group border border-[var(--border-color)] bg-[var(--panel-background)] shadow-sm hover:border-[var(--accent-muted)]">
      <div className="grid min-w-0 sm:grid-cols-[13rem_minmax(0,1fr)_13rem]">
        <Link href={`/games/${game.slug}`} className="block no-underline">
          <SteamImage
            src={game.header_image_url}
            alt={`${game.title}のSteamカプセル画像`}
            className="h-full w-full border-b border-[var(--border-color)] sm:border-r sm:border-b-0"
          />
        </Link>

        <div className="min-w-0 p-4">
          <h2 className="truncate text-balance text-lg font-bold">
            <Link href={`/games/${game.slug}`} className="text-[var(--text-primary)] group-hover:text-[var(--accent-strong)]">
              {game.title}
            </Link>
          </h2>
          {game.title_en && game.title_en !== game.title ? (
            <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
              {game.title_en}
            </p>
          ) : null}
          <p className="mt-3 truncate text-sm text-[var(--text-secondary)]">
            {game.publisher.name}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
            {game.release_date ? (
              <span className="tabular-nums">発売日 {formatDate(game.release_date)}</span>
            ) : null}
            {game.genres?.slice(0, 2).map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] bg-[var(--panel-background-deep)] p-4 sm:border-t-0 sm:border-l">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            <div>
              <p className="mb-1 text-xs text-[var(--text-muted)]">配信</p>
              <StatusBadge kind="approval" value={game.streaming_status} />
            </div>
            <div>
              <p className="mb-1 text-xs text-[var(--text-muted)]">収益化</p>
              <StatusBadge kind="approval" value={game.monetization_status} />
            </div>
          </div>
          <div className="mt-4 border-t border-[var(--border-color)] pt-3 text-xs leading-5 text-[var(--text-muted)]">
            <p className="tabular-nums">最終確認 {formatDate(game.last_verified_at)}</p>
            <div className="mt-1">
              <SourceLink sources={game.sources} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
