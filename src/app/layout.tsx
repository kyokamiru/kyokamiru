import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "キョカミル | ゲーム配信ガイドラインDB",
  description:
    "ゲームの配信可否・収益化可否と、その根拠となる公式情報を確認できるデータベースです。",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
