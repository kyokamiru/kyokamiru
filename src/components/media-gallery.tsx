"use client";

import { useState } from "react";

import { SteamImage } from "@/components/steam-image";

type MediaItem =
  | { type: "movie"; url: string; thumbnail: string | null }
  | { type: "image"; url: string };

export function MediaGallery({
  title,
  headerImageUrl,
  screenshots,
  movieUrl,
  movieThumbnailUrl,
}: {
  title: string;
  headerImageUrl: string | null;
  screenshots: string[];
  movieUrl: string | null;
  movieThumbnailUrl: string | null;
}) {
  const items: MediaItem[] = [
    ...(movieUrl ? [{ type: "movie" as const, url: movieUrl, thumbnail: movieThumbnailUrl }] : []),
    ...screenshots.slice(0, 6).map((url) => ({ type: "image" as const, url })),
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex];

  if (!active) {
    return <SteamImage src={headerImageUrl} alt={`${title}のSteamヘッダー画像`} eager className="aspect-video w-full" />;
  }

  return (
    <div className="bg-[var(--page-background-deep)]">
      {active.type === "movie" ? (
        <video key={active.url} controls preload="none" poster={active.thumbnail ?? undefined} className="aspect-video w-full bg-black object-contain" aria-label={`${title}のSteamムービー`}>
          <source src={active.url} type={active.url.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4"} />
          お使いのブラウザーでは動画を再生できません。
        </video>
      ) : (
        <SteamImage src={active.url} alt={`${title}のSteamスクリーンショット ${activeIndex + 1}`} eager className="aspect-video w-full object-contain" />
      )}

      {items.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto border-t border-[var(--border-color)] p-2" aria-label="メディアを選択">
          {items.map((item, index) => (
            <button key={`${item.type}-${item.url}`} type="button" aria-label={item.type === "movie" ? "ムービーを表示" : `スクリーンショット ${index + 1}を表示`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => setActiveIndex(index)} className={`relative w-28 shrink-0 border p-0.5 ${index === activeIndex ? "border-[var(--accent-strong)]" : "border-[var(--border-color)]"}`}>
              {item.type === "movie" ? (
                <>
                  {item.thumbnail ? <SteamImage src={item.thumbnail} alt="ムービーのサムネイル" className="aspect-video w-full" /> : <span className="flex aspect-video items-center justify-center bg-black text-xs text-white">動画</span>}
                  <span aria-hidden="true" className="absolute inset-0 m-auto flex size-8 items-center justify-center border border-white bg-[color:rgb(17_26_38_/_0.85)] text-white">▶</span>
                </>
              ) : <SteamImage src={item.url} alt="" className="aspect-video w-full" />}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
