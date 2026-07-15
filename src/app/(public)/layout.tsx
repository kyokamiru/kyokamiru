import type { ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--page-background)]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
