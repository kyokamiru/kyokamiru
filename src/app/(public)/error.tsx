"use client";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-balance text-3xl font-black text-[var(--text-primary)]">情報を読み込めませんでした</h1>
      <p className="mt-4 text-pretty text-sm leading-6 text-[var(--text-muted)]">通信状況をご確認のうえ、もう一度お試しください。</p>
      <button type="button" onClick={reset} className="mt-6 min-h-10 bg-[var(--accent)] px-5 text-sm font-bold text-[var(--page-background-deep)]">再読み込み</button>
    </section>
  );
}
