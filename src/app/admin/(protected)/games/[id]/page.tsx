import { notFound } from "next/navigation";

import { DeleteGameButton } from "@/components/admin/delete-game-button";
import { GameForm } from "@/components/admin/game-form";
import { getAdminGame, getPublisherOptions } from "@/lib/admin-queries";

import { updateGameAction } from "../actions";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [game, publishers] = await Promise.all([getAdminGame(id), getPublisherOptions()]);
  if (!game) notFound();
  const action = updateGameAction.bind(null, game.id, game.slug);
  return <div className="mx-auto max-w-5xl"><header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-700 pb-5"><div><p className="mb-1 text-sm font-semibold text-sky-300">EDIT GAME</p><h1 className="text-balance text-3xl font-bold text-white">{game.title}</h1><p className="mt-2 text-pretty text-sm text-slate-400">許諾情報・根拠・最終確認日を更新します。</p></div><DeleteGameButton id={game.id} slug={game.slug} title={game.title} /></header><GameForm action={action} publishers={publishers} game={game} /></div>;
}
