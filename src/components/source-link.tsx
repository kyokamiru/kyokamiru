import { sourceTypeLabels } from "@/lib/labels";

import type { PublicSource } from "./game-types";

export function SourceLink({ sources }: { sources: PublicSource[] }) {
  const source = sources[0];

  if (!source) {
    return <span className="text-[var(--status-prohibited-text)]">根拠未登録</span>;
  }

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[var(--accent-strong)] underline decoration-[var(--border-color)] underline-offset-4 hover:text-[var(--text-primary)]"
    >
      {source.label || sourceTypeLabels[source.source_type]}
      {sources.length > 1 ? `ほか${sources.length - 1}件` : ""}
    </a>
  );
}
