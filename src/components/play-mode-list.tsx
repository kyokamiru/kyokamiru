import { playModeLabels, type PlayMode } from "@/lib/labels";

function ModeIcon({ mode }: { mode: PlayMode }) {
  if (mode === "singleplayer") {
    return <path d="M8 4.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0ZM5.5 13c.4-3 2-4.5 5-4.5S15.1 10 15.5 13" />;
  }
  if (mode === "online_coop") {
    return <path d="M3 11c.5-2.2 1.6-3.3 3.5-3.3S9.5 8.8 10 11m0 0c.5-2.2 1.6-3.3 3.5-3.3S16.5 8.8 17 11M4.5 4.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm7 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />;
  }
  if (mode === "local_multi") {
    return <path d="M2.5 4.5h15v9h-15zM7 13.5v2m6-2v2M5 16h10" />;
  }
  if (mode === "mmo") {
    return <><circle cx="10" cy="10" r="7" /><path d="M3 10h14M10 3c2 2 3 4.3 3 7s-1 5-3 7c-2-2-3-4.3-3-7s1-5 3-7Z" /></>;
  }
  return <path d="m5 4 10 12m0-12L5 16M3 7l4-4m10 4-4-4" />;
}

export function PlayModeList({ modes, compact = false }: { modes: string[]; compact?: boolean }) {
  const validModes = modes.filter((mode): mode is PlayMode => mode in playModeLabels);
  if (!validModes.length) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="プレイ形式">
      {validModes.map((mode) => (
        <li key={mode} className="inline-flex items-center gap-1.5 border border-[var(--border-color)] bg-[var(--panel-background-deep)] px-2 py-1 text-xs text-[var(--text-secondary)]">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 shrink-0 fill-none stroke-current stroke-[1.5]">
            <ModeIcon mode={mode} />
          </svg>
          {compact ? <span className="sr-only">{playModeLabels[mode]}</span> : playModeLabels[mode]}
        </li>
      ))}
    </ul>
  );
}
