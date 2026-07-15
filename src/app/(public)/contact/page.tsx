import type { Metadata } from "next";
import Link from "next/link";

import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "お問い合わせ",
  description: "未掲載ゲームのリクエストや、掲載情報の修正依頼についてご案内します。",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-[var(--border-color)] pb-6">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">掲載リクエスト・情報修正</p>
        <h1 className="mt-1 text-balance text-3xl font-black text-[var(--text-primary)]">お問い合わせ</h1>
        <p className="mt-4 text-pretty leading-7 text-[var(--text-secondary)]">未掲載ゲームのリクエストや、掲載情報の修正依頼を受け付けています。</p>
      </header>

      <section className="mt-8 border border-[var(--border-color)] bg-[var(--panel-background)] p-6">
        <h2 className="text-balance text-xl font-bold text-[var(--text-primary)]">お問い合わせ方法</h2>
        <p className="mt-3 text-pretty text-sm leading-7 text-[var(--text-secondary)]">現在、お問い合わせ窓口を準備しています。公開までは、ゲーム一覧から現在の掲載状況をご確認ください。</p>
        <Link href="/games" className="mt-5 inline-flex min-h-10 items-center bg-[var(--accent)] px-5 text-sm font-bold text-[var(--page-background-deep)]">ゲーム一覧を見る</Link>
      </section>
    </article>
  );
}
