import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/types/database";

const GAME_PAGE_SIZE = 24;
const DEFAULT_SECTION_LIMIT = 8;
const MAX_SECTION_LIMIT = 24;

type ApprovalStatus = Database["public"]["Enums"]["approval_status"];
type GameSort = "name" | "verified" | "added";
type PublicClient = SupabaseClient<Database>;

export type GameListFilters = {
  q?: string;
  streaming?: ApprovalStatus;
  monetization?: ApprovalStatus;
  publisher?: string;
  genre?: string;
  modes?: string[];
  sort?: GameSort;
  page?: number;
};

function throwQueryError(message: string, cause: unknown): never {
  throw new Error(message, { cause });
}

async function getClient(client?: PublicClient) {
  return client ?? createPublicClient();
}

function normalizePage(page?: number) {
  if (!Number.isFinite(page)) {
    return 1;
  }

  return Math.max(1, Math.floor(page ?? 1));
}

function normalizeLimit(limit?: number) {
  if (!Number.isFinite(limit)) {
    return DEFAULT_SECTION_LIMIT;
  }

  return Math.min(
    MAX_SECTION_LIMIT,
    Math.max(1, Math.floor(limit ?? DEFAULT_SECTION_LIMIT)),
  );
}

function escapePostgrestValue(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("*", "\\*")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function ilikeFilter(column: string, value: string) {
  return `${column}.ilike."*${escapePostgrestValue(value)}*"`;
}

async function findPublisherIds(client: PublicClient, keyword: string) {
  const { data, error } = await client
    .from("publishers")
    .select("id")
    .or(
      [ilikeFilter("name", keyword), ilikeFilter("name_en", keyword)].join(
        ",",
      ),
    );

  if (error) {
    throwQueryError("パブリッシャーの検索に失敗しました。", error);
  }

  return data.map(({ id }) => id);
}

export async function getGames(
  filters: GameListFilters = {},
  client?: PublicClient,
) {
  const supabase = await getClient(client);
  const page = normalizePage(filters.page);
  const from = (page - 1) * GAME_PAGE_SIZE;
  const to = from + GAME_PAGE_SIZE - 1;
  const keyword = filters.q?.trim();

  let query = supabase
    .from("games")
    .select(
      `
        id,
        slug,
        title,
        title_en,
        release_date,
        genres,
        play_modes,
        header_image_url,
        streaming_status,
        monetization_status,
        last_verified_at,
        created_at,
        publisher:publishers!inner(id, slug, name, name_en),
        sources(id, url, source_type, label, noted_at)
      `,
      { count: "exact" },
    )
    .eq("published", true);

  if (keyword) {
    const publisherIds = await findPublisherIds(supabase, keyword);
    const searchFilters = [
      ilikeFilter("title", keyword),
      ilikeFilter("title_en", keyword),
    ];

    if (publisherIds.length > 0) {
      searchFilters.push(`publisher_id.in.(${publisherIds.join(",")})`);
    }

    query = query.or(searchFilters.join(","));
  }

  if (filters.streaming) {
    query = query.eq("streaming_status", filters.streaming);
  }

  if (filters.monetization) {
    query = query.eq("monetization_status", filters.monetization);
  }

  if (filters.publisher) {
    query = query.eq("publishers.slug", filters.publisher);
  }

  if (filters.genre) {
    query = query.contains("genres", [filters.genre]);
  }

  if (filters.modes?.length) {
    query = query.overlaps("play_modes", filters.modes);
  }

  switch (filters.sort) {
    case "verified":
      query = query
        .order("last_verified_at", { ascending: false, nullsFirst: false })
        .order("title", { ascending: true });
      break;
    case "added":
      query = query
        .order("created_at", { ascending: false })
        .order("title", { ascending: true });
      break;
    default:
      query = query.order("title", { ascending: true });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throwQueryError("ゲーム一覧の取得に失敗しました。", error);
  }

  const totalCount = count ?? 0;

  return {
    games: data,
    count: totalCount,
    page,
    pageSize: GAME_PAGE_SIZE,
    totalPages: Math.ceil(totalCount / GAME_PAGE_SIZE),
  };
}

function resolveApprovalStatus(
  gameStatus: ApprovalStatus,
  publisherStatus: ApprovalStatus | null,
  usesPublisherGuideline: boolean,
) {
  const inherited =
    usesPublisherGuideline &&
    gameStatus === "unknown" &&
    publisherStatus !== null;

  return {
    status: inherited ? publisherStatus : gameStatus,
    inheritedFromPublisher: inherited,
  };
}

export async function getGameBySlug(slug: string, client?: PublicClient) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("games")
    .select(
      `
        *,
        publisher:publishers!inner(*),
        sources(*)
      `,
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throwQueryError("ゲーム詳細の取得に失敗しました。", error);
  }

  if (!data) {
    return null;
  }

  const usesPublisherGuideline = data.guideline_scope === "publisher_wide";

  return {
    ...data,
    effectiveStreamingStatus: resolveApprovalStatus(
      data.streaming_status,
      data.publisher.default_streaming_status,
      usesPublisherGuideline,
    ),
    effectiveMonetizationStatus: resolveApprovalStatus(
      data.monetization_status,
      data.publisher.default_monetization_status,
      usesPublisherGuideline,
    ),
  };
}

