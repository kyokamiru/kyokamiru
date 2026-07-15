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
  categories: z
    .array(z.object({ description: z.string() }))
    .optional()
    .default([]),
  header_image: z.string().url().optional(),
  screenshots: z
    .array(z.object({ path_full: z.string().url() }))
    .optional()
    .default([]),
  movies: z
    .array(
      z.object({
        highlight: z.boolean().optional().default(false),
        thumbnail: z.string().url(),
        mp4: z.object({ "480": z.string().url().optional() }).optional(),
        hls_h264: z.string().url().optional(),
      }),
    )
    .optional()
    .default([]),
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
  playModes: string[];
  screenshots: string[];
  movieUrl: string | null;
  movieThumbnailUrl: string | null;
};

const categoryMappings = [
  { mode: "singleplayer", names: ["Single-player", "シングルプレイヤー"] },
  { mode: "online_pvp", names: ["PvP", "Online PvP", "オンラインPvP", "オンライン PvP"] },
  { mode: "online_coop", names: ["Co-op", "Online Co-op", "オンライン協力プレイ"] },
  { mode: "local_multi", names: ["Shared/Split Screen", "Shared/Split Screen PvP", "Shared/Split Screen Co-op", "Remote Play Together", "画面分割", "ローカル PvP", "ローカル協力プレイ", "リモートプレイトゥギャザー", "画面共有/分割"] },
  { mode: "mmo", names: ["MMO", "Massively Multiplayer", "MMOプレイヤー", "大規模マルチプレイヤー"] },
] as const;

function mapPlayModes(categories: string[]) {
  const normalized = categories.map((category) => category.toLowerCase());
  const modes = categoryMappings
    .filter(({ names }) => names.some((name) => normalized.includes(name.toLowerCase())))
    .map(({ mode }) => mode);
  const hasGenericMultiplayer = normalized.some((category) =>
    ["multi-player", "multiplayer", "マルチプレイヤー"].includes(category),
  );

  if (hasGenericMultiplayer && modes.length === 0) {
    modes.push("online_pvp");
  }

  return modes;
}

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

  const movie =
    app.data.movies.find((item) => item.highlight && (item.mp4?.["480"] || item.hls_h264)) ??
    app.data.movies.find((item) => item.mp4?.["480"] || item.hls_h264);

  return {
    steamAppId: appId,
    title: app.data.name,
    titleEn: app.data.name,
    publisherName: app.data.publishers[0] ?? null,
    releaseDate: parseReleaseDate(app.data.release_date?.date),
    genres: app.data.genres.map((genre) => genre.description),
    headerImageUrl: app.data.header_image ?? null,
    playModes: mapPlayModes(app.data.categories.map((category) => category.description)),
    screenshots: app.data.screenshots.map((screenshot) => screenshot.path_full),
    movieUrl: movie?.mp4?.["480"] ?? movie?.hls_h264 ?? null,
    movieThumbnailUrl: movie?.thumbnail ?? null,
  };
}
