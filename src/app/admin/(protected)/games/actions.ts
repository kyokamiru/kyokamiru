"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminUser } from "@/lib/auth";
import { extractSteamAppId, fetchSteamAppDetails } from "@/lib/steam";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

const steamCdnUrl = z.string().trim().refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname.endsWith(".steamstatic.com") ||
        url.hostname === "steamcdn-a.akamaihd.net")
    );
  } catch {
    return false;
  }
}, "Steam CDNのhttps URLを入力してください。");

const gameSchema = z.object({
  title: z.string().trim().min(1, "タイトルを入力してください。"),
  title_en: z.string().trim(),
  slug: z
    .string()
    .trim()
    .min(1, "slugを入力してください。")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "英小文字・数字・ハイフンで入力してください。"),
  publisher_id: z.string().trim(),
  new_publisher_name: z.string().trim(),
  new_publisher_slug: z.string().trim(),
  release_date: z.string().trim(),
  genres: z.string().trim(),
  steam_app_id: z
    .string()
    .trim()
    .refine((value) => !value || /^\d+$/.test(value), "Steam App IDは数字で入力してください。"),
  header_image_url: steamCdnUrl,
  guideline_scope: z.enum(["publisher_wide", "title_specific"]),
  streaming_status: z.enum(["allowed", "conditional", "prohibited", "unknown"]),
  monetization_status: z.enum(["allowed", "conditional", "prohibited", "unknown"]),
  spoiler_restriction: z.enum(["none", "restricted", "unknown"]),
  music_restriction: z.enum(["ok", "partial_mute", "restricted", "unknown"]),
  clip_archive_status: z.enum(["allowed", "conditional", "prohibited", "unknown"]),
  prior_application: z.enum(["not_required", "required", "unknown"]),
  notes: z.string().trim(),
  last_verified_at: z.string().trim(),
  published: z.boolean(),
});

const sourceTypeSchema = z.enum(["guideline", "eula", "faq", "dev_statement", "other"]);

type GameField = keyof z.infer<typeof gameSchema> | "sources";

export type GameFormState = {
  error: string | null;
  fieldErrors: Partial<Record<GameField, string[]>>;
};

export type DeleteGameState = { error: string | null };

type ParsedSource = {
  url: string;
  source_type: Database["public"]["Enums"]["source_type"];
  label: string | null;
  noted_at: string | null;
};

function nullable(value: string) {
  return value || null;
}

function parseGameForm(formData: FormData) {
  return gameSchema.safeParse({
    title: formData.get("title"),
    title_en: formData.get("title_en"),
    slug: formData.get("slug"),
    publisher_id: formData.get("publisher_id"),
    new_publisher_name: formData.get("new_publisher_name"),
    new_publisher_slug: formData.get("new_publisher_slug"),
    release_date: formData.get("release_date"),
    genres: formData.get("genres"),
    steam_app_id: formData.get("steam_app_id"),
    header_image_url: formData.get("header_image_url"),
    guideline_scope: formData.get("guideline_scope"),
    streaming_status: formData.get("streaming_status"),
    monetization_status: formData.get("monetization_status"),
    spoiler_restriction: formData.get("spoiler_restriction"),
    music_restriction: formData.get("music_restriction"),
    clip_archive_status: formData.get("clip_archive_status"),
    prior_application: formData.get("prior_application"),
    notes: formData.get("notes"),
    last_verified_at: formData.get("last_verified_at"),
    published: formData.get("published") === "on",
  });
}

function parseSources(formData: FormData): { data?: ParsedSource[]; error?: string } {
  const count = Number(formData.get("source_count"));
  if (!Number.isInteger(count) || count < 0 || count > 20) {
    return { error: "根拠情報の件数が不正です。" };
  }

  const sources: ParsedSource[] = [];
  for (let index = 0; index < count; index += 1) {
    const url = String(formData.get(`source_url_${index}`) ?? "").trim();
    const sourceType = sourceTypeSchema.safeParse(
      formData.get(`source_type_${index}`),
    );
    const label = String(formData.get(`source_label_${index}`) ?? "").trim();
    const notedAt = String(formData.get(`source_noted_at_${index}`) ?? "").trim();

    if (!url && !label && !notedAt) {
      continue;
    }
    let validUrl = false;
    try {
      const parsedUrl = new URL(url);
      validUrl = parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
    } catch {
      validUrl = false;
    }
    if (!validUrl) {
      return { error: `${index + 1}件目の根拠URLを正しく入力してください。` };
    }
    if (!sourceType.success) {
      return { error: `${index + 1}件目の根拠種別を選択してください。` };
    }

    sources.push({
      url,
      source_type: sourceType.data,
      label: nullable(label),
      noted_at: nullable(notedAt),
    });
  }

  return { data: sources };
}

