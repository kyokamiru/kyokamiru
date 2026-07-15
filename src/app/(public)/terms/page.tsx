import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "免責事項・利用規約",
  description: "キョカミルの情報の性質、免責事項、著作権、広告と編集の独立性についてご案内します。",
  path: "/terms",
});

const sections = [
  { title: "情報の性質", body: "キョカミルが掲載する情報は参考情報であり、法的助言ではありません。配信・動画投稿を行う前に、必ず掲載先の公式情報をご自身で確認してください。" },
  { title: "正確性と更新", body: "情報の正確性と鮮度の維持に努めますが、ガイドラインの変更や解釈の相違を完全に防ぐことはできません。本サービスの利用によって生じた損害について、運営は責任を負いません。" },
  { title: "著作権", body: "公式ガイドラインやEULAの本文は転載せず、運営が作成した要約とリンクを掲載します。ゲーム画像の著作権は各権利者に帰属します。" },
  { title: "Steamとの関係", body: "ゲーム情報・画像はSteamから取得する場合があります。キョカミルはValve Corporationの公式サービス、提携サービスではありません。" },
  { title: "広告と編集の独立", body: "広告掲載やパブリッシャーからの出稿は、ゲームの配信可否・収益化可否の判定に影響しません。広告は編集情報と区別して表示します。" },
];

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-[var(--border-color)] pb-6">
        <p className="text-sm font-semibold text-[var(--accent-strong)]">ご利用前にご確認ください</p>
        <h1 className="mt-1 text-balance text-3xl font-black text-[var(--text-primary)]">免責事項・利用規約</h1>
      </header>
      <div className="mt-8 divide-y divide-[var(--border-color)] border border-[var(--border-color)] bg-[var(--panel-background)] px-6">
        {sections.map((section) => (
          <section key={section.title} className="py-6">
            <h2 className="text-balance text-lg font-bold text-[var(--text-primary)]">{section.title}</h2>
            <p className="mt-3 text-pretty text-sm leading-7 text-[var(--text-secondary)]">{section.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-5 text-xs tabular-nums text-[var(--text-muted)]">制定日: 2026-07-14</p>
    </article>
  );
}
