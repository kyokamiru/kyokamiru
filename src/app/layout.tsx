import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { getSiteUrl, SITE_DESCRIPTION } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "キョカミル | ゲーム配信ガイドラインDB",
    template: "%s | キョカミル",
  },
  description: SITE_DESCRIPTION,
  applicationName: "キョカミル",
  category: "ゲーム",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#1b2838",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
