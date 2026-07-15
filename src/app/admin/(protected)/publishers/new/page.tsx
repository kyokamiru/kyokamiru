import { PublisherForm } from "@/components/admin/publisher-form";

import { createPublisherAction } from "../actions";

export default function NewPublisherPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 border-b border-slate-700 pb-5">
        <p className="mb-1 text-sm font-semibold text-sky-300">NEW PUBLISHER</p>
        <h1 className="text-balance text-3xl font-bold text-white">パブリッシャー登録</h1>
        <p className="mt-2 text-pretty text-sm text-slate-400">公開情報と包括ガイドラインの既定値を登録します。</p>
      </header>
      <PublisherForm action={createPublisherAction} />
    </div>
  );
}
