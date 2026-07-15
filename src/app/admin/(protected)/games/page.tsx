import Link from "next/link";

import { getAdminGames, type AdminGameFilters } from "@/lib/admin-queries";

const savedMessages = {
  created: "ゲームを登録しました。",
  updated: "ゲームを更新しました。",
  deleted: "ゲームを削除しました。",
} as const;

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "medium",
        timeZone: "Asia/Tokyo",
      }).format(new Date(`${value}T00:00:00+09:00`))
    : "未確認";
}

export default async function AdminGamesPage({ searchParams }: { searchParams: Promise<{ published?: string; verification?: string; saved?: string }> }) {
  const params = await searchParams;
  const filters: AdminGameFilters = {
    published: params.published === "true" || params.published === "false" ? params.published : undefined,
    verification: params.verification === "stale" || params.verification === "current" || params.verification === "missing" ? params.verification : undefined,
  };
  const { games } = await getAdminGames(filters);
  const savedMessage = params.saved && params.saved in savedMessages ? savedMessages[params.saved as keyof typeof savedMessages] : null;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-700 pb-5">
        <div><p className="mb-1 text-sm font-semibold text-sky-300">GAME RECORDS</p><h1 className="text-balance text-3xl font-bold text-white">ゲーム管理</h1><p className="mt-2 text-pretty text-sm text-slate-400">下書きを含む全ゲームと公式情報の確認状況を管理します。</p></div>
        <Link href="/admin/games/new" className="inline-flex min-h-11 items-center border border-sky-400 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">新規登録</Link>
      </header>
      {savedMessage ? <p role="status" className="mb-5 border-l-2 border-emerald-400 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">{savedMessage}</p> : null}

      <form className="mb-5 grid gap-3 border border-slate-700 bg-slate-900 p-4 sm:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-2"><label htmlFor="published" className="block text-sm font-semibold text-slate-300">公開状態</label><select id="published" name="published" defaultValue={filters.published ?? ""} className="min-h-11 w-full border border-slate-600 bg-slate-950 px-3 text-white"><option value="">すべて</option><option value="true">公開</option><option value="false">下書き</option></select></div>
        <div className="space-y-2"><label htmlFor="verification" className="block text-sm font-semibold text-slate-300">最終確認日</label><select id="verification" name="verification" defaultValue={filters.verification ?? ""} className="min-h-11 w-full border border-slate-600 bg-slate-950 px-3 text-white"><option value="">すべて</option><option value="stale">60日以上前</option><option value="current">60日以内</option><option value="missing">未確認</option></select></div>
        <button type="submit" className="min-h-11 self-end border border-slate-500 px-4 py-2 text-sm font-semibold text-white hover:border-sky-400">絞り込む</button>
      </form>

      <section className="border border-slate-700 bg-slate-900">
        {games.length === 0 ? <div className="px-5 py-12 text-center"><p className="text-pretty text-slate-300">条件に一致するゲームがありません。</p><Link href="/admin/games/new" className="mt-3 inline-block font-semibold text-sky-300 underline underline-offset-4">ゲームを登録する</Link></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-950 text-slate-400"><tr><th scope="col" className="px-5 py-3 font-semibold">ゲーム</th><th scope="col" className="px-5 py-3 font-semibold">パブリッシャー</th><th scope="col" className="px-5 py-3 font-semibold">状態</th><th scope="col" className="px-5 py-3 font-semibold">最終確認日</th><th scope="col" className="px-5 py-3 text-right font-semibold">操作</th></tr></thead><tbody className="divide-y divide-slate-800">{games.map((game) => <tr key={game.id}><td className="px-5 py-4"><p className="font-semibold text-white">{game.title}</p><p className="mt-1 font-mono text-xs text-slate-500">{game.slug}</p></td><td className="px-5 py-4 text-slate-400">{game.publishers?.name ?? "—"}</td><td className="px-5 py-4"><span className={game.published ? "text-emerald-300" : "text-slate-400"}>{game.published ? "公開" : "下書き"}</span></td><td className="px-5 py-4 tabular-nums text-slate-300">{formatDate(game.last_verified_at)}</td><td className="px-5 py-4 text-right"><Link href={`/admin/games/${game.id}`} className="font-semibold text-sky-300 underline underline-offset-4">編集</Link></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
