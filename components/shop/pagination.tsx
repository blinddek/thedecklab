import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string>;
}

function buildPageHref(
  searchParams: Record<string, string>,
  page: number
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return `/shop${qs ? `?${qs}` : ""}`;
}

function getPageNumbers(current: number, total: number): number[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: number[] = [];
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  // Adjust window to always show 5 pages
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(total, start + 4);
    } else {
      start = Math.max(1, end - 4);
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildPageHref(searchParams, currentPage - 1)}
          className="rounded-md border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
          Previous
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page) => (
        <Link
          key={page}
          href={buildPageHref(searchParams, page)}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            page === currentPage
              ? "bg-primary text-primary-foreground"
              : "border text-foreground hover:bg-muted"
          )}
        >
          {page}
        </Link>
      ))}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageHref(searchParams, currentPage + 1)}
          className="rounded-md border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
          Next
        </span>
      )}
    </nav>
  );
}
