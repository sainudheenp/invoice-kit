"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Faq as FaqItem } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Accessible accordion FAQ section. */
export function Faq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-stone-200 rounded-3xl border border-stone-200 bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${index}`}
                id={`faq-button-${index}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7"
              >
                <span className="text-[16px] font-bold text-stone-900 sm:text-[17px]">
                  {item.question}
                </span>
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition",
                    isOpen ? "bg-forest-900 text-white" : "bg-stone-100 text-stone-600"
                  )}
                >
                  <Plus
                    className={cn("h-4 w-4 transition-transform", isOpen && "rotate-45")}
                  />
                </span>
              </button>
            </h3>
            <div
              id={`faq-panel-${index}`}
              role="region"
              aria-labelledby={`faq-button-${index}`}
              className={cn(
                "grid transition-all duration-200 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-6 text-[15px] leading-relaxed text-stone-600 sm:px-7">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
