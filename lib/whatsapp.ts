/**
 * WhatsApp booking engine.
 *
 * Single source of truth for:
 *  - BookingContext / BookingDetails types
 *  - phone validation
 *  - booking message generation
 *  - wa.me URL building
 *
 * No other file should build WhatsApp URLs or messages by hand.
 */

import { SITE } from "./site";

export type BookingContext = {
  service?: string;
  vehicle?: string;
  pickup?: string;
  destination?: string;
  date?: string;
  time?: string;
  adults?: number;
  children?: number;
  page?: string;
};

export type BookingDetails = {
  name: string;
  phone: string;
  adults: number;
  children: number;
} & BookingContext;

/** Basic phone validation: 7–15 digits, optional leading +. */
export function validatePhone(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "Please enter a WhatsApp number.";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return "Please enter a valid WhatsApp number.";
  }
  if (!/^\+?[0-9][0-9\s\-()]*$/.test(value)) {
    return "Please enter a valid WhatsApp number.";
  }
  return null;
}

export function validateName(raw: string): string | null {
  if (!raw.trim()) return "Please enter your name.";
  if (raw.trim().length < 2) return "Please enter your name.";
  return null;
}

/** "2026-09-25" -> "25 September 2026" (timezone-safe). */
export function formatDateForMessage(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return iso.trim();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const day = parseInt(match[3], 10);
  const month = months[parseInt(match[2], 10) - 1] ?? "";
  return `${day} ${month} ${match[1]}`;
}

/** "10:30" -> "10:30 AM". Passes through anything already formatted. */
export function formatTimeForMessage(raw: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(raw.trim());
  if (!match) return raw.trim();
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${suffix}`;
}

function line(label: string, value: string | number | undefined): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return `${label}: ${text}`;
}

/**
 * Build the natural, professional enquiry message.
 * Missing information is omitted — never "undefined" or "N/A".
 */
export function buildBookingMessage(details: BookingDetails): string {
  const lines: string[] = [
    "Hello In Drive Tours,",
    "",
    "I would like to enquire/book a vehicle.",
    "",
  ];

  const push = (value: string | null) => {
    if (value) lines.push(value);
  };

  push(line("Name", details.name));
  push(line("WhatsApp", details.phone));
  lines.push("");
  push(line("Adults", details.adults));
  push(line("Children", details.children));
  lines.push("");

  push(line("Service", details.service));
  push(line("Vehicle", details.vehicle));
  push(line("Pickup", details.pickup));
  push(line("Destination", details.destination));
  if (details.date?.trim()) {
    push(line("Travel Date", formatDateForMessage(details.date)));
  }
  if (details.time?.trim()) {
    push(line("Preferred Time", formatTimeForMessage(details.time)));
  }
  if (details.page?.trim()) {
    push(line("Page", details.page));
  }

  lines.push("");
  lines.push("I found this through your website.");
  lines.push("");
  lines.push("Please confirm availability and the price.");
  lines.push("");
  lines.push("Thank you.");

  return lines.join("\n");
}

/** Build the wa.me deep link for a pre-filled message. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Simple enquiry link (no booking details yet). */
export function buildSimpleEnquiryUrl(topic?: string): string {
  const message = topic
    ? `Hello In Drive Tours,\n\nI found your website and would like to enquire about: ${topic}.\n\nPlease share the details.\n\nThank you.`
    : "Hello In Drive Tours,\n\nI found your website and would like to enquire about a vehicle.\n\nThank you.";
  return buildWhatsAppUrl(message);
}
