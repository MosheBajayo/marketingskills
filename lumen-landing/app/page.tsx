import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { FeatureSection } from "@/components/sections/FeatureSection";
import { Integrations } from "@/components/sections/Integrations";
import { Pricing } from "@/components/sections/Pricing";
import { TrustRow } from "@/components/sections/TrustRow";
import { Founders } from "@/components/sections/Founders";
import { Newsletter } from "@/components/sections/Newsletter";
import { VideoBlock } from "@/components/sections/VideoBlock";
import { Testimonial } from "@/components/sections/Testimonial";
import { Benefits } from "@/components/sections/Benefits";
import { DaveTestimonial } from "@/components/sections/DaveTestimonial";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import {
  ASSETS,
  REALTIME_FEATURES,
  NUTRITION_FEATURES,
} from "@/lib/constants";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        <FeatureSection
          title="Real-time tracking"
          description="Track whether you're in fat burn or carb burn through your breath"
          bullets={REALTIME_FEATURES}
          imageSrc={ASSETS.realtime.desktop}
          imageAlt="Woman using the Lumen device with metabolic insights on phone"
          footer={<Integrations />}
        />

        <FeatureSection
          title="Nutrition coaching"
          description="Know what to eat and when"
          bullets={NUTRITION_FEATURES}
          imageSrc={ASSETS.nutrition.desktop}
          imageAlt="Lumen app personalized nutrition coaching"
          reverse
        />

        <Pricing />
        <TrustRow />
        <Founders />
        <Newsletter />

        <VideoBlock
          title="Lumen trains your metabolism to use the food you eat more efficiently"
          body="When your metabolism is more flexible, you are better able to burn fat instead of carbs, leading to weight loss. By focusing on metabolism instead of restriction or unsustainable diets, Lumen helps you lose weight and keep it off for good with daily feedback."
        />

        <Testimonial />
        <Benefits />
        <DaveTestimonial />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
