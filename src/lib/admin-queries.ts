import "server-only";

import { requireAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const RECHECK_AFTER_DAYS = 60;

export async function getAdminDashboard() {
  await requireAdminUser();

  const admin = createAdminClient();
  const threshold = new Date();
  threshold.setUTCDate(threshold.getUTCDate() - RECHECK_AFTER_DAYS);
  const thresholdDate = threshold.toISOString().slice(0, 10);

  const [publishedResult, draftResult, publisherResult, staleResult] =
    await Promise.all([
      admin
        .from("games")
        .select("id", { count: "exact", head: true })
        .eq("published", true),
      admin
        .from("games")
        .select("id", { count: "exact", head: true })
        .eq("published", false),
      admin.from("publishers").select("id", { count: "exact", head: true }),
      admin
        .from("games")
        .select("id, slug, title, last_verified_at, publishers(name)")
        .eq("published", true)
        .or(`last_verified_at.is.null,last_verified_at.lte.${thresholdDate}`)
        .order("last_verified_at", { ascending: true, nullsFirst: true }),
    ]);

  const error =
    publishedResult.error ??
    draftResult.error ??
    publisherResult.error ??
    staleResult.error;

  if (error) {
    throw new Error(`管理データを取得できませんでした: ${error.message}`);
  }

  return {
    counts: {
      published: publishedResult.count ?? 0,
      draft: draftResult.count ?? 0,
      publishers: publisherResult.count ?? 0,
    },
    staleGames: staleResult.data ?? [],
    thresholdDate,
  };
}

export async function getAdminPublishers() {
  await requireAdminUser();

  const admin = createAdminClient();
  const [publishersResult, gamesResult] = await Promise.all([
    admin
      .from("publishers")
      .select("id, slug, name, name_en, guideline_url, updated_at")
      .order("name", { ascending: true }),
    admin.from("games").select("publisher_id"),
  ]);

  const error = publishersResult.error ?? gamesResult.error;

  if (error) {
    throw new Error(`パブリッシャー一覧を取得できませんでした: ${error.message}`);
  }

  const gameCounts = new Map<string, number>();
  for (const game of gamesResult.data ?? []) {
    gameCounts.set(
      game.publisher_id,
      (gameCounts.get(game.publisher_id) ?? 0) + 1,
    );
  }

  return (publishersResult.data ?? []).map((publisher) => ({
    ...publisher,
    gameCount: gameCounts.get(publisher.id) ?? 0,
  }));
}

export async function getAdminPublisher(id: string) {
  await requireAdminUser();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("publishers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`パブリッシャーを取得できませんでした: ${error.message}`);
  }

  return data;
}

export type AdminGameFilters = {
  published?: "true" | "false";
  verification?: "stale" | "current" | "missing";
};

export async function getAdminGames(filters: AdminGameFilters = {}) {
  await requireAdminUser();

  const admin = createAdminClient();
  const threshold = new Date();
  threshold.setUTCDate(threshold.getUTCDate() - RECHECK_AFTER_DAYS);
  const thresholdDate = threshold.toISOString().slice(0, 10);

  let query = admin
    .from("games")
    .select("id, title, slug, published, last_verified_at, updated_at, publishers(name)")
    .order("updated_at", { ascending: false });

  if (filters.published) {
    query = query.eq("published", filters.published === "true");
  }

  if (filters.verification === "stale") {
    query = query.lte("last_verified_at", thresholdDate);
  } else if (filters.verification === "current") {
    query = query.gt("last_verified_at", thresholdDate);
  } else if (filters.verification === "missing") {
    query = query.is("last_verified_at", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`ゲーム一覧を取得できませんでした: ${error.message}`);
  }

  return { games: data ?? [], thresholdDate };
}

export async function getAdminGame(id: string) {
  await requireAdminUser();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("games")
    .select("*, sources(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`ゲームを取得できませんでした: ${error.message}`);
  }

  return data;
}

export async function getPublisherOptions() {
  await requireAdminUser();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("publishers")
    .select("id, slug, name, name_en")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`パブリッシャー候補を取得できませんでした: ${error.message}`);
  }

  return data ?? [];
}
