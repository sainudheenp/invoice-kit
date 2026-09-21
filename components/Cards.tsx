import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, Luggage, Route as RouteIcon, Users } from "lucide-react";
import type { LocationInfo, RouteInfo, Service, Vehicle } from "@/lib/content";
import { BookingButton } from "./BookingModal";

/* ------------------------------------------------------------------ */
/* ServiceCard                                                         */
/* ------------------------------------------------------------------ */

export function ServiceCard({ service, page }: { service: Service; page: string }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.25)]">
      <Link
        href={service.href}
        className="relative block aspect-[16/10] overflow-hidden"
        aria-label={`${service.name} — view details`}
        tabIndex={-1}
      >
        <Image
          src={service.image}
          alt={service.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-[19px] font-extrabold tracking-tight text-stone-900">
          <Link href={service.href} className="transition hover:text-forest-800">
            {service.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-stone-600">{service.short}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {service.points.map((point) => (
            <li
              key={point}
              className="rounded-full bg-forest-50 px-2.5 py-1 text-[12px] font-semibold text-forest-900"
            >
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-3 border-t border-stone-100 pt-4">
          <BookingButton
            context={{ service: service.name, page }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-forest-900 px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-forest-800"
          >
            Enquire Now
          </BookingButton>
          <Link
            href={service.href}
            aria-label={`Learn more about ${service.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition hover:border-forest-800 hover:text-forest-800"
          >
            <ArrowUpRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* VehicleCard                                                         */
/* ------------------------------------------------------------------ */

export function VehicleCard({ vehicle, page }: { vehicle: Vehicle; page: string }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.25)]">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={vehicle.image}
          alt={vehicle.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-stone-950/75 px-3 py-1 text-[12px] font-bold text-white backdrop-blur">
          {vehicle.capacity}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[18px] font-extrabold tracking-tight text-stone-900">
          {vehicle.name}
        </h3>
        <p className="mt-0.5 text-[13.5px] font-semibold text-forest-800">{vehicle.tagline}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-stone-600">{vehicle.description}</p>
        <div className="mt-3 space-y-1.5 text-[13px] font-medium text-stone-600">
          <p className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-forest-700" /> {vehicle.capacity}
          </p>
          <p className="flex items-center gap-1.5">
            <Luggage className="h-3.5 w-3.5 text-forest-700" /> {vehicle.luggage}
          </p>
        </div>
        <BookingButton
          context={{ service: "Vehicle Booking", vehicle: vehicle.name, page }}
          ariaLabel={`Book ${vehicle.name}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border-2 border-forest-900 px-4 py-2.5 text-[14px] font-bold text-forest-900 transition hover:bg-forest-900 hover:text-white"
        >
          Book This Vehicle
        </BookingButton>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* LocationCard (image overlay)                                        */
/* ------------------------------------------------------------------ */

export function LocationCard({ location }: { location: LocationInfo }) {
  return (
    <Link
      href={`/locations/${location.slug}/`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[3/3.4]"
      aria-label={`${location.name} taxi guide`}
    >
      <Image
        src={location.heroImage}
        alt={location.heroAlt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" aria-hidden="true" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-5">
        <span>
          <span className="block text-[18px] font-extrabold tracking-tight text-white sm:text-[20px]">
            {location.name}
          </span>
          <span className="mt-0.5 block text-[12.5px] font-semibold text-white/80">
            Taxi & cabs
          </span>
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-sun-400 group-hover:text-stone-950">
          <ArrowRight className="h-4 w-4" />
        </span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* RouteCard                                                           */
/* ------------------------------------------------------------------ */

export function RouteCard({ route, page }: { route: RouteInfo; page: string }) {
  return (
    <article className="flex flex-col rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.12)] sm:p-6">
      <div className="flex items-center gap-2 text-forest-800">
        <RouteIcon className="h-4.5 w-4.5" />
        <p className="text-[12.5px] font-bold tracking-[0.1em] uppercase">Airport transfer</p>
      </div>
      <h3 className="mt-2 text-[19px] leading-snug font-extrabold tracking-tight text-stone-900">
        <Link href={`/routes/${route.slug}/`} className="transition hover:text-forest-800">
          {route.from} <span className="text-forest-700">→</span> {route.to}
        </Link>
      </h3>
      <p className="mt-2 flex items-center gap-1.5 text-[13.5px] font-medium text-stone-600">
        <Clock3 className="h-4 w-4 text-stone-400" /> {route.duration}
      </p>
      <div className="mt-4 flex gap-2.5 border-t border-stone-100 pt-4">
        <BookingButton
          context={{
            service: "Airport Transfer",
            pickup: route.from,
            destination: route.to,
            page,
          }}
          event="airport_transfer_click"
          className="flex-1 rounded-full bg-forest-900 px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-forest-800"
        >
          Check Availability
        </BookingButton>
        <Link
          href={`/routes/${route.slug}/`}
          className="rounded-full border border-stone-300 px-4 py-2.5 text-[14px] font-bold text-stone-700 transition hover:border-forest-800 hover:text-forest-800"
        >
          Details
        </Link>
      </div>
    </article>
  );
}
