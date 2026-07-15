"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full border border-sky-400 bg-sky-600 px-5 py-2.5 font-semibold text-white transition-colors duration-150 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "確認中…" : "ログイン"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-11 w-full border border-slate-600 bg-slate-950 px-3 py-2 text-base text-white placeholder:text-slate-600 focus:border-sky-400"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-slate-200">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-11 w-full border border-slate-600 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400"
        />
      </div>

      {state.error ? (
        <p role="alert" className="border-l-2 border-red-400 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