export async function getPublishers(client?: PublicClient) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("publishers")
    .select(
      `
        id,
        slug,
        name,
        name_en,
        guideline_url,
        games(count)
      `,
    )
    .order("name", { ascending: true });

  if (error) {
    throwQueryError("パブリッシャー一覧の取得に失敗しました。", error);
  }

  return data.map(({ games, ...publisher }) => ({
    ...publisher,
    publishedGameCount: games[0]?.count ?? 0,
  }));
}

export async function getPublisherBySlug(
  slug: string,
  client?: PublicClient,
) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("publishers")
    .select(
      `
        *,
        games(
          id,
          slug,
          title,
          title_en,
          release_date,
          genres,
          play_modes,
          header_image_url,
          streaming_status,
          monetization_status,
          last_verified_at,
          created_at,
          sources(id, url, source_type, label, noted_at)
        )
      `,
    )
    .eq("slug", slug)
    .eq("games.published", true)
    .order("title", { ascending: true, referencedTable: "games" })
    .maybeSingle();

  if (error) {
    throwQueryError("パブリッシャー詳細の取得に失敗しました。", error);
  }

  return data;
}

async function getGameSection(
  orderBy: "created_at" | "last_verified_at",
  limit: number | undefined,
  client?: PublicClient,
) {
  const supabase = await getClient(client);
  const normalizedLimit = normalizeLimit(limit);
  const { data, error } = await supabase
    .from("games")
    .select(
      `
        id,
        slug,
        title,
        title_en,
        header_image_url,
        play_modes,
        streaming_status,
        monetization_status,
        last_verified_at,
        created_at,
        publisher:publishers!inner(id, slug, name, name_en),
        sources(id, url, source_type, label, noted_at)
      `,
    )
    .eq("published", true)
    .order(orderBy, { ascending: false, nullsFirst: false })
    .limit(normalizedLimit);

  if (error) {
    throwQueryError("ゲーム情報の取得に失敗しました。", error);
  }

  return data;
}

export function getNewGames(limit?: number, client?: PublicClient) {
  return getGameSection("created_at", limit, client);
}

export function getRecentlyVerifiedGames(
  limit?: number,
  client?: PublicClient,
) {
  return getGameSection("last_verified_at", limit, client);
}

export async function getGameGenres(client?: PublicClient) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("games")
    .select("genres")
    .eq("published", true);

  if (error) {
    throwQueryError("ジャンル一覧の取得に失敗しました。", error);
  }

  return [...new Set(data.flatMap(({ genres }) => genres))].sort((a, b) =>
    a.localeCompare(b, "ja"),
  );
}

export async function getPublishedGameSlugs(client?: PublicClient) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("games")
    .select("slug")
    .eq("published", true)
    .order("slug");

  if (error) {
    throwQueryError("ゲームURL一覧の取得に失敗しました。", error);
  }

  return data;
}

export async function getPublisherSlugs(client?: PublicClient) {
  const supabase = await getClient(client);
  const { data, error } = await supabase
    .from("publishers")
    .select("slug")
    .order("slug");

  if (error) {
    throwQueryError("パブリッシャーURL一覧の取得に失敗しました。", error);
  }

  return data;
}
