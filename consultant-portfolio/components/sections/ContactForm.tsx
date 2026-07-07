"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { bottlenecks } from "@/lib/content";
import { cn } from "@/lib/utils";

type FormState = "idle" | "submitting" | "success";

const fieldBase =
  "w-full rounded-xl border border-ink-600 bg-ink-850/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-signal-500/60 focus:outline-none focus:ring-2 focus:ring-signal-500/25";

const labelBase = "mb-2 block text-sm font-medium text-slate-300";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    // Simulated submission. Wire this to your form backend, CRM,
    // or email service (e.g. Resend, Formspree, HubSpot).
    setTimeout(() => setState("success"), 900);
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-signal-500/40 bg-ink-900/60 p-10 text-center backdrop-blur">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-signal-500/15 text-signal-400">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-xl font-semibold text-white">
          Request received
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
          Thanks — I&apos;ll review your funnel and reply within one business
          day with next steps and a proposed time to talk.
        </p>
        <Button
          onClick={() => setState("idle")}
          variant="secondary"
          className="mt-6"
        >
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-ink-700/70 bg-ink-900/60 p-6 backdrop-blur sm:p-8"
    >
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelBase}>
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jane Doe"
              className={fieldBase}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelBase}>
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="jane@company.com"
              className={fieldBase}
            />
          </div>
        </div>

        <div>
          <label htmlFor="website" className={labelBase}>
            Website URL
          </label>
          <input
            id="website"
            name="website"
            type="url"
            required
            placeholder="https://yourcompany.com"
            className={fieldBase}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className={labelBase}>
              Business type
            </label>
            <select id="type" name="type" required className={cn(fieldBase, "appearance-none")}>
              <option value="">Select…</option>
              <option value="saas">Tech / SaaS / App</option>
              <option value="ecom">D2C / E-commerce</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="scale" className={labelBase}>
              Monthly traffic / revenue
            </label>
            <input
              id="scale"
              name="scale"
              type="text"
              placeholder="e.g. 200k visits · $500k/mo"
              className={fieldBase}
            />
          </div>
        </div>

        <div>
          <label htmlFor="bottleneck" className={labelBase}>
            Primary bottleneck
          </label>
          <select
            id="bottleneck"
            name="bottleneck"
            required
            className={cn(fieldBase, "appearance-none")}
          >
            <option value="">Where does it hurt most?</option>
            {bottlenecks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className={labelBase}>
            Anything else? <span className="text-slate-600">(optional)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Context on your goals, timeline, or current testing setup…"
            className={cn(fieldBase, "resize-none")}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={state === "submitting"}
        >
          {state === "submitting" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Book my strategy audit
              <ArrowUpRight className="h-5 w-5" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-slate-500">
          Your details stay private. No spam, no sales sequences — just a
          real reply.
        </p>
      </div>
    </form>
  );
}
