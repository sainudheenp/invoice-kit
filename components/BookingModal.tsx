"use client";

/**
 * Reusable booking system.
 *
 *  <BookingButton context={{ service: "Airport Transfer", pickup: "Calicut Airport", destination: "Kalpetta" }}>
 *    Check Availability
 *  </BookingButton>
 *
 * opens the global "Plan Your Ride" modal, which collects name / phone /
 * passengers (+ any missing trip details) and continues to WhatsApp.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowRight, CalendarDays, Clock, MapPin, Minus, Plus, Users, X } from "lucide-react";
import {
  buildBookingMessage,
  buildWhatsAppUrl,
  validateName,
  validatePhone,
  type BookingContext as TripContext,
} from "@/lib/whatsapp";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Provider + hook                                                     */
/* ------------------------------------------------------------------ */

type BookingUiContext = {
  openBooking: (context?: TripContext) => void;
  closeBooking: () => void;
};

const Ctx = createContext<BookingUiContext>({
  openBooking: () => {},
  closeBooking: () => {},
});

export const useBooking = () => useContext(Ctx);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<TripContext>({});

  const openBooking = useCallback((next: TripContext = {}) => {
    setContext(next);
    setIsOpen(true);
  }, []);

  const closeBooking = useCallback(() => setIsOpen(false), []);

  return (
    <Ctx.Provider value={{ openBooking, closeBooking }}>
      {children}
      <BookingModal open={isOpen} context={context} onClose={closeBooking} />
    </Ctx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* BookingButton                                                       */
/* ------------------------------------------------------------------ */

type BookingButtonProps = {
  context?: TripContext;
  children: ReactNode;
  className?: string;
  /** Extra analytics event fired together with booking_modal_open. */
  event?: string;
  ariaLabel?: string;
};

export function BookingButton({
  context = {},
  children,
  className,
  event,
  ariaLabel,
}: BookingButtonProps) {
  const { openBooking } = useBooking();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => {
        trackEvent(ANALYTICS_EVENTS.bookNowClick, {
          page: context.page,
          service: context.service,
          vehicle: context.vehicle,
        });
        trackEvent(ANALYTICS_EVENTS.bookingModalOpen, {
          page: context.page,
          service: context.service,
          vehicle: context.vehicle,
          pickup: context.pickup,
          destination: context.destination,
        });
        if (event) {
          trackEvent(event, {
            page: context.page,
            service: context.service,
            vehicle: context.vehicle,
          });
        }
        openBooking(context);
      }}
      className={className}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

const SERVICE_OPTIONS = [
  "Taxi / Cab",
  "Airport Transfer",
  "Sightseeing Trip",
  "Tempo Traveller",
  "Bus Rental",
  "Resort Transfer",
  "Outstation Trip",
];

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
      <span className="text-[15px] font-semibold text-stone-800">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition hover:border-forest-700 hover:text-forest-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span
          aria-live="polite"
          className="w-6 text-center text-[17px] font-bold tabular-nums text-stone-900"
        >
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition hover:border-forest-700 hover:text-forest-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

type BookingModalProps = {
  open: boolean;
  context: TripContext;
  onClose: () => void;
};

function BookingModal({ open, context, onClose }: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [started, setStarted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset every time the modal opens with a fresh context.
  useEffect(() => {
    if (!open) return;
    setName("");
    setPhone("");
    setAdults(context.adults && context.adults >= 1 ? context.adults : 2);
    setChildren(context.children && context.children >= 0 ? context.children : 0);
    setPickup("");
    setDestination("");
    setDate(context.date ?? "");
    setTime(context.time ?? "");
    setService("");
    setErrors({});
    setStarted(false);
    const t = window.setTimeout(() => nameRef.current?.focus(), 60);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open, context]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const markStarted = () => {
    if (!started) {
      setStarted(true);
      trackEvent(ANALYTICS_EVENTS.bookingFormStarted, {
        page: context.page,
        service: context.service ?? service,
      });
    }
  };

  const resolvedPickup = context.pickup?.trim() || pickup.trim();
  const resolvedDestination = context.destination?.trim() || destination.trim();
  const resolvedService = context.service?.trim() || service.trim();
  const resolvedDate = context.date?.trim() || date.trim();
  const resolvedTime = context.time?.trim() || time.trim();

  const showPickupInput = !context.pickup?.trim();
  const showDestinationInput = !context.destination?.trim();
  const showServiceInput = !context.service?.trim();
  const showDateInput = !context.date?.trim();

  const todayIso = new Date().toISOString().slice(0, 10);

  const submit = () => {
    const nameError = validateName(name);
    const phoneError = validatePhone(phone);
    setErrors({ name: nameError ?? undefined, phone: phoneError ?? undefined });
    if (nameError || phoneError) {
      if (nameError) nameRef.current?.focus();
      return;
    }
    const message = buildBookingMessage({
      name: name.trim(),
      phone: phone.trim(),
      adults,
      children,
      service: resolvedService || undefined,
      vehicle: context.vehicle,
      pickup: resolvedPickup || undefined,
      destination: resolvedDestination || undefined,
      date: resolvedDate || undefined,
      time: resolvedTime || undefined,
      page: context.page,
    });
    trackEvent(ANALYTICS_EVENTS.bookingFormCompleted, {
      page: context.page,
      service: resolvedService,
      vehicle: context.vehicle,
    });
    trackEvent(ANALYTICS_EVENTS.whatsappClick, {
      page: context.page,
      service: resolvedService,
      vehicle: context.vehicle,
      source: "booking_modal",
    });
    window.open(buildWhatsAppUrl(message), "_blank", "noopener");
    onClose();
  };

  const inputClass =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-[16px] text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-stone-950/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream-50 shadow-2xl sm:max-w-lg sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200/80 bg-white px-5 pt-5 pb-4 sm:px-7">
          <div>
            <p className="text-[12px] font-bold tracking-[0.14em] text-forest-700 uppercase">
              In Drive Tours
            </p>
            <h2
              id="booking-title"
              className="mt-1 text-[22px] leading-tight font-extrabold tracking-tight text-stone-900 sm:text-2xl"
            >
              Plan Your Ride
            </h2>
            <p className="mt-1 text-[14px] leading-snug text-stone-500">
              Tell us a few details and we&apos;ll help arrange your vehicle.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking form"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200 hover:text-stone-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {/* Trip summary — pre-filled from the page, never re-asked */}
          {(context.service ||
            context.vehicle ||
            context.pickup ||
            context.destination ||
            context.date) && (
            <div className="mb-5 rounded-2xl border border-forest-800/15 bg-forest-50 px-4 py-3.5">
              <p className="text-[11px] font-bold tracking-[0.12em] text-forest-800 uppercase">
                Your trip
              </p>
              <div className="mt-2 space-y-1.5 text-[14px] font-medium text-stone-800">
                {(context.service || context.vehicle) && (
                  <p>
                    {[context.service, context.vehicle].filter(Boolean).join(" · ")}
                  </p>
                )}
                {(context.pickup || context.destination) && (
                  <p className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
                    <span>
                      {context.pickup || "—"}
                      {context.destination ? ` → ${context.destination}` : ""}
                    </span>
                  </p>
                )}
                {context.date && (
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 shrink-0 text-forest-700" />
                    <span>{context.date}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {showServiceInput && (
              <div>
                <label
                  htmlFor="booking-service"
                  className="mb-1.5 block text-[14px] font-bold text-stone-800"
                >
                  What do you need?
                </label>
                <select
                  id="booking-service"
                  value={service}
                  onChange={(e) => {
                    setService(e.target.value);
                    markStarted();
                  }}
                  className={cn(inputClass, !service && "text-stone-400")}
                >
                  <option value="">Select a service (optional)</option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label
                htmlFor="booking-name"
                className="mb-1.5 block text-[14px] font-bold text-stone-800"
              >
                Your name
              </label>
              <input
                ref={nameRef}
                id="booking-name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  markStarted();
                }}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "booking-name-error" : undefined}
                className={cn(
                  inputClass,
                  errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                )}
              />
              {errors.name && (
                <p id="booking-name-error" role="alert" className="mt-1.5 text-[13px] font-medium text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="booking-phone"
                className="mb-1.5 block text-[14px] font-bold text-stone-800"
              >
                WhatsApp number
              </label>
              <input
                id="booking-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Your WhatsApp number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  markStarted();
                }}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "booking-phone-error" : "booking-phone-hint"}
                className={cn(
                  inputClass,
                  errors.phone && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                )}
              />
              {errors.phone ? (
                <p id="booking-phone-error" role="alert" className="mt-1.5 text-[13px] font-medium text-red-600">
                  {errors.phone}
                </p>
              ) : (
                <p id="booking-phone-hint" className="mt-1.5 text-[13px] text-stone-500">
                  We confirm availability and price on this number.
                </p>
              )}
            </div>

            <div>
              <span id="booking-passengers" className="mb-1.5 flex items-center gap-1.5 text-[14px] font-bold text-stone-800">
                <Users className="h-4 w-4 text-stone-500" /> Passengers
              </span>
              <div className="space-y-2.5" role="group" aria-labelledby="booking-passengers">
                <Stepper label="Adults" value={adults} min={1} max={60} onChange={(v) => { setAdults(v); markStarted(); }} />
                <Stepper label="Children" value={children} min={0} max={60} onChange={(v) => { setChildren(v); markStarted(); }} />
              </div>
            </div>

            {showPickupInput && (
              <div>
                <label htmlFor="booking-pickup" className="mb-1.5 block text-[14px] font-bold text-stone-800">
                  Pickup location
                </label>
                <input
                  id="booking-pickup"
                  type="text"
                  placeholder="e.g. Calicut Airport"
                  value={pickup}
                  onChange={(e) => {
                    setPickup(e.target.value);
                    markStarted();
                  }}
                  className={inputClass}
                />
              </div>
            )}

            {showDestinationInput && (
              <div>
                <label htmlFor="booking-destination" className="mb-1.5 block text-[14px] font-bold text-stone-800">
                  Destination
                </label>
                <input
                  id="booking-destination"
                  type="text"
                  placeholder="e.g. Kalpetta"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    markStarted();
                  }}
                  className={inputClass}
                />
              </div>
            )}

            {showDateInput && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="booking-date" className="mb-1.5 block text-[14px] font-bold text-stone-800">
                    Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    min={todayIso}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      markStarted();
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="booking-time" className="mb-1.5 flex items-center gap-1 text-[14px] font-bold text-stone-800">
                    <Clock className="h-3.5 w-3.5 text-stone-500" /> Time
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      markStarted();
                    }}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200/80 bg-white px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-wa-600 px-6 py-4 text-[16px] font-bold text-white shadow-lg shadow-wa-600/25 transition hover:bg-wa-700 active:scale-[0.99]"
          >
            <WhatsAppGlyph className="h-5 w-5" />
            Continue to WhatsApp
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-2.5 text-center text-[12.5px] leading-snug text-stone-500">
            No advance payment. Our team confirms availability and price on WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
