import { Hero } from "@/components/sections/Hero";
import { Clients } from "@/components/sections/Clients";
import { AudienceSplit } from "@/components/sections/AudienceSplit";
import { Framework } from "@/components/sections/Framework";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Clients />
      <AudienceSplit />
      <Framework />
      <CaseStudies />
      <CTA />
    </>
  );
}
