import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";

import { AdSlot } from "@/components/ad-slot";
import { GameFilters } from "@/components/game-filters";
import { GameListRow } from "@/components/game-list-row";
import { Pagination } from "@/components/pagination";
import { createPageMetadata } from "@/lib/metadata";
import { getGameGenres, getGames, getPublishers } from "@/lib/queries";
import { playModeLabels, type PlayMode } from "@/lib/labels";
import type { Database } from "@/types/database";

export const metadata: Metadata = createPageMetadata({
  title: "ゲーム一覧・検索",
  description: "ゲーム名やパブリッシャー、配信可否、収益化可否から配信ガイドラインを検索できます。",
  path: "/games",
});

type SearchParams = Record<string, string | string[] | undefined>;
type ApprovalStatus = Database["public"]["Enums"]["approval_status"];

function valueOf(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function approvalValue(value: string | undefined): ApprovalStatus | undefined {
  return ["allowed", "conditional", "prohibited", "unknown"].includes(value ?? "")
    ? (value as ApprovalStatus)
    : undefined;
}

function modeValues(value: string | string[] | undefined) {
  const values = (Array.isArray(value) ? value : [value]).flatMap((item) => item?.split(",") ?? []);
  return [...new Set(values)].filter((mode): mode is PlayMode => mode in playModeLabels);
}

function filterHref(values: Record<string, string | undefined>, changes: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries({ ...values, ...changes }).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `/games?${query}` : "/games";
}

export default async function GamesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams;
  const q = valueOf(raw.q);
  const streaming = valueOf(raw.streaming);
  const monetization = valueOf(raw.monetization);
  const publisher = valueOf(raw.publisher);
  const genre = valueOf(raw.genre);
  const modes = modeValues(raw.mode);
  const mode = modes.join(",") || undefined;
  const sort = valueOf(raw.sort);
  const requestedPage = Number(valueOf(raw.page));

  const [result, publishers, genres] = await Promise.all([
    getGames({
      q,
      streaming: approvalValue(streaming),
      monetization: approvalValue(monetization),
      publisher,
      genre,
      modes,
      sort: sort === "verified" || sort === "added" ? sort : "name",
      page: requestedPage,
    }),
    getPublishers(),
    getGameGenres(),
  ]);

  const filterValues = { q, streaming, monetization, publisher, genre, mode, sort };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-7 border-b border-[var(--border-color)] pb-6">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">ゲームを探す</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-balance text-3xl font-black text-[var(--text-primary)]">ゲーム一覧</h1>
          <p className="text-sm tabular-nums text-[var(--text-muted)]">{result.count}件</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="lg:order-2">
          <GameFilters values={filterValues} publishers={publishers} genres={genres} />
        </div>

        <div className="min-w-0 lg:order-1">
          {genre || modes.length ? (
            <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="選択中の絞り込み">
              <span className="text-xs font-semibold text-[var(--text-muted)]">選択中</span>
              {genre ? (
                <Link href={filterHref(filterValues, { genre: undefined })} className="inline-flex min-h-8 items-center border border-[var(--accent-muted)] bg-[var(--panel-background-deep)] px-3 text-xs text-[var(--accent-strong)]">
                  ジャンル: {genre}<span aria-hidden="true" className="ml-2">×</span>
                </Link>
              ) : null}
              {modes.map((selectedMode) => (
                <Link
                  key={selectedMode}
                  href={filterHref(filterValues, { mode: modes.filter((item) => item !== selectedMode).join(",") || undefined })}
                  className="inline-flex min-h-8 items-center border border-[var(--accent-muted)] bg-[var(--panel-background-deep)] px-3 text-xs text-[var(--accent-strong)]"
                >
                  {playModeLabels[selectedMode]}<span aria-hidden="true" className="ml-2">×</span>
                </Link>
              ))}
            </div>
          ) : null}
          {result.games.length > 0 ? (
            <div className="space-y-3">
              {result.games.map((game, index) => (
                <Fragment key={game.id}>
                  <GameListRow game={game} />
                  {index === 7 && result.games.length > 8 ? <AdSlot /> : null}
                </Fragment>
              ))}
            </div>
          ) : (
            <section className="border border-[var(--border-color)] bg-[var(--panel-background)] p-8 text-center">
              <h2 className="text-balance text-xl font-bold text-[var(--text-primary)]">見つかりませんでした</h2>
              <p className="mt-2 text-pretty text-sm leading-6 text-[var(--text-muted)]">条件を変更するか、未掲載ゲームのリクエストをお送りください。</p>
              <Link href="/contact" className="mt-5 inline-flex min-h-10 items-center bg-[var(--accent)] px-5 text-sm font-bold text-[var(--page-background-deep)]">掲載リクエストはこちら</Link>
            </section>
          )}

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            searchParams={{ q, streaming, monetization, publisher, genre, mode, sort }}
          />
        </div>
      </div>
    </div>
  );
}
