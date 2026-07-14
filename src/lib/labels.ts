export const approvalStatusLabels = {
  allowed: "可",
  conditional: "条件付き可",
  prohibited: "不可",
  unknown: "不明",
} as const;

export const spoilerStatusLabels = {
  none: "なし",
  restricted: "あり",
  unknown: "不明",
} as const;

export const musicStatusLabels = {
  ok: "問題なし",
  partial_mute: "一部ミュート推奨",
  restricted: "制限あり",
  unknown: "不明",
} as const;

export const applicationStatusLabels = {
  not_required: "不要",
  required: "必要",
  unknown: "不明",
} as const;

export const sourceTypeLabels = {
  guideline: "公式ガイドライン",
  eula: "EULA",
  faq: "公式FAQ",
  dev_statement: "開発者発言",
  other: "その他",
} as const;
