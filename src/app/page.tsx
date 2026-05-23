"use client";

import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WhatIsLife from "@/components/WhatIsLife";
import Consciousness from "@/components/Consciousness";
import AILife from "@/components/AILife";
import Civilization from "@/components/Civilization";
import UltimateQuestions from "@/components/UltimateQuestions";
import Footer from "@/components/Footer";

const CosmicBackground = dynamic(() => import("@/components/CosmicBackground"), { ssr: false });

export default function Page() {
  return (
    <main className="vignette relative">
      <CosmicBackground />
      <Nav />
      <Hero />
      <WhatIsLife />
      <Consciousness />
      <AILife />
      <Civilization />
      <UltimateQuestions />
      <Footer />
    </main>
  );
}
