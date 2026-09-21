# In Drive Tours — Wayanad Travel & Transportation

Production website for **In Drive Tours**: Wayanad taxi & cab booking, airport
transfers, sightseeing, Tempo Traveller, bus rental and resort transfers —
with **WhatsApp as the booking engine**.

> No online payment, no accounts, no fake availability. Every CTA opens the
> **Plan Your Ride** modal, which builds a structured enquiry and continues
> on WhatsApp, where the team confirms availability and price.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the real business number
npm run dev                  # http://localhost:3000
npm run build                # production build (fully static)
```

## Before launch — required

1. **WhatsApp number** — set `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local`
   (digits only, e.g. `919876543210`). This single value drives every
   booking CTA on the site. Also set `NEXT_PUBLIC_PHONE_DISPLAY`,
   `NEXT_PUBLIC_PHONE_NUMBER` and `NEXT_PUBLIC_EMAIL`.
2. **Site URL** — set `NEXT_PUBLIC_SITE_URL` (canonicals, sitemap, OG tags).
3. **Analytics (optional)** — set `NEXT_PUBLIC_GA_ID` and/or
   `NEXT_PUBLIC_GTM_ID` to enable GA4/GTM + conversion events.
4. **Images** — `public/images/` ships with AI-generated placeholders.
   Replace with real Wayanad photography (same filenames) before launch.

## Architecture

```
app/                    # App Router — all pages statically rendered
  page.tsx              # Homepage (14 sections per spec order)
  wayanad-taxi/  wayanad-cab/  airport-transfers/
  wayanad-sightseeing/  tempo-traveller/  bus-rental/
  resort-transfers/  contact/
  locations/[slug]/     # 8 unique location guides
  routes/[slug]/        # 7 unique route/transfer guides
  privacy-policy/  terms-and-conditions/  cancellation-policy/
  sitemap.ts  robots.ts  not-found.tsx
components/
  BookingModal.tsx      # BookingProvider + BookingButton + modal (the core)
  PageTemplates.tsx     # ServicePage / LocationPage / RoutePage / PageHero
  Cards.tsx             # Service / Vehicle / Location / Route cards
  SiteHeader.tsx  SiteFooter.tsx  HeroSearch.tsx  Faq.tsx
  FinalCta.tsx  StickyMobileBar.tsx  Analytics.tsx  ...
lib/
  site.ts               # CENTRAL config (numbers, URL, nav) — edit here only
  whatsapp.ts           # BookingContext, message builder, wa.me URLs, validation
  content.ts            # CONTENT SYSTEM — vehicles, services, locations, routes, FAQs
  seo.ts                # metadata + JSON-LD builders (no fabricated data)
  analytics.ts          # dataLayer event helper
```

### Adding a new SEO page

- **Location** → add an entry to `LOCATIONS` in `lib/content.ts` (unique
  intro, areas, airport/sightseeing notes, spots, FAQs). The
  `/locations/[slug]/` route, sitemap and internal links update automatically.
- **Route** → same via `ROUTES`.
- **Service** → add to `SERVICES` + a thin `app/<slug>/page.tsx` using
  `<ServicePage …/>` (see `app/wayanad-taxi/page.tsx`).

### Booking flow

`BookingButton context={…}` → modal collects name / WhatsApp number /
adults / children (+ only the trip fields not already known) → validates →
`buildBookingMessage()` → `buildWhatsAppUrl()` → opens WhatsApp in a new tab.

### Analytics events

`book_now_click`, `booking_modal_open`, `booking_form_started`,
`booking_form_completed`, `whatsapp_click` (with page/service/vehicle/route),
`airport_transfer_click`, `taxi_service_click`, `tempo_traveller_click`,
`bus_rental_click`, `sightseeing_click`, `location_page_view`,
`search_submitted` — all pushed to `dataLayer`.

## Tech

Next.js 16 (App Router, TypeScript), Tailwind CSS v4, `next/image`
(AVIF/WebP), Plus Jakarta Sans via Fontsource (offline-safe), lucide-react
icons. Zero backend — fully static, deployable to Netlify/Vercel as-is.
