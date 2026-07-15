import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ad-slot";
import { DisclaimerNote } from "@/components/disclaimer-note";
import { StatusBadge } from "@/components/status-badge";
import { SteamImage } from "@/components/steam-image";
import { approvalStatusLabels, sourceTypeLabels } from "@/lib/labels";
import { createPageMetadata } from "@/lib/metadata";
import { getGameBySlug, getPublishedGameSlugs } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedGameSlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return {
      title: "ゲームが見つかりません",
      robots: { index: false, follow: false },
    };
  }

  const streamingLabel = approvalStatusLabels[game.effectiveStreamingStatus.status];
  const monetizationLabel = approvalStatusLabels[game.effectiveMonetizationStatus.status];

  return createPageMetadata({
    title: `${game.title}は配信・収益化していい？ガイドラインまとめ`,
    description: `${game.title}の配信可否は「${streamingLabel}」、収益化可否は「${monetizationLabel}」です。判断の根拠となる公式情報と最終確認日を確認できます。`,
    path: `/games/${game.slug}`,
  });
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) notFound();

  const sources = [...game.sources].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const steamUrl = game.steam_app_id
    ? `https://store.steampowered.com/app/${game.steam_app_id}`
    : null;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    ...(game.title_en && game.title_en !== game.title
      ? { alternateName: game.title_en }
      : {}),
    url: absoluteUrl(`/games/${game.slug}`),
    ...(game.header_image_url ? { image: game.header_image_url } : {}),
    ...(game.release_date ? { datePublished: game.release_date } : {}),
    ...(game.genres.length > 0 ? { genre: game.genres } : {}),
    publisher: {
      "@type": "Organization",
      name: game.publisher.name,
      ...(game.publisher.official_site_url
        ? { url: game.publisher.official_site_url }
        : {}),
    },
    ...(steamUrl ? { sameAs: steamUrl } : {}),
    inLanguage: "ja",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
        }}
      />
      <nav aria-label="パンくず" className="mb-5 text-sm text-[var(--text-muted)]">
        <Link href={`/publishers/${game.publisher.slug}`} className="text-[var(--accent-strong)] hover:text-white">{game.publisher.name}</Link>
        <span aria-hidden="true" className="mx-2">›</span>
        <span>{game.title}</span>
      </nav>

      <header className="border border-[var(--border-color)] bg-[var(--panel-background)] shadow-lg">
        <div className="border-b border-[var(--border-color)] bg-[var(--panel-background-deep)] px-5 py-4">
          <h1 className="text-balance text-2xl font-black text-[var(--text-primary)] sm:text-3xl">{game.title}</h1>
          {game.title_en && game.title_en !== game.title ? <p className="mt-1 text-sm text-[var(--text-muted)]">{game.title_en}</p> : null}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.75fr)]">
          <div className="border-b border-[var(--border-color)] lg:border-r lg:border-b-0">
            <SteamImage src={game.header_image_url} alt={`${game.title}のSteamヘッダー画像`} eager className="h-full w-full" />
          </div>
          <aside className="bg-[var(--panel-background-deep)] p-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              <div>
                <p className="mb-2 text-sm font-semibold text-[var(--text-muted)]">配信可否</p>
                <StatusBadge kind="approval" value={game.effectiveStreamingStatus.status} size="large" />
                {game.effectiveStreamingStatus.inheritedFromPublisher ? <p className="mt-2 text-pretty text-xs leading-5 text-[var(--accent-strong)]">パブリッシャー包括ガイドラインに準拠</p> : null}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-[var(--text-muted)]">収益化可否</p>
                <StatusBadge kind="approval" value={game.effectiveMonetizationStatus.status} size="large" />
                {game.effectiveMonetizationStatus.inheritedFromPublisher ? <p className="mt-2 text-pretty text-xs leading-5 text-[var(--accent-strong)]">パブリッシャー包括ガイドラインに準拠</p> : null}
              </div>
            </div>
            <div className="mt-5 border-t border-[var(--border-color)] pt-4 text-sm leading-6 text-[var(--text-muted)]">
              <p className="tabular-nums">運営最終確認日: {formatDate(game.last_verified_at)}</p>
              <a href="#sources" className="text-[var(--accent-strong)] underline underline-offset-4">根拠情報を見る（{sources.length}件）</a>
            </div>
          </aside>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="space-y-6">
          <section className="border border-[var(--border-color)] bg-[var(--panel-background)]">
            <h2 className="border-b border-[var(--border-color)] bg-[var(--panel-background-deep)] px-5 py-3 text-balance text-lg font-bold text-[var(--text-primary)]">許諾情報の詳細</h2>
            <dl className="divide-y divide-[var(--border-color)]">
              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:items-center"><dt className="font-semibold text-[var(--text-secondary)]">ネタバレ制限</dt><dd><StatusBadge kind="spoiler" value={game.spoiler_restriction} /></dd></div>
              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:items-center"><dt className="font-semibold text-[var(--text-secondary)]">音楽・BGM</dt><dd><StatusBadge kind="music" value={game.music_restriction} /></dd></div>
              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:items-center"><dt className="font-semibold text-[var(--text-secondary)]">切り抜き・アーカイブ</dt><dd><StatusBadge kind="approval" value={game.clip_archive_status} /></dd></div>
              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:items-center"><dt className="font-semibold text-[var(--text-secondary)]">事前申請</dt><dd><StatusBadge kind="application" value={game.prior_application} /></dd></div>
            </dl>
          </section>

          {game.notes ? (
            <section className="border border-[var(--border-color)] bg-[var(--panel-background)] p-5">
              <h2 className="text-balance text-lg font-bold text-[var(--text-primary)]">条件・注意事項</h2>
              <p className="mt-3 whitespace-pre-line text-pretty text-sm leading-7 text-[var(--text-secondary)]">{game.notes}</p>
            </section>
          ) : null}

          <section id="sources" className="scroll-mt-6 border border-[var(--border-color)] bg-[var(--panel-background)] p-5">
            <h2 className="text-balance text-lg font-bold text-[var(--text-primary)]">判断の根拠</h2>
            <ul className="mt-4 space-y-3">
              {sources.map((source) => (
                <li key={source.id} className="border-l-2 border-[var(--accent-muted)] pl-4">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--accent-strong)] underline underline-offset-4">{source.label || sourceTypeLabels[source.source_type]}</a>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{sourceTypeLabels[source.source_type]}{source.noted_at ? `・情報日 ${formatDate(source.noted_at)}` : ""}</p>
                </li>
              ))}
            </ul>
          </section>

          <DisclaimerNote sources={sources} />
          <AdSlot />
        </div>

        <aside className="border border-[var(--border-color)] bg-[var(--panel-background)] p-5 text-sm">
          <h2 className="text-balance font-bold text-[var(--text-primary)]">基本情報</h2>
          <dl className="mt-4 space-y-4 text-[var(--text-muted)]">
            <div><dt className="text-xs">パブリッシャー</dt><dd className="mt-1"><Link href={`/publishers/${game.publisher.slug}`} className="text-[var(--accent-strong)]">{game.publisher.name}</Link></dd></div>
            <div><dt className="text-xs">発売日</dt><dd className="mt-1 tabular-nums text-[var(--text-secondary)]">{formatDate(game.release_date)}</dd></div>
            <div><dt className="text-xs">ジャンル</dt><dd className="mt-1 flex flex-wrap gap-2 text-[var(--text-secondary)]">{game.genres.map((genre) => <span key={genre}>{genre}</span>)}</dd></div>
          </dl>
          {steamUrl ? (
            <a href={steamUrl} target="_blank" rel="noopener noreferrer" className="mt-6 flex min-h-10 items-center justify-center border border-[var(--accent-muted)] px-4 font-bold text-[var(--accent-strong)] hover:border-[var(--accent)] hover:text-white">Steam で見る</a>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
