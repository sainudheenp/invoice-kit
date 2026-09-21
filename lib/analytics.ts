/**
 * Lightweight analytics helper.
 *
 * Events are pushed to `window.dataLayer` (works with both GA4 via gtag
 * and Google Tag Manager). Safe to call when no analytics is configured.
 */

export const ANALYTICS_EVENTS = {
  bookNowClick: "book_now_click",
  bookingModalOpen: "booking_modal_open",
  bookingFormStarted: "booking_form_started",
  bookingFormCompleted: "booking_form_completed",
  whatsappClick: "whatsapp_click",
  airportTransferClick: "airport_transfer_click",
  taxiServiceClick: "taxi_service_click",
  tempoTravellerClick: "tempo_traveller_click",
  busRentalClick: "bus_rental_click",
  sightseeingClick: "sightseeing_click",
  locationPageView: "location_page_view",
  searchSubmitted: "search_submitted",
} as const;

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    const clean: Record<string, unknown> = { event };
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") clean[key] = value;
    }
    window.dataLayer.push(clean);
    if (typeof window.gtag === "function") {
      window.gtag("event", event, clean);
    }
  } catch {
    // Analytics must never break the booking flow.
  }
}
