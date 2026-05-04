import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { PressRow } from "@/components/sections/home/PressRow";
import { SplitSection } from "@/components/sections/home/SplitSection";
import { ExpertsSection } from "@/components/sections/home/ExpertsSection";
import { GoldStandard } from "@/components/sections/home/GoldStandard";
import { MollyTestimonial } from "@/components/sections/home/MollyTestimonial";
import { MillionBreaths } from "@/components/sections/home/MillionBreaths";
import { ResearchBanner } from "@/components/sections/home/ResearchBanner";
import { HomeNewsletter } from "@/components/sections/home/HomeNewsletter";
import {
  BREATH_SECTION,
  EACH_MORNING,
  HOME_ASSETS,
  HOME_FEATURES,
  SCIENCE_SECTION,
  TAKE_CONTROL,
  TRAINS_METABOLISM,
} from "@/lib/home-content";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-lumen-night">
        <HomeHero />
        <PressRow />

        <SplitSection
          title={BREATH_SECTION.title}
          body={BREATH_SECTION.body}
          imageSrc={HOME_ASSETS.couple}
          imageAlt="Couple using the Lumen device together"
        />

        <SplitSection
          title={SCIENCE_SECTION.title}
          body={SCIENCE_SECTION.body}
          imageSrc={HOME_ASSETS.phoneApp}
          imageAlt="Lumen app on phone showing metabolism reading"
          reverse
          imageContain
          imageAspect="aspect-square"
          cta={SCIENCE_SECTION.cta}
        />

        <ExpertsSection />
        <GoldStandard />

        {HOME_FEATURES.map((f) => (
          <SplitSection
            key={f.title}
            title={f.title}
            body={f.body}
            imageSrc={HOME_ASSETS.features[f.image]}
            imageAlt={f.title}
            reverse={f.reverse}
          />
        ))}

        <MollyTestimonial />
        <MillionBreaths />

        <SplitSection
          title={TAKE_CONTROL.title}
          body={TAKE_CONTROL.body}
          imageSrc={HOME_ASSETS.takeControl}
          imageAlt="Couple looking at metabolism data on phone"
        />

        <SplitSection
          title={EACH_MORNING.title}
          body={EACH_MORNING.body}
          imageSrc={HOME_ASSETS.eachMorning}
          imageAlt="Person breathing into the Lumen device in the morning"
          reverse
        />

        <SplitSection
          title={TRAINS_METABOLISM.title}
          body={TRAINS_METABOLISM.body}
          imageSrc={HOME_ASSETS.trainsMetabolism}
          imageAlt="Person preparing food with Lumen"
        />

        <ResearchBanner />
        <HomeNewsletter />
      </main>
      <Footer />
    </>
  );
}
