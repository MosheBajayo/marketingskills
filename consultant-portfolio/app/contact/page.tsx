import type { Metadata } from "next";
import { Calendar, Clock, MessageSquare, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { ContactForm } from "@/components/sections/ContactForm";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Book a Strategy Audit",
  description:
    "Book a free 30-minute strategy call with Bajayo Growth. Share your website, scale, and biggest bottleneck to get a tailored preview of high-leverage experiments.",
};

const perks = [
  {
    icon: Clock,
    title: "30 focused minutes",
    body: "A tight, no-fluff call to understand your funnel and goals.",
  },
  {
    icon: MessageSquare,
    title: "Three experiment ideas",
    body: "Leave with concrete, high-leverage tests we'd run first.",
  },
  {
    icon: ShieldCheck,
    title: "Zero pressure",
    body: "If we're not a fit, we'll point you to someone who is.",
  },
];

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
      <div className="pointer-events-none absolute -right-40 -top-20 h-96 w-96 rounded-full bg-volt-500/10 blur-[150px]" />

      <Container className="relative py-20 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Left: pitch */}
          <div>
            <Reveal>
              <Badge>Free 30-minute strategy call</Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-8 font-display text-5xl font-bold uppercase leading-[0.9] tracking-tightest text-white sm:text-6xl">
                Let&apos;s find your next{" "}
                <span className="text-volt-500">growth lever</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-neutral-400">
                Tell us a little about your business and where it hurts. The
                more detail you share, the more tailored your call will be.
              </p>
            </Reveal>

            <div className="mt-12 border-t border-white/10">
              {perks.map((perk, i) => (
                <Reveal key={perk.title} delay={0.12 + i * 0.06}>
                  <div className="flex items-start gap-5 border-b border-white/10 py-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-volt-500/40 text-volt-500">
                      <perk.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold uppercase tracking-tight text-white">
                        {perk.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                        {perk.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.32}>
              <div className="mt-10 border border-white/10 bg-carbon-900 p-6">
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-neutral-400">
                  <Calendar className="h-4 w-4 text-volt-500" />
                  Prefer to grab a time directly?
                </p>
                <a
                  href={site.calendarUrl}
                  className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.15em] text-volt-500 hover:text-volt-300"
                >
                  Open the booking calendar →
                </a>
                <p className="mt-4 text-xs text-neutral-600">
                  Or email{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-neutral-400 underline underline-offset-2 hover:text-white"
                  >
                    {site.email}
                  </a>
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal delay={0.1}>
            <div id="book">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
