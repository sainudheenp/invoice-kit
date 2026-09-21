import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
      <p className="text-[13px] font-bold tracking-[0.16em] text-forest-700 uppercase">
        Wrong turn
      </p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
        This road doesn&apos;t exist
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[16px] text-stone-600">
        The page you&apos;re looking for moved or never existed. Let&apos;s get
        you back to planning your Wayanad trip.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-forest-900 px-8 py-3.5 text-[15px] font-bold text-white transition hover:bg-forest-800"
        >
          Back to Home
        </Link>
        <Link
          href="/wayanad-taxi/"
          className="rounded-full border-2 border-forest-900 px-8 py-3 text-[15px] font-bold text-forest-900 transition hover:bg-forest-900 hover:text-white"
        >
          Wayanad Taxi
        </Link>
      </div>
    </div>
  );
}
