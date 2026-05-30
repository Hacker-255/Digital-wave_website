import { Navbar, RedirectSignedInToCrm } from './Navbar';
import { HeroSection } from './HeroSection';
import { TrustedBySection, FeaturesSection, CrmPreviewSection, WhyChooseUsSection, TestimonialsSection, PricingSection, FaqSection, CtaSection, Footer } from './LandingSections';

interface LandingPageProps {
  clerkMissing: boolean;
}

export function LandingPage({ clerkMissing }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-[#050816]">
      {!clerkMissing && <RedirectSignedInToCrm />}
      <Navbar clerkMissing={clerkMissing} />
      <HeroSection clerkMissing={clerkMissing} />
      <TrustedBySection />
      <FeaturesSection />
      <CrmPreviewSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <PricingSection clerkMissing={clerkMissing} />
      <FaqSection />
      <CtaSection clerkMissing={clerkMissing} />
      <Footer />
    </main>
  );
}
