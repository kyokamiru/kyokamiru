"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import {
  fetchSteamDetailsAction,
  type GameFormState,
} from "@/app/admin/(protected)/games/actions";
import {
  applicationStatusLabels,
  approvalStatusLabels,
  guidelineScopeLabels,
  musicStatusLabels,
  playModeLabels,
  sourceTypeLabels,
  spoilerStatusLabels,
} from "@/lib/labels";
import type { Database } from "@/types/database";

type Game = Database["public"]["Tables"]["games"]["Row"] & {
  sources: Database["public"]["Tables"]["sources"]["Row"][];
};
type PublisherOption = Pick<
  Database["public"]["Tables"]["publishers"]["Row"],
  "id" | "slug" | "name" | "name_en"
>;
type SourceDraft = {
  key: string;
  url: string;
  sourceType: Database["public"]["Enums"]["source_type"];
  label: string;
  notedAt: string;
};

type GameFormProps = {
  action: (state: GameFormState, formData: FormData) => Promise<GameFormState>;
  publishers: PublisherOption[];
  game?: Game;
};

const inputClassName =
  "min-h-11 w-full border border-slate-600 bg-slate-950 px-3 py-2 text-base text-white placeholder:text-slate-600 focus:border-sky-400";
const initialGameFormState: GameFormState = { error: null, fieldErrors: {} };

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.length ? <p className="text-sm text-red-300">{messages[0]}</p> : null;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-11 border border-sky-400 bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60">
      {pending ? "保存中…" : editing ? "変更を保存" : "登録する"}
    </button>
  );
}

