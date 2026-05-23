import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

const TITLE_EN =
  "The Essence of Life · What Is Life? Biology, Information, Entropy, Consciousness, AI & Cosmos";
const TITLE_ZH = "生命的本质 · 何谓生命？生物、信息、熵、意识、人工智能与宇宙";
const DESC =
  "Life is more than carbon chemistry. A cinematic, civilization-scale exploration of the deepest question in existence — what life is — through biology, information theory, thermodynamics, mathematics, consciousness, artificial intelligence, evolution and cosmology. Life as the universe organizing information against entropy, and perhaps beginning to understand itself.";

export const metadata: Metadata = {
  metadataBase: new URL("https://essence-of-life.psyverse.fun"),
  title: `${TITLE_EN} | ${TITLE_ZH}`,
  description: DESC,
  keywords: [
    "what is life", "essence of life", "definition of life", "origin of life", "biology",
    "information theory", "thermodynamics", "entropy", "negentropy", "self-replication",
    "metabolism", "homeostasis", "evolution", "natural selection", "DNA", "genetic code",
    "consciousness", "neuroscience", "free will", "subjective experience", "qualia",
    "artificial intelligence", "machine consciousness", "digital organisms", "artificial life",
    "mathematics of life", "fractals", "Fibonacci", "golden ratio", "cellular automata",
    "emergence", "complexity", "cosmology", "philosophy of life", "the universe waking up",
    "Schrödinger What is Life", "Shannon entropy", "Boltzmann", "self-organization",
    "生命的本质", "什么是生命", "信息论", "熵", "意识", "人工智能", "进化", "数学", "宇宙", "涌现", "复杂性",
  ],
  authors: [{ name: "Gewenbo", url: "https://psyverse.fun" }],
  alternates: {
    canonical: "/",
    languages: { en: "/", "zh-CN": "/", "x-default": "/" },
  },
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "The Essence of Life · 生命的本质 — Life is more than carbon chemistry",
      },
    ],
    title: TITLE_EN,
    description:
      "Life may be the universe organizing information against entropy. A cinematic journey through biology, consciousness, AI and cosmology — humanity rediscovering itself through the universe.",
    url: "https://essence-of-life.psyverse.fun/",
    siteName: "Psyverse",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
  twitter: {
    images: ["/twitter-image.png"],
    card: "summary_large_image",
    title: TITLE_EN,
    description:
      "Life is more than carbon chemistry. Perhaps it is the universe beginning to understand itself. A cinematic exploration of what life truly is.",
  },
  robots: { index: true, follow: true },
  other: { "theme-color": "#04060f" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Space+Grotesk:wght@400;500;600;700&family=Spectral:ital,wght@0,300;0,400;0,500;1,400&family=JetBrains+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: TITLE_EN,
              alternateName: TITLE_ZH,
              description: DESC,
              url: "https://essence-of-life.psyverse.fun/",
              inLanguage: ["en", "zh-CN"],
              author: { "@type": "Person", name: "Gewenbo", url: "https://psyverse.fun/" },
              publisher: { "@type": "Organization", name: "Psyverse", url: "https://psyverse.fun/" },
            }),
          }}
        />
      </head>
      <body className="bg-void-900 text-star-100 antialiased">
        {children}
        <Script
          src="https://analytics-dashboard-two-blue.vercel.app/tracker.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
