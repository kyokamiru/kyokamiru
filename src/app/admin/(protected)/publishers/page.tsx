import Link from "next/link";

import { getAdminPublishers } from "@/lib/admin-queries";

const savedMessages = {
  created: "パブリッシャーを登録しました。",
  updated: "パブリッシャーを更新しました。",
  deleted: "パブリッシャーを削除しました。",
} as const;

export default async function AdminPublishersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [publishers, params] = await Promise.all([
    getAdminPublishers(),
    searchParams,
  ]);
  const savedMessage =
    params.saved && params.saved in savedMessages
      ? savedMessages[params.saved as keyof typeof savedMessages]
      : null;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <p className="mb-1 text-sm font-semibold text-sky-300">PUBLISHER RECORDS</p>
          <h1 className="text-balance text-3xl font-bold text-white">パブリッシャー管理</h1>
          <p className="mt-2 text-pretty text-sm text-slate-400">包括ガイドラインと許諾ステータスの既定値を管理します。</p>
        </div>
        <Link href="/admin/publishers/new" className="inline-flex min-h-11 items-center border border-sky-400 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">
          新規登録
        </Link>
      </header>

      {savedMessage ? (
        <p role="status" className="mb-5 border-l-2 border-emerald-400 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">{savedMessage}</p>
      ) : null}

      <section className="border border-slate-700 bg-slate-900">
        {publishers.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-pretty text-slate-300">パブリッシャーがまだ登録されていません。</p>
            <Link href="/admin/publishers/new" className="mt-3 inline-block font-semibold text-sky-300 underline underline-offset-4">最初のパブリッシャーを登録する</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">表示名</th>
                  <th scope="col" className="px-5 py-3 font-semibold">slug</th>
                  <th scope="col" className="px-5 py-3 font-semibold">ガイドライン</th>
                  <th scope="col" className="px-5 py-3 font-semibold">ゲーム数</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {publishers.map((publisher) => (
                  <tr key={publisher.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{publisher.name}</p>
                      {publisher.name_en ? <p className="mt-1 text-xs text-slate-500">{publisher.name_en}</p> : null}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">{publisher.slug}</td>
                    <td className="px-5 py-4 text-slate-400">{publisher.guideline_url ? "登録済み" : "未登録"}</td>
                    <td className="px-5 py-4 tabular-nums text-slate-300">{publisher.gameCount}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/publishers/${publisher.id}`} className="font-semibold text-sky-300 underline underline-offset-4">編集</Link>
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
