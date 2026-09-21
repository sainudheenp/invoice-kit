import Image from "next/image";
import { BookingButton, WhatsAppGlyph } from "./BookingModal";
import { WhatsAppLink } from "./WhatsAppLink";

export function FinalCta({ page = "final_cta" }: { page?: string }) {
  return (
    <section aria-labelledby="final-cta-title" className="relative overflow-hidden">
      <Image
        src="/images/cta-valley.jpg"
        alt="Misty Wayanad valley at sunrise"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-forest-950/70" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <p className="text-[12.5px] font-bold tracking-[0.16em] text-sun-300 uppercase">
          Limited vehicles per day
        </p>
        <h2
          id="final-cta-title"
          className="mx-auto mt-3 max-w-2xl text-[30px] leading-[1.1] font-extrabold tracking-tight text-balance text-white sm:text-[44px]"
        >
          Ready to Explore Wayanad?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/85">
          Tell us where you&apos;re going and how many people are travelling.
          We&apos;ll help arrange the right vehicle.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BookingButton
            context={{ page }}
            className="inline-flex w-full items-center justify-center rounded-full bg-sun-400 px-8 py-4 text-[16px] font-extrabold text-stone-950 shadow-xl transition hover:bg-sun-300 active:scale-[0.98] sm:w-auto"
          >
            Book a Ride
          </BookingButton>
          <WhatsAppLink
            page={page}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/70 px-8 py-[14px] text-[16px] font-bold text-white transition hover:bg-white hover:text-forest-950 sm:w-auto"
          >
            <WhatsAppGlyph className="h-5 w-5" />
            WhatsApp In Drive Tours
          </WhatsAppLink>
        </div>
        <p className="mt-5 text-[13.5px] font-medium text-white/70">
          No advance payment · Availability confirmed on WhatsApp
        </p>
      </div>
    </section>
  );
}