function toGameData(
  values: z.infer<typeof gameSchema>,
  publisherId: string,
): Database["public"]["Tables"]["games"]["Insert"] {
  return {
    title: values.title,
    title_en: nullable(values.title_en),
    slug: values.slug,
    publisher_id: publisherId,
    release_date: nullable(values.release_date),
    genres: values.genres
      ? values.genres.split(/[,\n]/).map((genre) => genre.trim()).filter(Boolean)
      : [],
    steam_app_id: values.steam_app_id ? Number(values.steam_app_id) : null,
    header_image_url: nullable(values.header_image_url),
    guideline_scope: values.guideline_scope,
    streaming_status: values.streaming_status,
    monetization_status: values.monetization_status,
    spoiler_restriction: values.spoiler_restriction,
    music_restriction: values.music_restriction,
    clip_archive_status: values.clip_archive_status,
    prior_application: values.prior_application,
    notes: nullable(values.notes),
    last_verified_at: nullable(values.last_verified_at),
    published: values.published,
  };
}

async function resolvePublisherId(values: z.infer<typeof gameSchema>) {
  if (values.publisher_id) {
    return { id: values.publisher_id };
  }

  if (!values.new_publisher_name || !values.new_publisher_slug) {
    return { error: "既存のパブリッシャーを選ぶか、新規パブリッシャー名とslugを入力してください。" };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.new_publisher_slug)) {
    return { error: "新規パブリッシャーのslugは英小文字・数字・ハイフンで入力してください。" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("publishers")
    .insert({ name: values.new_publisher_name, slug: values.new_publisher_slug })
    .select("id")
    .single();

  if (error) {
    return { error: error.code === "23505" ? "同じslugのパブリッシャーが存在します。" : "パブリッシャーを作成できませんでした。" };
  }

  revalidatePath("/admin/publishers");
  revalidatePath("/publishers");
  return { id: data.id };
}

function databaseErrorMessage(code: string | undefined) {
  return code === "23505"
    ? "同じslugまたはSteam App IDのゲームがすでに登録されています。"
    : "ゲームを保存できませんでした。";
}

function revalidateGamePages(slug: string) {
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath(`/games/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/publishers");
  revalidatePath("/publishers/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/games");
}

function validateForPublish(values: z.infer<typeof gameSchema>, sources: ParsedSource[]) {
  if (values.published && !values.last_verified_at) {
    return "公開するには最終確認日が必要です。";
  }
  if (values.published && sources.length === 0) {
    return "公開するには根拠情報が1件以上必要です。";
  }
  return null;
}

export async function createGameAction(
  _previousState: GameFormState,
  formData: FormData,
): Promise<GameFormState> {
  await requireAdminUser();
  const parsed = parseGameForm(formData);
  const parsedSources = parseSources(formData);

  if (!parsed.success) {
    return { error: "入力内容に誤りがあります。", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (parsedSources.error || !parsedSources.data) {
    return { error: "根拠情報を確認してください。", fieldErrors: { sources: [parsedSources.error ?? "根拠情報が不正です。"] } };
  }
  const publishError = validateForPublish(parsed.data, parsedSources.data);
  if (publishError) {
    return { error: publishError, fieldErrors: {} };
  }

  const publisher = await resolvePublisherId(parsed.data);
  if (!publisher.id) {
    return { error: publisher.error ?? "パブリッシャーを確認してください。", fieldErrors: { publisher_id: [publisher.error ?? "選択してください。"] } };
  }

  const admin = createAdminClient();
  const gameData = toGameData(parsed.data, publisher.id);
  const { data: game, error } = await admin
    .from("games")
    .insert({ ...gameData, published: false })
    .select("id")
    .single();

  if (error) {
    return { error: databaseErrorMessage(error.code), fieldErrors: {} };
  }

  if (parsedSources.data.length > 0) {
    const { error: sourceError } = await admin
      .from("sources")
      .insert(parsedSources.data.map((source) => ({ ...source, game_id: game.id })));
    if (sourceError) {
      const { error: rollbackError } = await admin.from("games").delete().eq("id", game.id);
      return {
        error: rollbackError
          ? "根拠情報を保存できず、作成途中のゲームも削除できませんでした。管理画面で下書きを確認してください。"
          : "根拠情報を保存できませんでした。ゲームは登録されていません。",
        fieldErrors: { sources: [sourceError.message] },
      };
    }
  }

  if (parsed.data.published) {
    const { error: publishDbError } = await admin
      .from("games")
      .update({ published: true })
      .eq("id", game.id);
    if (publishDbError) {
      return { error: "ゲームを公開状態にできませんでした。下書きとして保存されています。", fieldErrors: {} };
    }
  }

  revalidateGamePages(parsed.data.slug);
  redirect("/admin/games?saved=created");
}

export async function updateGameAction(
  id: string,
  previousSlug: string,
  _previousState: GameFormState,
  formData: FormData,
): Promise<GameFormState> {
  await requireAdminUser();
  const parsed = parseGameForm(formData);
  const parsedSources = parseSources(formData);

  if (!parsed.success) {
    return { error: "入力内容に誤りがあります。", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (parsedSources.error || !parsedSources.data) {
    return { error: "根拠情報を確認してください。", fieldErrors: { sources: [parsedSources.error ?? "根拠情報が不正です。"] } };
  }
  const publishError = validateForPublish(parsed.data, parsedSources.data);
  if (publishError) {
    return { error: publishError, fieldErrors: {} };
  }

  const admin = createAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("games")
    .select("published, sources(id)")
    .eq("id", id)
    .single();
  if (existingError) {
    return { error: "編集対象のゲームを確認できませんでした。", fieldErrors: {} };
  }
  if (existing.published && parsed.data.slug !== previousSlug) {
    return { error: "公開済みゲームのslugは変更できません。", fieldErrors: { slug: ["公開済みのため変更できません。"] } };
  }

  const publisher = await resolvePublisherId(parsed.data);
  if (!publisher.id) {
    return { error: publisher.error ?? "パブリッシャーを確認してください。", fieldErrors: { publisher_id: [publisher.error ?? "選択してください。"] } };
  }

  const { data: insertedSources, error: sourceError } = parsedSources.data.length
    ? await admin
        .from("sources")
        .insert(parsedSources.data.map((source) => ({ ...source, game_id: id })))
        .select("id")
    : { data: [], error: null };
  if (sourceError) {
    return { error: "新しい根拠情報を保存できませんでした。", fieldErrors: { sources: [sourceError.message] } };
  }

  const { error } = await admin
    .from("games")
    .update(toGameData(parsed.data, publisher.id))
    .eq("id", id);
  if (error) {
    if (insertedSources?.length) {
      const { error: rollbackError } = await admin
        .from("sources")
        .delete()
        .in("id", insertedSources.map((source) => source.id));
      if (rollbackError) {
        return {
          error: "ゲーム更新に失敗し、新しく追加した根拠情報も整理できませんでした。再読み込みして確認してください。",
          fieldErrors: { sources: [rollbackError.message] },
        };
      }
    }
    return { error: databaseErrorMessage(error.code), fieldErrors: {} };
  }

  const oldSourceIds = existing.sources.map((source) => source.id);
  if (oldSourceIds.length) {
    const { error: deleteSourceError } = await admin.from("sources").delete().in("id", oldSourceIds);
    if (deleteSourceError) {
      return { error: "ゲームは更新されましたが、古い根拠情報を整理できませんでした。", fieldErrors: { sources: [deleteSourceError.message] } };
    }
  }

  revalidateGamePages(previousSlug);
  if (previousSlug !== parsed.data.slug) {
    revalidateGamePages(parsed.data.slug);
  }
  redirect("/admin/games?saved=updated");
}

export async function deleteGameAction(
  id: string,
  slug: string,
  previousState: DeleteGameState,
  formData: FormData,
): Promise<DeleteGameState> {
  void previousState;
  void formData;
  await requireAdminUser();
  const admin = createAdminClient();
  const { error } = await admin.from("games").delete().eq("id", id);
  if (error) {
    return { error: "ゲームを削除できませんでした。" };
  }
  revalidateGamePages(slug);
  redirect("/admin/games?saved=deleted");
}

export async function fetchSteamDetailsAction(input: string) {
  await requireAdminUser();
  const appId = extractSteamAppId(input);
  if (!appId) {
    return { error: "Steam App IDまたはストアURLを正しく入力してください。", data: null };
  }

  try {
    return { error: null, data: await fetchSteamAppDetails(appId) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Steamから取得できませんでした。", data: null };
  }
}
