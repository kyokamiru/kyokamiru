import { GameForm } from "@/components/admin/game-form";
import { getPublisherOptions } from "@/lib/admin-queries";

import { createGameAction } from "../actions";

export default async function NewGamePage() {
  const publishers = await getPublisherOptions();
  return <div className="mx-auto max-w-5xl"><header className="mb-8 border-b border-slate-700 pb-5"><p className="mb-1 text-sm font-semibold text-sky-300">NEW GAME</p><h1 className="text-balance text-3xl font-bold text-white">ゲーム登録</h1><p className="mt-2 text-pretty text-sm text-slate-400">Steamの基本情報と、公式情報に基づく許諾内容を登録します。</p></header><GameForm action={createGameAction} publishers={publishers} /></div>;
}
