import type { Metadata } from "next";

import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

type PageMetadataOptions = {
  title: string;
  description?: string;
  path: string;
};

export function createPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = absoluteUrl(path);
  const socialTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      url: canonicalUrl,
      images: [
        {
          url: absoluteUrl("/og-image.png"),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} - ゲーム配信ガイドラインDB`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [absoluteUrl("/og-image.png")],
    },
  };
}
