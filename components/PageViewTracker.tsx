"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsParams } from "@/lib/analytics";

/** Fires a one-off analytics event when the page mounts. */
export function PageViewTracker({ event, params }: { event: string; params?: AnalyticsParams }) {
  useEffect(() => {
    trackEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
