"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "httpまたはhttpsのURLを入力してください。");

const publisherSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "slugを入力してください。")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "英小文字・数字・ハイフンで入力してください。"),
  name: z.string().trim().min(1, "表示名を入力してください。"),
  name_en: z.string().trim(),
  official_site_url: optionalUrl,
  guideline_url: optionalUrl,
  guideline_summary: z.string().trim(),
  default_streaming_status: z.enum([
    "allowed",
    "conditional",
    "prohibited",
    "unknown",
    "",
  ]),
  default_monetization_status: z.enum([
    "allowed",
    "conditional",
    "prohibited",
    "unknown",
    "",
  ]),
});

type PublisherField = keyof z.infer<typeof publisherSchema>;

export type PublisherFormState = {
  error: string | null;
  fieldErrors: Partial<Record<PublisherField, string[]>>;
};

export type DeletePublisherState = {
  error: string | null;
};

function nullable(value: string) {
  return value || null;
}

function parsePublisherForm(formData: FormData) {
  return publisherSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    name_en: formData.get("name_en"),
    official_site_url: formData.get("official_site_url"),
    guideline_url: formData.get("guideline_url"),
    guideline_summary: formData.get("guideline_summary"),
    default_streaming_status: formData.get("default_streaming_status"),
    default_monetization_status: formData.get("default_monetization_status"),
  });
}

function toInsert(
  values: z.infer<typeof publisherSchema>,
): Database["public"]["Tables"]["publishers"]["Insert"] {
  return {
    slug: values.slug,
    name: values.name,
    name_en: nullable(values.name_en),
    official_site_url: nullable(values.official_site_url),
    guideline_url: nullable(values.guideline_url),
    guideline_summary: nullable(values.guideline_summary),
    default_streaming_status: nullable(
      values.default_streaming_status,
    ) as Database["public"]["Enums"]["approval_status"] | null,
    default_monetization_status: nullable(
      values.default_monetization_status,
    ) as Database["public"]["Enums"]["approval_status"] | null,
  };
}

function databaseErrorMessage(code: string | undefined) {
  if (code === "23505") {
    return "同じslugのパブリッシャーがすでに登録されています。";
  }

  return "保存できませんでした。入力内容を確認して、もう一度お試しください。";
}

async function revalidatePublisherPages(slug: string) {
  revalidatePath("/");
  revalidatePath("/publishers");
  revalidatePath(`/publishers/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/games/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/publishers");
}

export async function createPublisherAction(
  _previousState: PublisherFormState,
  formData: FormData,
): Promise<PublisherFormState> {
  await requireAdminUser();
  const parsed = parsePublisherForm(formData);

  if (!parsed.success) {
    return {
      error: "入力内容に誤りがあります。",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("publishers")
    .insert(toInsert(parsed.data))
    .select("id, slug")
    .single();

  if (error) {
    return { error: databaseErrorMessage(error.code), fieldErrors: {} };
  }

  await revalidatePublisherPages(data.slug);
  redirect("/admin/publishers?saved=created");
}

export async function updatePublisherAction(
  id: string,
  previousSlug: string,
  _previousState: PublisherFormState,
  formData: FormData,
): Promise<PublisherFormState> {
  await requireAdminUser();
  const parsed = parsePublisherForm(formData);

  if (!parsed.success) {
    return {
      error: "入力内容に誤りがあります。",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("publishers")
    .update(toInsert(parsed.data))
    .eq("id", id);

  if (error) {
    return { error: databaseErrorMessage(error.code), fieldErrors: {} };
  }

  await revalidatePublisherPages(previousSlug);
  if (previousSlug !== parsed.data.slug) {
    await revalidatePublisherPages(parsed.data.slug);
  }
  redirect("/admin/publishers?saved=updated");
}

export async function deletePublisherAction(
  id: string,
  slug: string,
  previousState: DeletePublisherState,
  formData: FormData,
): Promise<DeletePublisherState> {
  void previousState;
  void formData;
  await requireAdminUser();
  const admin = createAdminClient();
  const { count, error: countError } = await admin
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("publisher_id", id);

  if (countError) {
    return { error: "掲載ゲーム数を確認できませんでした。" };
  }

  if ((count ?? 0) > 0) {
    return { error: "掲載ゲームがあるため削除できません。先にゲームを移動または削除してください。" };
  }

  const { error } = await admin.from("publishers").delete().eq("id", id);

  if (error) {
    return { error: "パブリッシャーを削除できませんでした。" };
  }

  await revalidatePublisherPages(slug);
  redirect("/admin/publishers?saved=deleted");
}
