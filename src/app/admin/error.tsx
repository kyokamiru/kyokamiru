"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <section className="w-full max-w-lg border border-slate-700 bg-slate-900 p-6 text-center shadow-xl">
        <p className="text-sm font-semibold text-red-300">OPERATION FAILED</p>
        <h1 className="mt-2 text-balance text-2xl font-bold text-white">管理画面でエラーが発生しました</h1>
        <p className="mt-3 text-pretty text-sm text-slate-400">処理を完了できませんでした。接続状況を確認して、もう一度お試しください。</p>
        <button type="button" onClick={reset} className="mt-6 min-h-11 border border-sky-400 bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500">再試行する</button>
      </section>
    </main>
  );
}
