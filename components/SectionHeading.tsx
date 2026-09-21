import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  link?: { label: string; href: string };
  dark?: boolean;
};

/** Eyebrow + H2 + lede pattern used across every section. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  link,
  dark = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start"
      )}
    >
      <p
        className={cn(
          "text-[12.5px] font-bold tracking-[0.16em] uppercase",
          dark ? "text-sun-300" : "text-forest-700"
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "max-w-2xl text-[28px] leading-[1.12] font-extrabold tracking-tight text-balance sm:text-[36px]",
          dark ? "text-cream-50" : "text-stone-900",
          align === "center" && "mx-auto"
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={cn(
            "max-w-2xl text-[16px] leading-relaxed text-pretty",
            dark ? "text-stone-300" : "text-stone-600",
            align === "center" && "mx-auto"
          )}
        >
          {lede}
        </p>
      )}
      {link && (
        <Link
          href={link.href}
          className={cn(
            "group mt-1 inline-flex items-center gap-1.5 text-[15px] font-bold",
            dark ? "text-sun-300" : "text-forest-800 hover:text-forest-700"
          )}
        >
          {link.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
