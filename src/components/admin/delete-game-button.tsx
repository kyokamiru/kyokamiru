"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteGameAction,
  type DeleteGameState,
} from "@/app/admin/(protected)/games/actions";

const initialState: DeleteGameState = { error: null };

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="min-h-11 border border-red-400 bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">{pending ? "削除中…" : "削除する"}</button>;
}

export function DeleteGameButton({ id, slug, title }: { id: string; slug: string; title: string }) {
  const action = deleteGameAction.bind(null, id, slug);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="min-h-11 border border-red-500 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/60">削除</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-black/70" />
        <AlertDialog.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 [padding-bottom:max(1rem,env(safe-area-inset-bottom))] [padding-top:max(1rem,env(safe-area-inset-top))]">
          <AlertDialog.Popup className="w-full max-w-md border border-slate-600 bg-slate-900 p-6 shadow-xl">
            <AlertDialog.Title className="text-balance text-xl font-bold text-white">ゲームを削除しますか？</AlertDialog.Title>
            <AlertDialog.Description className="mt-3 text-pretty text-sm text-slate-300">「{title}」と紐づく根拠情報を削除します。この操作は取り消せません。</AlertDialog.Description>
            <form action={formAction} className="mt-6">
              {state.error ? <p role="alert" className="mb-4 border-l-2 border-red-400 bg-red-950/50 px-3 py-2 text-sm text-red-200">{state.error}</p> : null}
              <div className="flex justify-end gap-3"><AlertDialog.Close className="min-h-11 border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white">キャンセル</AlertDialog.Close><DeleteSubmitButton /></div>
            </form>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
