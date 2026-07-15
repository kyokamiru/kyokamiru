import Link from "next/link";

import { formatDate } from "@/lib/utils";

import type { PublicGameSummary } from "./game-types";
import { SourceLink } from "./source-link";
import { StatusBadge } from "./status-badge";
import { SteamImage } from "./steam-image";

export function GameCapsule({ game }: { game: PublicGameSummary }) {
  return (
    <article className="group min-w-0 border border-[var(--border-color)] bg-[var(--panel-background)] shadow-md hover:border-[var(--accent-muted)]">
      <Link href={`/games/${game.slug}`} className="block no-underline">
        <SteamImage
          src={game.header_image_url}
          alt={`${game.title}のSteamカプセル画像`}
          className="w-full border-b border-[var(--border-color)]"
        />
      </Link>
      <div className="p-4">
        <h3 className="truncate font-bold">
          <Link href={`/games/${game.slug}`} className="text-[var(--text-primary)] group-hover:text-[var(--accent-strong)]">
            {game.title}
          </Link>
        </h3>
        <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
          {game.publisher.name}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge kind="approval" value={game.streaming_status} />
          <StatusBadge kind="approval" value={game.monetization_status} />
        </div>
        <div className="mt-3 border-t border-[var(--border-color)] pt-3 text-xs leading-5 text-[var(--text-muted)]">
          <p className="tabular-nums">最終確認 {formatDate(game.last_verified_at)}</p>
          <div className="mt-1">
            <SourceLink sources={game.sources} />
          </div>
        </div>
      </div>
    </article>
  );
}
