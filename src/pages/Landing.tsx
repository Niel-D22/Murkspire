import { LandingNav } from '../components/landing/LandingNav';
import { HeroIntro } from '../components/landing/HeroIntro';
import { Hero } from '../components/landing/Hero';
import { TheMurk } from '../components/landing/TheMurk';
import { WhaleBand } from '../components/landing/WhaleBand';
import { MarketBand } from '../components/landing/MarketBand';
import { StakingBand } from '../components/landing/StakingBand';
import { FeedBand } from '../components/landing/FeedBand';
import { HowItWorks } from '../components/landing/HowItWorks';
import { BuiltOn } from '../components/landing/BuiltOn';
import { Trust } from '../components/landing/Trust';
import { Faq } from '../components/landing/Faq';
import { SiteFooter } from '../components/landing/SiteFooter';

export default function Landing() {
  return (
    /* overflow-x-clip is a safety net: no section should ever push the
       viewport sideways on a phone. */
    <div className="min-h-screen overflow-x-clip bg-murk text-bone">
      <LandingNav />

      <main>
        <HeroIntro />

        {/* Curtain reveal.
            The intro is 400vh with a 100vh sticky panel, so that panel stays
            pinned for the first 300vh. Pulling this block up by exactly one
            viewport means its top edge enters at 200vh (progress 0.667) and
            reaches the top of the screen at 300vh (progress 1.0) — the exact
            moment the pin releases. The title sequence is therefore fully
            covered while still lit, and never has to fade to black first. */}
        <div className="relative z-10 -mt-[100vh] bg-murk">
          <Hero />
        </div>
        <TheMurk />

        {/* The four signals, each given room to show the real product */}
        <div id="features">
          <WhaleBand />
          <MarketBand />
          <StakingBand />
          <FeedBand />
        </div>

        <HowItWorks />
        <BuiltOn />

        <div id="trust">
          <Trust />
        </div>

        <div id="faq">
          <Faq />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
