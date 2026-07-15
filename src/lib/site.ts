export const SITE_NAME = "キョカミル";
export const SITE_DESCRIPTION =
  "ゲームの配信可否・収益化可否と、その根拠となる公式情報を確認できるデータベースです。";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl) {
    return "https://kyokamiru.com";
  }

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return "https://kyokamiru.com";
  }
}

export function absoluteUrl(path: string) {
  return new URL(path, `${getSiteUrl()}/`).toString();
}
