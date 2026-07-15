import type { Tables } from "@/types/database";

export type PublicSource = Pick<
  Tables<"sources">,
  "id" | "url" | "source_type" | "label" | "noted_at"
>;

export type PublicGameSummary = Pick<
  Tables<"games">,
  | "id"
  | "slug"
  | "title"
  | "title_en"
  | "header_image_url"
  | "streaming_status"
  | "monetization_status"
  | "last_verified_at"
  | "created_at"
> & {
  release_date?: Tables<"games">["release_date"];
  genres?: Tables<"games">["genres"];
  publisher: Pick<Tables<"publishers">, "id" | "slug" | "name" | "name_en">;
  sources: PublicSource[];
};
