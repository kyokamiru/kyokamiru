import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-semibold tabular-nums text-[var(--accent-strong)]">404</p>
      <h1 className="mt-2 text-balance text-3xl font-black text-[var(--text-primary)]">ページが見つかりません</h1>
      <p className="mt-4 text-pretty text-sm leading-6 text-[var(--text-muted)]">URLが変更されたか、ゲームがまだ公開されていない可能性があります。</p>
      <Link href="/games" className="mt-6 inline-flex min-h-10 items-center bg-[var(--accent)] px-5 text-sm font-bold text-[var(--page-background-deep)]">ゲームを検索する</Link>
    </section>
  );
}
