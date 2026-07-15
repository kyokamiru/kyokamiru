import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";

import { AdSlot } from "@/components/ad-slot";
import { GameFilters } from "@/components/game-filters";
import { GameListRow } from "@/components/game-list-row";
import { Pagination } from "@/components/pagination";
import { createPageMetadata } from "@/lib/metadata";
import { getGameGenres, getGames, getPublishers } from "@/lib/queries";
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

export default async function GamesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams;
  const q = valueOf(raw.q);
  const streaming = valueOf(raw.streaming);
  const monetization = valueOf(raw.monetization);
  const publisher = valueOf(raw.publisher);
  const genre = valueOf(raw.genre);
  const sort = valueOf(raw.sort);
  const requestedPage = Number(valueOf(raw.page));

  const [result, publishers, genres] = await Promise.all([
    getGames({
      q,
      streaming: approvalValue(streaming),
      monetization: approvalValue(monetization),
      publisher,
      genre,
      sort: sort === "verified" || sort === "added" ? sort : "name",
      page: requestedPage,
    }),
    getPublishers(),
    getGameGenres(),
  ]);

  const filterValues = { q, streaming, monetization, publisher, genre, sort };

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
            searchParams={{ q, streaming, monetization, publisher, genre, sort }}
          />
        </div>
      </div>
    </div>
  );
}
