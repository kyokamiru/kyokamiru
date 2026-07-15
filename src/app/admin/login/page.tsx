import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth";

import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const user = await getAdminUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <section className="w-full max-w-md border border-slate-700 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-700 bg-slate-800 px-6 py-5">
          <p className="mb-1 text-sm font-semibold text-sky-300">KYOKAMIRU OPERATIONS</p>
          <h1 className="text-balance text-2xl font-bold text-white">管理画面ログイン</h1>
        </div>
        <div className="px-6 py-6">
          <p className="mb-6 text-pretty text-sm text-slate-400">
            運営アカウントのメールアドレスとパスワードを入力してください。
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
