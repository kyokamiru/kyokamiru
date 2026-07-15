"use client";

import Link from "next/link";
import { useState } from "react";

import { approvalStatusLabels, playModeLabels } from "@/lib/labels";

type FilterValues = {
  q?: string;
  streaming?: string;
  monetization?: string;
  publisher?: string;
  genre?: string;
  mode?: string;
  sort?: string;
};

type PublisherOption = {
  slug: string;
  name: string;
};

type GameFiltersProps = {
  values: FilterValues;
  publishers: PublisherOption[];
  genres: string[];
};

function FilterForm({
  values,
  publishers,
  genres,
  idPrefix,
}: GameFiltersProps & { idPrefix: string }) {
  const [modes, setModes] = useState(() => values.mode?.split(",").filter(Boolean) ?? []);

  return (
    <form action="/games" className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-q`} className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
          キーワード
        </label>
        <input
          id={`${idPrefix}-q`}
          name="q"
          type="search"
          defaultValue={values.q}
          placeholder="ゲーム名・パブリッシャー"
          className="min-h-10 w-full border border-[var(--border-color)] bg-[var(--input-background)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-[var(--text-primary)]">プレイ形式</legend>
        <input type="hidden" name="mode" value={modes.join(",")} />
        <div className="space-y-2">
          {Object.entries(playModeLabels).map(([value, label]) => (
            <label key={value} className="flex min-h-10 items-center gap-3 border border-[var(--border-color)] bg-[var(--input-background)] px-3 py-2 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={modes.includes(value)}
                onChange={() => setModes((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])}
                className="size-4 accent-[var(--accent)]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${idPrefix}-streaming`} className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
          配信可否
        </label>
        <select
          id={`${idPrefix}-streaming`}
          name="streaming"
          defaultValue={values.streaming ?? ""}
          className="min-h-10 w-full border border-[var(--border-color)] bg-[var(--input-background)] px-3 text-sm text-[var(--text-primary)]"
        >
          <option value="">すべて</option>
          {Object.entries(approvalStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-monetization`} className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
          収益化可否
        </label>
        <select
          id={`${idPrefix}-monetization`}
          name="monetization"
          defaultValue={values.monetization ?? ""}
          className="min-h-10 w-full border border-[var(--border-color)] bg-[var(--input-background)] px-3 text-sm text-[var(--text-primary)]"
        >
          <option value="">すべて</option>
          {Object.entries(approvalStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-publisher`} className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
          パブリッシャー
        </label>
        <select
          id={`${idPrefix}-publisher`}
          name="publisher"
          defaultValue={values.publisher ?? ""}
          className="min-h-10 w-full border border-[var(--border-color)] bg-[var(--input-background)] px-3 text-sm text-[var(--text-primary)]"
        >
          <option value="">すべて</option>
          {publishers.map((publisher) => (
            <option key={publisher.slug} value={publisher.slug}>{publisher.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-genre`} className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
          ジャンル
        </label>
        <select
          id={`${idPrefix}-genre`}
          name="genre"
          defaultValue={values.genre ?? ""}
          className="min-h-10 w-full border border-[var(--border-color)] bg-[var(--input-background)] px-3 text-sm text-[var(--text-primary)]"
        >
          <option value="">すべて</option>
          {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-sort`} className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
          並び順
        </label>
        <select
          id={`${idPrefix}-sort`}
          name="sort"
          defaultValue={values.sort ?? "name"}
          className="min-h-10 w-full border border-[var(--border-color)] bg-[var(--input-background)] px-3 text-sm text-[var(--text-primary)]"
        >
          <option value="name">名前順</option>
          <option value="verified">最終確認日順</option>
          <option value="added">追加日順</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button type="submit" className="min-h-10 bg-[var(--accent)] px-4 text-sm font-bold text-[var(--page-background-deep)] hover:bg-[var(--accent-strong)]">
          絞り込む
        </button>
        <Link href="/games" className="flex min-h-10 items-center justify-center border border-[var(--border-color)] px-4 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-muted)] hover:text-white">
          クリア
        </Link>
      </div>
    </form>
  );
}

export function GameFilters(props: GameFiltersProps) {
  return (
    <>
      <details className="border border-[var(--border-color)] bg-[var(--panel-background)] p-4 lg:hidden">
        <summary className="cursor-pointer font-bold text-[var(--text-primary)]">検索条件を開く</summary>
        <div className="mt-5"><FilterForm {...props} idPrefix="mobile-filter" /></div>
      </details>
      <aside className="hidden border border-[var(--border-color)] bg-[var(--panel-background)] p-5 lg:block">
        <h2 className="mb-5 text-balance text-lg font-bold text-[var(--text-primary)]">検索条件</h2>
        <FilterForm {...props} idPrefix="desktop-filter" />
      </aside>
    </>
  );
}
