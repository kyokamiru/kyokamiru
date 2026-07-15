import type { Metadata } from "next";
import Link from "next/link";

import { createPageMetadata } from "@/lib/metadata";
import { getPublishers } from "@/lib/queries";

export const metadata: Metadata = createPageMetadata({
  title: "パブリッシャー一覧",
  description: "掲載中のゲームパブリッシャーと包括配信ガイドラインを確認できます。",
  path: "/publishers",
});

export default async function PublishersPage() {
  const publishers = await getPublishers();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-7 border-b border-[var(--border-color)] pb-6">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">発行元から探す</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <h1 className="text-balance text-3xl font-black text-[var(--text-primary)]">パブリッシャー一覧</h1>
          <p className="text-sm tabular-nums text-[var(--text-muted)]">{publishers.length}件</p>
        </div>
      </header>

      {publishers.length > 0 ? (
        <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] bg-[var(--panel-background)]">
          {publishers.map((publisher) => (
            <article key={publisher.id}>
              <Link href={`/publishers/${publisher.slug}`} className="grid gap-3 px-5 py-5 hover:bg-[var(--panel-background-deep)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-[var(--text-primary)]">{publisher.name}</h2>
                  {publisher.name_en && publisher.name_en !== publisher.name ? <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{publisher.name_en}</p> : null}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {publisher.guideline_url ? <span className="text-[var(--status-allowed-text)]">包括ガイドラインあり</span> : <span className="text-[var(--text-muted)]">タイトル別確認</span>}
                  <span className="tabular-nums text-[var(--text-muted)]">{publisher.publishedGameCount}作品</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <section className="border border-[var(--border-color)] bg-[var(--panel-background)] p-8 text-center">
          <h2 className="text-balance text-xl font-bold text-[var(--text-primary)]">パブリッシャー情報を準備しています</h2>
          <Link href="/games" className="mt-4 inline-block text-[var(--accent-strong)] underline underline-offset-4">ゲーム一覧を見る</Link>
        </section>
      )}
    </div>
  );
}
