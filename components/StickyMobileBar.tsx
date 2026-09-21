"use client";

import { BookingButton, WhatsAppGlyph } from "./BookingModal";
import { WhatsAppLink } from "./WhatsAppLink";

/** Mobile sticky bottom bar: WhatsApp + Book Now. */
export function StickyMobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[50] border-t border-stone-200 bg-white/95 px-4 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="flex gap-2.5">
        <WhatsAppLink
          page="sticky_bar"
          ariaLabel="Chat on WhatsApp"
          className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-wa-600 px-4 py-3 text-[15px] font-bold text-wa-700"
        >
          <WhatsAppGlyph className="h-5 w-5" />
          WhatsApp
        </WhatsAppLink>
        <BookingButton
          context={{ page: "sticky_bar" }}
          className="flex-1 rounded-full bg-forest-900 px-4 py-3 text-[15px] font-bold text-white shadow-lg shadow-forest-900/25"
        >
          Book Now
        </BookingButton>
      </div>
    </div>
  );
}

/** Desktop floating WhatsApp bubble. */
export function FloatingWhatsApp() {
  return (
    <WhatsAppLink
      page="floating_button"
      ariaLabel="Chat with us on WhatsApp"
      className="fixed right-5 bottom-5 z-[50] hidden items-center gap-2.5 rounded-full bg-wa-600 py-3 pr-6 pl-4 text-[15px] font-bold text-white shadow-xl shadow-wa-700/30 transition hover:bg-wa-700 md:flex"
    >
      <WhatsAppGlyph className="h-5.5 w-5.5" />
      Chat with us
    </WhatsAppLink>
  );
}
