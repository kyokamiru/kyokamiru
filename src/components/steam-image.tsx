"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type SteamImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
};

export function SteamImage({
  src,
  alt,
  className,
  eager = false,
}: SteamImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt}の画像はありません`}
        className={cn(
          "flex aspect-[460/215] items-center justify-center bg-[var(--image-fallback)] px-4 text-center text-sm text-[var(--text-muted)]",
          className,
        )}
      >
        <span className="line-clamp-2 text-pretty">{alt}</span>
      </div>
    );
  }

  return (
    // Steam CDN must be hotlinked directly; server-side image optimization is prohibited.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={460}
      height={215}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={cn("aspect-[460/215] object-cover", className)}
    />
  );
}
