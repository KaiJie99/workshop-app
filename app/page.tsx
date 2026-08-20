import Link from "next/link";
import Image from "next/image";
import BrandHeader from "@/components/BrandHeader";
import { brand } from "@/lib/config/brand";

// ─────────────────────────────────────────────────────────────
// HOMEPAGE CONTENT — safe to customize in Module 4.
// Edit the words below, or reorder the sections in SECTION_ORDER.
// ─────────────────────────────────────────────────────────────

const headline = "Track spending. Grow your savings.";
const subcopy =
  "PocketGoals keeps your income, expenses and saving goals in one private place — with a colourful overview that shows exactly where your money goes.";

const howItWorks = [
  {
    emoji: "💸",
    title: "1. Log income & expenses",
    text: "Add what comes in and what goes out, with categories and notes.",
    from: "#d1fae5",
    accent: "#0f766e",
  },
  {
    emoji: "🎯",
    title: "2. Set saving goals",
    text: "Create goals and link expenses to watch each progress bar fill up.",
    from: "#dbeafe",
    accent: "#2563eb",
  },
  {
    emoji: "📊",
    title: "3. See the overview",
    text: "A live chart shows your balance and how much you've saved.",
    from: "#f3e8ff",
    accent: "#7c3aed",
  },
];

// Reorder these to change the page layout (Module 4 layout edit).
const SECTION_ORDER = ["hero", "how-it-works", "cta"] as const;

// ─────────────────────────────────────────────────────────────

type SectionId = (typeof SECTION_ORDER)[number];

const sections: Record<SectionId, React.ReactNode> = {
  hero: (
    <section key="hero" className="px-4 py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <div className="pg-fade-up text-center md:text-left">
          {brand.showWorkshopBadge && (
            <span className="mb-4 inline-block rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-xs font-medium text-teal-700 shadow-sm">
              ✨ KaiJie
            </span>
          )}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="pg-gradient-text">{headline}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 md:mx-0">
            {subcopy}
          </p>
          <p className="mt-3 text-sm font-semibold" style={{ color: brand.primaryColor }}>
            {brand.tagline}
          </p>
          <div className="mt-8 flex justify-center gap-3 md:justify-start">
            <Link
              href="/signup"
              className="pg-gradient-btn rounded-xl px-6 py-3 font-semibold text-white shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-gray-300 bg-white/70 px-6 py-3 font-semibold text-gray-700 transition hover:bg-white"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <Image
            src="/hero-illustration.svg"
            alt="Illustration of savings growth"
            width={440}
            height={360}
            className="pg-float w-full max-w-sm"
            priority
          />
        </div>
      </div>
    </section>
  ),
  "how-it-works": (
    <section key="how-it-works" className="px-4 py-12">
      <h2 className="text-center text-3xl font-bold">
        How <span className="pg-gradient-text">it works</span>
      </h2>
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
        {howItWorks.map((step) => (
          <div
            key={step.title}
            className="pg-card rounded-2xl p-6 transition hover:-translate-y-1"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{ backgroundColor: step.from }}
            >
              {step.emoji}
            </div>
            <h3 className="mt-4 font-bold" style={{ color: step.accent }}>
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  ),
  cta: (
    <section key="cta" className="px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 p-10 text-center shadow-xl">
        <h2 className="text-3xl font-bold text-white">Ready to start saving?</h2>
        <p className="mx-auto mt-3 max-w-md text-teal-50">
          Create your free account and take control of your money in minutes.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-teal-700 shadow-md transition hover:-translate-y-0.5"
          >
            Create your account
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  ),
};

export default function HomePage() {
  return (
    <div className="pg-gradient-bg min-h-screen">
      <BrandHeader />
      <main>{SECTION_ORDER.map((id) => sections[id])}</main>
      <footer className="border-t border-white/40 px-4 py-6 text-center text-sm text-gray-500">
        {brand.name} — {brand.tagline}
      </footer>
    </div>
  );
}
