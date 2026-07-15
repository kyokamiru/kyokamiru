import Link from "next/link";

import { getAdminDashboard } from "@/lib/admin-queries";

function formatDate(date: string | null) {
  if (!date) {
    return "未確認";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeZone: "Asia/Tokyo",
  }).format(
    new Date(`${date}T00:00:00+09:00`),
  );
}

export default async function AdminDashboardPage() {
  const { counts, staleGames, thresholdDate } = await getAdminDashboard();
  const stats = [
    { label: "公開ゲーム", value: counts.published, href: "/admin/games?published=true" },
    { label: "下書き", value: counts.draft, href: "/admin/games?published=false" },
    { label: "パブリッシャー", value: counts.publishers, href: "/admin/publishers" },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <p className="mb-1 text-sm font-semibold text-sky-300">OPERATIONS OVERVIEW</p>
          <h1 className="text-balance text-3xl font-bold text-white">ダッシュボード</h1>
          <p className="mt-2 text-pretty text-sm text-slate-400">
            公開状況と、公式情報の再確認が必要なゲームを確認できます。
          </p>
        </div>
        <Link
          href="/admin/games/new"
          className="inline-flex min-h-11 items-center border border-sky-400 bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-sky-500"
        >
          ゲームを登録
        </Link>
      </header>

      <section aria-labelledby="statistics-heading">
        <h2 id="statistics-heading" className="sr-only">登録状況</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="border border-slate-700 bg-slate-900 px-5 py-5 transition-colors duration-150 hover:border-sky-500"
            >
              <p className="text-sm font-semibold text-slate-400">{stat.label}</p>
              <p className="mt-3 text-4xl font-bold tabular-nums text-white">{stat.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 border border-slate-700 bg-slate-900" aria-labelledby="recheck-heading">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-700 px-5 py-4">
          <div>
            <h2 id="recheck-heading" className="text-balance text-xl font-bold text-white">要再確認</h2>
            <p className="mt-1 text-pretty text-sm text-slate-400">
              最終確認から60日以上経過した公開ゲーム（{formatDate(thresholdDate)}以前）
            </p>
          </div>
          <span className="font-semibold tabular-nums text-amber-300">{staleGames.length}件</span>
        </div>

        {staleGames.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-pretty text-slate-300">再確認が必要なゲームはありません。</p>
            <Link href="/admin/games" className="mt-3 inline-block text-sm font-semibold text-sky-300 underline underline-offset-4">
              ゲーム一覧を確認する
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">ゲーム</th>
                  <th scope="col" className="px-5 py-3 font-semibold">パブリッシャー</th>
                  <th scope="col" className="px-5 py-3 font-semibold">最終確認日</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staleGames.map((game) => (
                  <tr key={game.id}>
                    <td className="px-5 py-4 font-semibold text-white">{game.title}</td>
                    <td className="px-5 py-4 text-slate-400">{game.publishers?.name ?? "—"}</td>
                    <td className="px-5 py-4 tabular-nums text-amber-200">{formatDate(game.last_verified_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/games/${game.id}`} className="font-semibold text-sky-300 underline underline-offset-4">
                        編集する
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
