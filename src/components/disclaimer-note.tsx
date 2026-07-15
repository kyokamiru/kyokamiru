import type { PublicSource } from "./game-types";

export function DisclaimerNote({ sources }: { sources: PublicSource[] }) {
  return (
    <aside className="border-l-4 border-[var(--status-conditional-border)] bg-[var(--panel-background-deep)] p-5">
      <h2 className="text-balance font-bold text-[var(--text-primary)]">必ず公式情報をご確認ください</h2>
      <p className="mt-2 text-pretty text-sm leading-6 text-[var(--text-secondary)]">
        本サービスは参考情報の提供であり、法的助言ではありません。ガイドラインは変更される場合があります。配信前に以下の公式情報をご確認ください。
      </p>
      <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
        {sources.map((source) => (
          <li key={source.id}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-strong)] underline underline-offset-4"
            >
              {source.label || "公式情報を確認"}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
