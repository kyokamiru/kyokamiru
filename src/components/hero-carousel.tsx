"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { PublicGameSummary } from "@/components/game-types";
import { StatusBadge } from "@/components/status-badge";
import { SteamImage } from "@/components/steam-image";

export function HeroCarousel({ games }: { games: PublicGameSummary[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const multiple = games.length > 1;

  useEffect(() => {
    if (!multiple || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % games.length);
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [games.length, multiple, paused]);

  if (!games.length) {
    return (
      <div className="flex min-h-64 items-center justify-center border border-[var(--border-color)] bg-[var(--panel-background)] px-6 text-center text-sm text-[var(--text-muted)]">
        注目ゲームを準備しています。
      </div>
    );
  }

  const game = games[activeIndex] ?? games[0];

  return (
    <section
      aria-roledescription="カルーセル"
      aria-label="新着ゲーム"
      className="relative border border-[var(--border-color)] bg-[var(--page-background-deep)] shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <Link href={`/games/${game.slug}`} className="block no-underline">
        <SteamImage src={game.header_image_url} alt={`${game.title}のSteamヘッダー画像`} eager className="aspect-[16/7] max-h-[34rem] w-full" />
        <div className="border-t border-[var(--border-color)] bg-[color:rgb(17_26_38_/_0.94)] p-4 sm:absolute sm:inset-x-0 sm:bottom-0 sm:border-t sm:px-6 sm:py-5">
          <p className="text-xs font-semibold text-[var(--accent-strong)]">NEW GAME {activeIndex + 1} / {games.length}</p>
          <h1 className="mt-1 max-w-3xl text-balance text-2xl font-black text-[var(--text-primary)] sm:text-4xl">{game.title}</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{game.publisher.name}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">配信 <StatusBadge kind="approval" value={game.streaming_status} /></span>
            <span className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">収益化 <StatusBadge kind="approval" value={game.monetization_status} /></span>
          </div>
        </div>
      </Link>

      {multiple ? (
        <>
          <button type="button" aria-label="前のゲーム" onClick={() => setActiveIndex((activeIndex - 1 + games.length) % games.length)} className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center border border-[var(--border-color)] bg-[color:rgb(17_26_38_/_0.92)] text-2xl text-white hover:border-[var(--accent)]">‹</button>
          <button type="button" aria-label="次のゲーム" onClick={() => setActiveIndex((activeIndex + 1) % games.length)} className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center border border-[var(--border-color)] bg-[color:rgb(17_26_38_/_0.92)] text-2xl text-white hover:border-[var(--accent)]">›</button>
          <div className="absolute top-3 right-3 flex gap-2 bg-[color:rgb(17_26_38_/_0.88)] p-2" aria-label="ゲームを選択">
            {games.map((item, index) => (
              <button key={item.id} type="button" aria-label={`${item.title}を表示`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => setActiveIndex(index)} className={`size-2.5 border ${index === activeIndex ? "border-[var(--accent-strong)] bg-[var(--accent-strong)]" : "border-[var(--text-muted)] bg-transparent"}`} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
