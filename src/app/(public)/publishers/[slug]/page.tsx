import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GameListRow } from "@/components/game-list-row";
import { createPageMetadata } from "@/lib/metadata";
import { getPublisherBySlug, getPublisherSlugs } from "@/lib/queries";

export const revalidate = 3600;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublisherSlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const publisher = await getPublisherBySlug(slug);

  if (!publisher) {
    return {
      title: "パブリッシャーが見つかりません",
      robots: { index: false, follow: false },
    };
  }

  return createPageMetadata({
    title: `${publisher.name}の配信ガイドライン`,
    description: `${publisher.name}の包括配信ガイドラインと、掲載ゲームの配信可否・収益化可否を確認できます。`,
    path: `/publishers/${publisher.slug}`,
  });
}

export default async function PublisherDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const publisher = await getPublisherBySlug(slug);

  if (!publisher) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="パンくず" className="mb-5 text-sm text-[var(--text-muted)]">
        <Link href="/publishers" className="text-[var(--accent-strong)]">パブリッシャー</Link>
        <span aria-hidden="true" className="mx-2">›</span>
        <span>{publisher.name}</span>
      </nav>

      <header className="border border-[var(--border-color)] bg-[var(--panel-background)] shadow-md">
        <div className="border-b border-[var(--border-color)] bg-[var(--panel-background-deep)] px-6 py-5">
          <h1 className="text-balance text-3xl font-black text-[var(--text-primary)]">{publisher.name}</h1>
          {publisher.name_en && publisher.name_en !== publisher.name ? <p className="mt-1 text-sm text-[var(--text-muted)]">{publisher.name_en}</p> : null}
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div>
            <h2 className="text-balance text-lg font-bold text-[var(--text-primary)]">包括ガイドライン</h2>
            {publisher.guideline_summary ? <p className="mt-3 max-w-3xl whitespace-pre-line text-pretty text-sm leading-7 text-[var(--text-secondary)]">{publisher.guideline_summary}</p> : <p className="mt-3 text-sm text-[var(--text-muted)]">包括ガイドラインは確認できていません。タイトルごとの根拠情報をご確認ください。</p>}
            <p className="mt-3 text-pretty text-xs leading-5 text-[var(--text-muted)]">既定の可否判定は、各ゲーム詳細ページで根拠URLと最終確認日を併記して表示します。</p>
          </div>
          <div className="flex flex-col gap-3">
            {publisher.guideline_url ? <a href={publisher.guideline_url} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center justify-center border border-[var(--accent-muted)] px-4 text-sm font-bold text-[var(--accent-strong)] hover:border-[var(--accent)] hover:text-white">公式ガイドラインを見る</a> : null}
            {publisher.official_site_url ? <a href={publisher.official_site_url} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center justify-center border border-[var(--border-color)] px-4 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-muted)] hover:text-white">公式サイトを見る</a> : null}
          </div>
        </div>
      </header>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-balance text-2xl font-black text-[var(--text-primary)]">掲載ゲーム</h2>
          <p className="text-sm tabular-nums text-[var(--text-muted)]">{publisher.games.length}件</p>
        </div>
        {publisher.games.length > 0 ? (
          <div className="space-y-3">{publisher.games.map((game) => <GameListRow key={game.id} game={{ ...game, publisher: { id: publisher.id, slug: publisher.slug, name: publisher.name, name_en: publisher.name_en } }} />)}</div>
        ) : (
          <div className="border border-[var(--border-color)] bg-[var(--panel-background)] p-7 text-center text-sm text-[var(--text-muted)]">公開中のゲームはありません。</div>
        )}
      </section>
    </div>
  );
}
