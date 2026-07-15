import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

function pageHref(page: number, searchParams: PaginationProps["searchParams"]) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set("page", String(page));

  return `/games?${params.toString()}`;
}

export function Pagination({ page, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="ページネーション" className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--border-color)] pt-5">
      {page > 1 ? (
        <Link href={pageHref(page - 1, searchParams)} className="border border-[var(--border-color)] px-4 py-2 text-sm hover:border-[var(--accent-muted)] hover:text-white">
          前のページ
        </Link>
      ) : <span />}
      <p className="text-sm tabular-nums text-[var(--text-muted)]">{page} / {totalPages}</p>
      {page < totalPages ? (
        <Link href={pageHref(page + 1, searchParams)} className="border border-[var(--border-color)] px-4 py-2 text-sm hover:border-[var(--accent-muted)] hover:text-white">
          次のページ
        </Link>
      ) : <span />}
    </nav>
  );
}
