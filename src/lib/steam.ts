import "server-only";

import { z } from "zod";

const steamDataSchema = z.object({
  name: z.string(),
  publishers: z.array(z.string()).optional().default([]),
  release_date: z.object({ date: z.string() }).optional(),
  genres: z
    .array(z.object({ description: z.string() }))
    .optional()
    .default([]),
  header_image: z.string().url().optional(),
});

const steamEnvelopeSchema = z.record(
  z.string(),
  z.object({
    success: z.boolean(),
    data: steamDataSchema.optional(),
  }),
);

export type SteamImportResult = {
  steamAppId: number;
  title: string;
  titleEn: string;
  publisherName: string | null;
  releaseDate: string | null;
  genres: string[];
  headerImageUrl: string | null;
};

export function extractSteamAppId(input: string) {
  const trimmed = input.trim();
  const directId = /^\d+$/.exec(trimmed);
  let urlId: string | undefined;

  if (!directId) {
    try {
      const url = new URL(trimmed);
      if (url.protocol === "https:" && url.hostname === "store.steampowered.com") {
        urlId = /^\/app\/(\d+)/.exec(url.pathname)?.[1];
      }
    } catch {
      urlId = undefined;
    }
  }

  const value = directId?.[0] ?? urlId;

  if (!value) {
    return null;
  }

  const appId = Number(value);
  return Number.isSafeInteger(appId) && appId > 0 ? appId : null;
}

function parseReleaseDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const japanese = /^(\d{4})年(\d{1,2})月(\d{1,2})日$/.exec(value.trim());
  if (japanese) {
    const [, year, month, day] = japanese;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

export async function fetchSteamAppDetails(
  appId: number,
): Promise<SteamImportResult> {
  let response: Response;

  try {
    response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=jp&l=japanese`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    throw new Error("Steamから情報を取得できませんでした。時間をおいて再度お試しください。");
  }

  if (!response.ok) {
    throw new Error("Steamから情報を取得できませんでした。手入力で続けてください。");
  }

  const parsed = steamEnvelopeSchema.safeParse(await response.json());
  const app = parsed.success ? parsed.data[String(appId)] : undefined;

  if (!app?.success || !app.data) {
    throw new Error("指定されたSteamゲームの情報が見つかりませんでした。");
  }

  return {
    steamAppId: appId,
    title: app.data.name,
    titleEn: app.data.name,
    publisherName: app.data.publishers[0] ?? null,
    releaseDate: parseReleaseDate(app.data.release_date?.date),
    genres: app.data.genres.map((genre) => genre.description),
    headerImageUrl: app.data.header_image ?? null,
  };
}
