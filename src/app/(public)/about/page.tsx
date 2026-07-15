import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "このサイトについて",
  description: "キョカミルの運営方針と、配信可否・収益化可否の表示の見方をご案内します。",
  path: "/about",
});

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-[var(--border-color)] pb-6">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">キョカミルについて</p>
        <h1 className="mt-1 text-balance text-3xl font-black text-[var(--text-primary)]">配信前の確認を、10秒で</h1>
        <p className="mt-4 max-w-2xl text-pretty leading-7 text-[var(--text-secondary)]">海外ゲームを中心に、配信可否・収益化可否と根拠となる公式情報を日本語で整理するデータベースです。</p>
      </header>

      <div className="mt-8 space-y-8">
        <section className="border border-[var(--border-color)] bg-[var(--panel-background)] p-6">
          <h2 className="text-balance text-xl font-bold text-[var(--text-primary)]">運営方針</h2>
          <ul className="mt-4 list-inside list-disc space-y-3 text-pretty text-sm leading-6 text-[var(--text-secondary)]">
            <li>公式ガイドライン、EULA、公式FAQなどの一次情報を運営が確認します。</li>
            <li>ガイドライン本文は転載せず、要点の要約と公式リンクを掲載します。</li>
            <li>広告掲載の有無は、ゲームの可否判定に一切影響しません。</li>
            <li>情報は定期的に再確認し、各ゲームに最終確認日を表示します。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-balance text-xl font-bold text-[var(--text-primary)]">可否表示の見方</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {([[
              "allowed", "公式情報で許可が確認できた状態です。"
            ], [
              "conditional", "禁止範囲や収益化方法などの条件があります。"
            ], [
              "prohibited", "公式情報で不可とされている状態です。"
            ], [
              "unknown", "公式情報だけでは判断できない状態です。"
            ]] as const).map(([value, text]) => (
              <div key={value} className="border border-[var(--border-color)] bg-[var(--panel-background)] p-5">
                <StatusBadge kind="approval" value={value} />
                <p className="mt-3 text-pretty text-sm leading-6 text-[var(--text-muted)]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-pretty text-sm leading-6 text-[var(--text-muted)]">本サービスの情報は参考情報です。詳しくは<Link href="/terms" className="mx-1 text-[var(--accent-strong)] underline underline-offset-4">免責事項・利用規約</Link>をご確認ください。</p>
      </div>
    </article>
  );
}
