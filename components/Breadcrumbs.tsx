import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { name: string; path?: string };

/** Accessible breadcrumb trail for SEO sub-pages. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13.5px] font-medium text-stone-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />}
              {isLast || !item.path ? (
                <span aria-current={isLast ? "page" : undefined} className="text-stone-800">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="transition hover:text-forest-800 hover:underline">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