function StatusSelect({
  id,
  label,
  labels,
  defaultValue,
}: {
  id: string;
  label: string;
  labels: Record<string, string>;
  defaultValue: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-200">{label}</label>
      <select id={id} name={id} defaultValue={defaultValue} className={inputClassName}>
        {Object.entries(labels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </div>
  );
}

export function GameForm({ action, publishers, game }: GameFormProps) {
  const [state, formAction] = useActionState(action, initialGameFormState);
  const [steamInput, setSteamInput] = useState(game?.steam_app_id?.toString() ?? "");
  const [steamError, setSteamError] = useState<string | null>(null);
  const [steamPending, startSteamTransition] = useTransition();
  const [title, setTitle] = useState(game?.title ?? "");
  const [titleEn, setTitleEn] = useState(game?.title_en ?? "");
  const [slug, setSlug] = useState(game?.slug ?? "");
  const [slugCustomized, setSlugCustomized] = useState(Boolean(game));
  const [publisherId, setPublisherId] = useState(game?.publisher_id ?? "");
  const [newPublisherName, setNewPublisherName] = useState("");
  const [newPublisherSlug, setNewPublisherSlug] = useState("");
  const [releaseDate, setReleaseDate] = useState(game?.release_date ?? "");
  const [genres, setGenres] = useState(game?.genres.join(", ") ?? "");
  const [headerImageUrl, setHeaderImageUrl] = useState(game?.header_image_url ?? "");
  const [playModes, setPlayModes] = useState<string[]>(game?.play_modes ?? []);
  const [screenshotOptions, setScreenshotOptions] = useState<string[]>(game?.screenshots ?? []);
  const [screenshots, setScreenshots] = useState<string[]>(game?.screenshots ?? []);
  const [movieUrl, setMovieUrl] = useState(game?.movie_url ?? "");
  const [movieThumbnailUrl, setMovieThumbnailUrl] = useState(game?.movie_thumbnail_url ?? "");
  const [summary, setSummary] = useState(game?.summary ?? "");
  const [lastVerifiedAt, setLastVerifiedAt] = useState(game?.last_verified_at ?? "");
  const [sources, setSources] = useState<SourceDraft[]>(
    game?.sources.map((source) => ({
      key: source.id,
      url: source.url,
      sourceType: source.source_type,
      label: source.label ?? "",
      notedAt: source.noted_at ?? "",
    })) ?? [{ key: "initial", url: "", sourceType: "guideline", label: "", notedAt: "" }],
  );

  function importFromSteam() {
    setSteamError(null);
    startSteamTransition(async () => {
      const result = await fetchSteamDetailsAction(steamInput);
      if (result.error || !result.data) {
        setSteamError(result.error ?? "Steamから取得できませんでした。");
        return;
      }

      setSteamInput(String(result.data.steamAppId));
      setTitle(result.data.title);
      setTitleEn(result.data.titleEn);
      if (!slugCustomized) setSlug(slugify(result.data.titleEn));
      setReleaseDate(result.data.releaseDate ?? "");
      setGenres(result.data.genres.join(", "));
      setHeaderImageUrl(result.data.headerImageUrl ?? "");
      setPlayModes(result.data.playModes);
      setScreenshotOptions(result.data.screenshots);
      setScreenshots(result.data.screenshots.slice(0, 6));
      setMovieUrl(result.data.movieUrl ?? "");
      setMovieThumbnailUrl(result.data.movieThumbnailUrl ?? "");

      if (result.data.publisherName) {
        const matched = publishers.find((publisher) =>
          [publisher.name, publisher.name_en].some(
            (name) => name?.toLowerCase() === result.data?.publisherName?.toLowerCase(),
          ),
        );
        if (matched) {
          setPublisherId(matched.id);
          setNewPublisherName("");
          setNewPublisherSlug("");
        } else {
          setPublisherId("");
          setNewPublisherName(result.data.publisherName);
          setNewPublisherSlug(slugify(result.data.publisherName));
        }
      }
    });
  }

  function updateSource(index: number, update: Partial<SourceDraft>) {
    setSources((current) => current.map((source, itemIndex) => itemIndex === index ? { ...source, ...update } : source));
  }

  function toggleScreenshot(url: string) {
    setScreenshots((current) => {
      if (current.includes(url)) return current.filter((item) => item !== url);
      return current.length < 6 ? [...current, url] : current;
    });
  }

  return (
    <form
      action={formAction}
      onReset={(event) => event.preventDefault()}
      className="space-y-7"
    >
      {state.error ? <p role="alert" className="border-l-2 border-red-400 bg-red-950/50 px-4 py-3 text-sm text-red-200">{state.error}</p> : null}

      <section className="border border-slate-700 bg-slate-900">
          <div className="border-b border-slate-700 px-5 py-4">
            <h2 className="text-balance text-lg font-bold text-white">Steamから取得</h2>
            <p className="mt-1 text-pretty text-sm text-slate-400">App IDまたはストアURLから基本情報・プレイ形式・メディアをフォームへ反映します。</p>
          </div>
          <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row">
            <input aria-label="Steam App IDまたはストアURL" value={steamInput} onChange={(event) => setSteamInput(event.target.value)} placeholder="367520 またはストアURL" className={inputClassName} />
            <button type="button" onClick={importFromSteam} disabled={steamPending || !steamInput.trim()} className="min-h-11 shrink-0 border border-sky-500 px-4 py-2 text-sm font-semibold text-sky-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              {steamPending ? "取得中…" : "Steamから取得"}
            </button>
          </div>
          {steamError ? <p role="alert" className="mx-5 mb-5 text-sm text-red-300">{steamError}</p> : null}
      </section>

      <section className="border border-slate-700 bg-slate-900">
        <div className="border-b border-slate-700 px-5 py-4"><h2 className="text-balance text-lg font-bold text-white">基本情報</h2></div>
        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><label htmlFor="title" className="block text-sm font-semibold text-slate-200">タイトル <span className="text-red-300">必須</span></label><input id="title" name="title" required value={title} onChange={(event) => setTitle(event.target.value)} className={inputClassName} /><FieldError messages={state.fieldErrors.title} /></div>
          <div className="space-y-2"><label htmlFor="title_en" className="block text-sm font-semibold text-slate-200">英語タイトル</label><input id="title_en" name="title_en" value={titleEn} onChange={(event) => { const value = event.target.value; setTitleEn(value); if (!slugCustomized) setSlug(slugify(value)); }} className={inputClassName} /></div>
          <div className="space-y-2"><label htmlFor="slug" className="block text-sm font-semibold text-slate-200">slug <span className="text-red-300">必須</span></label><input id="slug" name="slug" required value={slug} onChange={(event) => { setSlug(event.target.value); setSlugCustomized(true); }} readOnly={Boolean(game?.published)} className={inputClassName} /><FieldError messages={state.fieldErrors.slug} /></div>
          <div className="space-y-2"><label htmlFor="release_date" className="block text-sm font-semibold text-slate-200">発売日</label><input id="release_date" name="release_date" type="date" value={releaseDate} onChange={(event) => setReleaseDate(event.target.value)} className={inputClassName} /></div>
          <div className="space-y-2"><label htmlFor="steam_app_id" className="block text-sm font-semibold text-slate-200">Steam App ID</label><input id="steam_app_id" name="steam_app_id" inputMode="numeric" value={steamInput} onChange={(event) => setSteamInput(event.target.value)} className={inputClassName} /><FieldError messages={state.fieldErrors.steam_app_id} /></div>
          <div className="space-y-2 sm:col-span-2"><label htmlFor="genres" className="block text-sm font-semibold text-slate-200">ジャンル</label><input id="genres" name="genres" value={genres} onChange={(event) => setGenres(event.target.value)} placeholder="アクション, アドベンチャー" className={inputClassName} /></div>
          <div className="space-y-2 sm:col-span-2"><label htmlFor="header_image_url" className="block text-sm font-semibold text-slate-200">Steamヘッダー画像URL</label><input id="header_image_url" name="header_image_url" type="url" value={headerImageUrl} onChange={(event) => setHeaderImageUrl(event.target.value)} className={inputClassName} /><p className="text-pretty text-xs text-slate-500">Steam CDNのURLのみ保存し、画像ファイルは保存しません。</p><FieldError messages={state.fieldErrors.header_image_url} /></div>
        </div>
      </section>

      <section className="border border-slate-700 bg-slate-900">
        <div className="border-b border-slate-700 px-5 py-4">
          <h2 className="text-balance text-lg font-bold text-white">プレイ形式とメディア</h2>
          <p className="mt-1 text-pretty text-sm text-slate-400">Steam CDNのURLだけを保存します。スクリーンショットは最大6枚です。</p>
        </div>
        <div className="space-y-6 px-5 py-5">
          <fieldset>
            <legend className="text-sm font-semibold text-slate-200">プレイ形式</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(playModeLabels).map(([value, label]) => (
                <label key={value} className="flex min-h-11 items-center gap-3 border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  <input
                    name="play_modes"
                    type="checkbox"
                    value={value}
                    checked={playModes.includes(value)}
                    onChange={() => setPlayModes((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])}
                    className="size-5 accent-sky-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="summary" className="text-sm font-semibold text-slate-200">ゲーム概要</label>
              <span className="text-xs tabular-nums text-slate-500">{summary.length} / 200</span>
            </div>
            <textarea id="summary" name="summary" rows={4} maxLength={200} value={summary} onChange={(event) => setSummary(event.target.value)} className={inputClassName} />
            <p className="text-pretty text-xs text-amber-300">Steamの説明文は転載せず、運営が独自に作成した短い概要のみ入力してください。</p>
            <FieldError messages={state.fieldErrors.summary} />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-200">スクリーンショット</p>
              <p className="text-xs tabular-nums text-slate-500">{screenshots.length} / 6枚を選択</p>
            </div>
            {screenshotOptions.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {screenshotOptions.map((url, index) => {
                  const selected = screenshots.includes(url);
                  return (
                    <label key={url} className={`block cursor-pointer border p-2 ${selected ? "border-sky-400 bg-sky-950/40" : "border-slate-700 bg-slate-950"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Steamスクリーンショット候補 ${index + 1}`} className="aspect-video w-full object-cover" loading="lazy" />
                      <span className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                        <input type="checkbox" checked={selected} disabled={!selected && screenshots.length >= 6} onChange={() => toggleScreenshot(url)} className="size-4 accent-sky-500" />
                        {selected ? "掲載する" : "選択する"}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : <p className="mt-3 text-sm text-slate-500">Steamから取得すると候補が表示されます。</p>}
            {screenshots.map((url) => <input key={url} type="hidden" name="screenshots" value={url} />)}
            <FieldError messages={state.fieldErrors.screenshots} />
          </div>

          <input type="hidden" name="movie_url" value={movieUrl} />
          <input type="hidden" name="movie_thumbnail_url" value={movieThumbnailUrl} />
          {movieUrl ? (
            <div className="border border-slate-700 bg-slate-950 p-3">
              <p className="text-sm font-semibold text-slate-200">ムービーを取得済み</p>
              <p className="mt-1 text-pretty text-xs text-slate-500">詳細画面では再生操作が行われるまで動画本体を読み込みません。</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="border border-slate-700 bg-slate-900">
        <div className="border-b border-slate-700 px-5 py-4"><h2 className="text-balance text-lg font-bold text-white">パブリッシャー</h2></div>
        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><label htmlFor="publisher_id" className="block text-sm font-semibold text-slate-200">既存から選択</label><select id="publisher_id" name="publisher_id" value={publisherId} onChange={(event) => setPublisherId(event.target.value)} className={inputClassName}><option value="">新規作成する</option>{publishers.map((publisher) => <option key={publisher.id} value={publisher.id}>{publisher.name}</option>)}</select><FieldError messages={state.fieldErrors.publisher_id} /></div>
          {!publisherId ? <><div className="space-y-2"><label htmlFor="new_publisher_name" className="block text-sm font-semibold text-slate-200">新規パブリッシャー名</label><input id="new_publisher_name" name="new_publisher_name" value={newPublisherName} onChange={(event) => { const value = event.target.value; setNewPublisherName(value); setNewPublisherSlug(slugify(value)); }} className={inputClassName} /></div><div className="space-y-2"><label htmlFor="new_publisher_slug" className="block text-sm font-semibold text-slate-200">新規パブリッシャーslug</label><input id="new_publisher_slug" name="new_publisher_slug" value={newPublisherSlug} onChange={(event) => setNewPublisherSlug(event.target.value)} className={inputClassName} /></div></> : <><input type="hidden" name="new_publisher_name" value="" /><input type="hidden" name="new_publisher_slug" value="" /></>}
        </div>
      </section>

      <section className="border border-slate-700 bg-slate-900">
        <div className="border-b border-slate-700 px-5 py-4"><h2 className="text-balance text-lg font-bold text-white">許諾情報</h2></div>
        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatusSelect id="guideline_scope" label="ガイドライン範囲" labels={guidelineScopeLabels} defaultValue={game?.guideline_scope ?? "title_specific"} />
          <StatusSelect id="streaming_status" label="配信" labels={approvalStatusLabels} defaultValue={game?.streaming_status ?? "unknown"} />
          <StatusSelect id="monetization_status" label="収益化" labels={approvalStatusLabels} defaultValue={game?.monetization_status ?? "unknown"} />
          <StatusSelect id="spoiler_restriction" label="ネタバレ制限" labels={spoilerStatusLabels} defaultValue={game?.spoiler_restriction ?? "unknown"} />
          <StatusSelect id="music_restriction" label="音楽・BGM" labels={musicStatusLabels} defaultValue={game?.music_restriction ?? "unknown"} />
          <StatusSelect id="clip_archive_status" label="切り抜き・アーカイブ" labels={approvalStatusLabels} defaultValue={game?.clip_archive_status ?? "unknown"} />
          <StatusSelect id="prior_application" label="事前申請" labels={applicationStatusLabels} defaultValue={game?.prior_application ?? "unknown"} />
          <div className="space-y-2 lg:col-span-2"><label htmlFor="notes" className="block text-sm font-semibold text-slate-200">条件・備考</label><textarea id="notes" name="notes" rows={5} defaultValue={game?.notes ?? ""} className={inputClassName} /></div>
        </div>
      </section>

      <section className="border border-slate-700 bg-slate-900">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-700 px-5 py-4"><div><h2 className="text-balance text-lg font-bold text-white">根拠情報</h2><p className="mt-1 text-pretty text-sm text-slate-400">公式情報の要約とリンクのみ登録してください。</p></div><button type="button" onClick={() => setSources((current) => [...current, { key: crypto.randomUUID(), url: "", sourceType: "guideline", label: "", notedAt: "" }])} className="min-h-11 border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-sky-500">根拠を追加</button></div>
        <input type="hidden" name="source_count" value={sources.length} />
        <div className="divide-y divide-slate-800">
          {sources.map((source, index) => <div key={source.key} className="grid gap-4 px-5 py-5 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><label htmlFor={`source_url_${index}`} className="block text-sm font-semibold text-slate-200">根拠URL {index + 1}</label><input id={`source_url_${index}`} name={`source_url_${index}`} type="url" value={source.url} onChange={(event) => updateSource(index, { url: event.target.value })} className={inputClassName} /></div><div className="space-y-2"><label htmlFor={`source_type_${index}`} className="block text-sm font-semibold text-slate-200">種別</label><select id={`source_type_${index}`} name={`source_type_${index}`} value={source.sourceType} onChange={(event) => updateSource(index, { sourceType: event.target.value as SourceDraft["sourceType"] })} className={inputClassName}>{Object.entries(sourceTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="space-y-2"><label htmlFor={`source_noted_at_${index}`} className="block text-sm font-semibold text-slate-200">情報の日付</label><input id={`source_noted_at_${index}`} name={`source_noted_at_${index}`} type="date" value={source.notedAt} onChange={(event) => updateSource(index, { notedAt: event.target.value })} className={inputClassName} /></div><div className="space-y-2 sm:col-span-2"><label htmlFor={`source_label_${index}`} className="block text-sm font-semibold text-slate-200">表示ラベル</label><input id={`source_label_${index}`} name={`source_label_${index}`} value={source.label} onChange={(event) => updateSource(index, { label: event.target.value })} className={inputClassName} /></div>{sources.length > 1 ? <div className="sm:col-span-2"><button type="button" onClick={() => setSources((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="min-h-11 border border-slate-700 px-3 py-2 text-sm text-red-300 hover:border-red-500">この入力行を外す</button></div> : null}</div>)}
        </div>
        <div className="px-5 pb-5"><FieldError messages={state.fieldErrors.sources} /></div>
      </section>

      <section className="border border-slate-700 bg-slate-900 px-5 py-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><div className="flex items-center justify-between gap-3"><label htmlFor="last_verified_at" className="block text-sm font-semibold text-slate-200">最終確認日</label>{game ? <button type="button" onClick={() => setLastVerifiedAt(new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }))} className="text-sm font-semibold text-sky-300 underline underline-offset-4">今日にする</button> : null}</div><input id="last_verified_at" name="last_verified_at" type="date" value={lastVerifiedAt} onChange={(event) => setLastVerifiedAt(event.target.value)} className={inputClassName} /></div>
          <label className="flex min-h-11 items-center gap-3 self-end border border-slate-600 bg-slate-950 px-4 py-2 text-sm font-semibold text-white"><input name="published" type="checkbox" defaultChecked={game?.published ?? false} className="size-5 accent-sky-500" />公開する</label>
        </div>
        <p className="mt-3 text-pretty text-xs text-slate-400">公開には根拠情報1件以上と最終確認日が必要です。</p>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-700 pt-5"><Link href="/admin/games" className="inline-flex min-h-11 items-center border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-300 hover:border-slate-400 hover:text-white">キャンセル</Link><SubmitButton editing={Boolean(game)} /></div>
    </form>
  );
}
