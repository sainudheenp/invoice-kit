"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, MapPin, Navigation, Users } from "lucide-react";
import { useBooking } from "./BookingModal";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

/**
 * Quick booking search — captures pickup / destination / date / passengers
 * and opens the booking modal with that context pre-filled.
 */
export function HeroSearch({ page = "home" }: { page?: string }) {
  const { openBooking } = useBooking();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState("2");

  const todayIso = new Date().toISOString().slice(0, 10);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent(ANALYTICS_EVENTS.searchSubmitted, {
      page,
      pickup: pickup.trim(),
      destination: destination.trim(),
    });
    trackEvent(ANALYTICS_EVENTS.bookingModalOpen, {
      page,
      pickup: pickup.trim(),
      destination: destination.trim(),
    });
    openBooking({
      pickup: pickup.trim() || undefined,
      destination: destination.trim() || undefined,
      date: date || undefined,
      adults: Math.max(1, parseInt(adults, 10) || 2),
      page,
    });
  };

  const field =
    "w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pr-4 pl-11 text-[15px] font-medium text-stone-900 placeholder:font-normal placeholder:text-stone-400 outline-none transition focus:border-forest-700 focus:bg-white focus:ring-2 focus:ring-forest-700/15";

  return (
    <form
      onSubmit={submit}
      className="rounded-[28px] border border-stone-200/70 bg-white/95 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur sm:p-5"
      aria-label="Find a ride"
    >
      <p className="px-1 pb-3 text-[14px] font-bold text-stone-900">
        Where are you going?
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_0.8fr_auto]">
        <label className="relative block">
          <span className="sr-only">Pickup location</span>
          <Navigation className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-forest-700" />
          <input
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Pickup location"
            autoComplete="off"
            className={field}
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Destination</span>
          <MapPin className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-forest-700" />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination"
            autoComplete="off"
            className={field}
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Travel date</span>
          <CalendarDays className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-forest-700" />
          <input
            type="date"
            value={date}
            min={todayIso}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Travel date"
            className={field}
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Passengers</span>
          <Users className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-forest-700" />
          <select
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
            aria-label="Passengers"
            className={field}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Adult" : "Adults"}
              </option>
            ))}
            <option value="8">8+ (Group)</option>
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-forest-900 px-7 py-3 text-[15px] font-bold whitespace-nowrap text-white transition hover:bg-forest-800 active:scale-[0.98] sm:col-span-2 lg:col-span-1"
        >
          Find a Ride <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
