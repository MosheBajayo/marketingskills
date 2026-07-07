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
    "Book a free 30-minute strategy call. Share your website, scale, and biggest bottleneck to get a tailored preview of high-leverage experiments.",
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
    body: "Leave with concrete, high-leverage tests I'd run first.",
  },
  {
    icon: ShieldCheck,
    title: "Zero pressure",
    body: "If we're not a fit, I'll point you to someone who is.",
  },
];

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-signal-500/10 blur-[130px]" />

      <Container className="relative py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Left: pitch */}
          <div>
            <Reveal>
              <Badge>Free 30-minute strategy call</Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Let&apos;s find your next{" "}
                <span className="gradient-text">growth lever</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-slate-400">
                Tell me a little about your business and where it hurts. The
                more detail you share, the more tailored your call will be.
              </p>
            </Reveal>

            <div className="mt-10 space-y-5">
              {perks.map((perk, i) => (
                <Reveal key={perk.title} delay={0.12 + i * 0.07}>
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink-600 bg-ink-800 text-signal-400">
                      <perk.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {perk.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">
                        {perk.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.35}>
              <div className="mt-10 rounded-2xl border border-ink-700/70 bg-ink-900/50 p-5 backdrop-blur">
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="h-4 w-4 text-signal-400" />
                  Prefer to grab a time directly?
                </p>
                <a
                  href={site.calendarUrl}
                  className="mt-2 inline-block text-sm font-medium text-signal-300 hover:text-signal-200"
                >
                  Open the booking calendar →
                </a>
                <p className="mt-3 text-xs text-slate-600">
                  Or email{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-slate-400 underline underline-offset-2 hover:text-white"
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
