import {
  applicationStatusLabels,
  approvalStatusLabels,
  musicStatusLabels,
  spoilerStatusLabels,
} from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type StatusBadgeProps =
  | {
      kind: "approval";
      value: Database["public"]["Enums"]["approval_status"];
    }
  | {
      kind: "spoiler";
      value: Database["public"]["Enums"]["spoiler_status"];
    }
  | {
      kind: "music";
      value: Database["public"]["Enums"]["music_status"];
    }
  | {
      kind: "application";
      value: Database["public"]["Enums"]["application_status"];
    };

type BadgeSize = "default" | "large";

const toneClasses = {
  positive:
    "border-[var(--status-allowed-border)] bg-[var(--status-allowed-bg)] text-[var(--status-allowed-text)]",
  caution:
    "border-[var(--status-conditional-border)] bg-[var(--status-conditional-bg)] text-[var(--status-conditional-text)]",
  danger:
    "border-[var(--status-prohibited-border)] bg-[var(--status-prohibited-bg)] text-[var(--status-prohibited-text)]",
  neutral:
    "border-[var(--status-unknown-border)] bg-[var(--status-unknown-bg)] text-[var(--status-unknown-text)]",
} as const;

function getTone(value: StatusBadgeProps["value"]) {
  if (["allowed", "none", "ok", "not_required"].includes(value)) {
    return "positive";
  }

  if (["conditional", "restricted", "partial_mute", "required"].includes(value)) {
    return "caution";
  }

  if (value === "prohibited") {
    return "danger";
  }

  return "neutral";
}

function getLabel(props: StatusBadgeProps) {
  switch (props.kind) {
    case "approval":
      return approvalStatusLabels[props.value];
    case "spoiler":
      return spoilerStatusLabels[props.value];
    case "music":
      return musicStatusLabels[props.value];
    case "application":
      return applicationStatusLabels[props.value];
  }
}

export function StatusBadge({
  size = "default",
  ...props
}: StatusBadgeProps & { size?: BadgeSize }) {
  const tone = getTone(props.value);

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center border font-semibold tabular-nums",
        toneClasses[tone],
        size === "large" ? "min-h-10 px-4 py-2 text-base" : "px-2 py-1 text-xs",
      )}
    >
      {getLabel(props)}
    </span>
  );
}
