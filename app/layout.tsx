import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react'

import type { Metadata } from "next"
import Footer from "./components/Footer"
import HeaderNav from "./components/HeaderNav"

import "./globals.css"
import "./embla.css"

import { Noticia_Text } from 'next/font/google'
import TopHeroCard from "./components/TopHeroCard"

const fontNoticiaText = Noticia_Text({
  weight: '400',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "Active Capital",
  description: "Founder led capital for founder led companies. Pre-Seed investing in the future of enterprise software.",
  openGraph: {
    title: "Active Capital",
    description: "Founder led capital for founder led companies. Pre-Seed investing in the future of enterprise software.",
    images: [{
      url: "https://activecapital.com/img/active-capital-icon.svg",
      alt: "Photo of the Active Capital Logo",
    }],
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en">
      <head>
        <title>Active Capital</title>
      </head>
      <body className="bg-white ease-in 
        text-[16px] md:text-[18px] overscroll-x-none">

        <div className={`relative mt-[12px] md:mt-[16px] border border-gray-dark rounded-2xl
          overflow-hidden
          w-[calc(100vw-24px)] md:w-[calc(100vw-32px)]
          mx-auto
          ${fontNoticiaText.className} 
          leading-loose
          overscroll-x-none
          `}
        >
          <div className={`overscroll-x-none overflow-y-auto scrollbar-hide bg-gray-dark text-gray
            h-[calc(100vh-24px)] md:h-[calc(100vh-32px)]`}>
            <HeaderNav />

            {/* Top Hero Card */}
            <TopHeroCard />

            {children}

            <div className="relative mt-16">
              <Footer />
            </div>
          </div>
        </div>
        <SpeedInsights />
        <Analytics />
        <div className="text-[6px]">node_env: {process.env.NODE_ENV}</div>
      </body>
    </html >
  )
}
