"use client";

/**
 * Tracked WhatsApp anchor — for plain "WhatsApp Us" CTAs
 * (the booking modal handles its own WhatsApp handoff).
 */

import type { ReactNode } from "react";
import { buildSimpleEnquiryUrl } from "@/lib/whatsapp";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

type WhatsAppLinkProps = {
  children: ReactNode;
  className?: string;
  topic?: string;
  page?: string;
  ariaLabel?: string;
};

export function WhatsAppLink({ children, className, topic, page, ariaLabel }: WhatsAppLinkProps) {
  return (
    <a
      href={buildSimpleEnquiryUrl(topic)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={() =>
        trackEvent(ANALYTICS_EVENTS.whatsappClick, {
          page,
          service: topic,
          source: "direct_link",
        })
      }
      className={className}
    >
      {children}
    </a>
  );
}
