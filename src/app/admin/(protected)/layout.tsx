import Link from "next/link";
import type { ReactNode } from "react";

import { requireAdminUser } from "@/lib/auth";

import { logoutAction } from "./actions";

const navigation = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/games", label: "ゲーム管理" },
  { href: "/admin/publishers", label: "パブリッシャー管理" },
] as const;

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdminUser();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-slate-700 bg-slate-950 lg:min-h-dvh lg:border-r lg:border-b-0">
        <div className="border-b border-slate-700 px-5 py-5">
          <Link href="/admin" className="block font-bold text-white">
            キョカミル管理
          </Link>
          <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>
        </div>

        <nav aria-label="管理画面ナビゲーション" className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block shrink-0 border-l-2 border-transparent px-3 py-2.5 text-sm font-semibold text-slate-300 transition-colors duration-150 hover:border-sky-400 hover:bg-slate-900 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 lg:mt-8">
          <form action={logoutAction}>
            <button
              type="submit"
              className="min-h-11 w-full border border-slate-700 px-3 py-2 text-left text-sm text-slate-400 transition-colors duration-150 hover:border-slate-500 hover:text-white"
            >
              ログアウト
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</main>
    </div>
  );
}
