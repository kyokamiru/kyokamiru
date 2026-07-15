"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { approvalStatusLabels } from "@/lib/labels";
import type { Database } from "@/types/database";
import {
  type PublisherFormState,
} from "@/app/admin/(protected)/publishers/actions";

type Publisher = Database["public"]["Tables"]["publishers"]["Row"];

type PublisherFormProps = {
  action: (
    state: PublisherFormState,
    formData: FormData,
  ) => Promise<PublisherFormState>;
  publisher?: Publisher;
};

const inputClassName =
  "min-h-11 w-full border border-slate-600 bg-slate-950 px-3 py-2 text-base text-white placeholder:text-slate-600 focus:border-sky-400";
const initialPublisherFormState: PublisherFormState = {
  error: null,
  fieldErrors: {},
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return <p className="text-sm text-red-300">{messages[0]}</p>;
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 border border-sky-400 bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "保存中…" : editing ? "変更を保存" : "登録する"}
    </button>
  );
}

export function PublisherForm({ action, publisher }: PublisherFormProps) {
  const [state, formAction] = useActionState(action, initialPublisherFormState);
  const editing = Boolean(publisher);

  return (
    <form
      action={formAction}
      onReset={(event) => event.preventDefault()}
      className="space-y-7"
    >
      {state.error ? (
        <p role="alert" className="border-l-2 border-red-400 bg-red-950/50 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <section className="border border-slate-700 bg-slate-900">
        <div className="border-b border-slate-700 px-5 py-4">
          <h2 className="text-balance text-lg font-bold text-white">基本情報</h2>
        </div>
        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-200">表示名 <span className="text-red-300">必須</span></label>
            <input id="name" name="name" required defaultValue={publisher?.name ?? ""} className={inputClassName} />
            <FieldError messages={state.fieldErrors.name} />
          </div>
          <div className="space-y-2">
            <label htmlFor="name_en" className="block text-sm font-semibold text-slate-200">英語名</label>
            <input id="name_en" name="name_en" defaultValue={publisher?.name_en ?? ""} className={inputClassName} />
            <FieldError messages={state.fieldErrors.name_en} />
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-semibold text-slate-200">slug <span className="text-red-300">必須</span></label>
            <input id="slug" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={publisher?.slug ?? ""} className={inputClassName} />
            <p className="text-pretty text-xs text-slate-500">英小文字・数字・ハイフンのみ</p>
            <FieldError messages={state.fieldErrors.slug} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="official_site_url" className="block text-sm font-semibold text-slate-200">公式サイトURL</label>
            <input id="official_site_url" name="official_site_url" type="url" defaultValue={publisher?.official_site_url ?? ""} className={inputClassName} />
            <FieldError messages={state.fieldErrors.official_site_url} />
          </div>
        </div>
      </section>

      <section className="border border-slate-700 bg-slate-900">
        <div className="border-b border-slate-700 px-5 py-4">
          <h2 className="text-balance text-lg font-bold text-white">包括ガイドライン</h2>
          <p className="mt-1 text-pretty text-sm text-slate-400">本文を転載せず、運営が確認した要点だけを記録してください。</p>
        </div>
        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="guideline_url" className="block text-sm font-semibold text-slate-200">ガイドラインURL</label>
            <input id="guideline_url" name="guideline_url" type="url" defaultValue={publisher?.guideline_url ?? ""} className={inputClassName} />
            <FieldError messages={state.fieldErrors.guideline_url} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="guideline_summary" className="block text-sm font-semibold text-slate-200">要約</label>
            <textarea id="guideline_summary" name="guideline_summary" rows={6} defaultValue={publisher?.guideline_summary ?? ""} className={inputClassName} />
            <FieldError messages={state.fieldErrors.guideline_summary} />
          </div>
          {(["default_streaming_status", "default_monetization_status"] as const).map((field) => (
            <div key={field} className="space-y-2">
              <label htmlFor={field} className="block text-sm font-semibold text-slate-200">
                {field === "default_streaming_status" ? "配信の既定値" : "収益化の既定値"}
              </label>
              <select id={field} name={field} defaultValue={publisher?.[field] ?? ""} className={inputClassName}>
                <option value="">既定値なし</option>
                {Object.entries(approvalStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <FieldError messages={state.fieldErrors[field]} />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-700 pt-5">
        <Link href="/admin/publishers" className="inline-flex min-h-11 items-center border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-300 hover:border-slate-400 hover:text-white">
          キャンセル
        </Link>
        <SubmitButton editing={editing} />
      </div>
    </form>
  );
}
