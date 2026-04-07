import { GoogleTagManager } from '@next/third-parties/google'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react'

import type { Metadata } from "next"
import Footer from "./components/Footer"
import HeaderNav from "./components/HeaderNav"

import "./globals.css"
import "./embla.css"

import { Noticia_Text } from 'next/font/google'
import TopHeroCard from "./components/TopHeroCard"
import { headers } from 'next/headers'

const fontNoticiaText = Noticia_Text({
  weight: '400',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "Active Capital",
  description: "Founder led capital for founder led companies. Pre-Seed Investing in AI-Native Business Software. We back technical founders building the future.",
  openGraph: {
    title: "Active Capital",
    description: "Founder led capital for founder led companies. Pre-Seed Investing in AI-Native Business Software. We back technical founders building the future.",
    url: "https://active.vc",
    siteName: "Active Capital",
    images: [{
      url: "https://active.vc/img/active-capital-logo.png",
      width: 1200,
      height: 1200,
      alt: "Active Capital Logo",
      type: "image/png",
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Active Capital",
    description: "Founder led capital for founder led companies. Pre-Seed Investing in AI-Native Business Software. We back technical founders building the future.",
    images: ["https://active.vc/img/active-capital-logo.png"],
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <html lang="en">
        <head>
          <title>Active Capital - Admin</title>
          <GoogleTagManager gtmId="GTM-WLF2BJCJ" />
        </head>
        <body className="bg-black">
          {children}
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <title>Active Capital</title>
        <meta property="og:image" content="https://active.vc/img/active-capital-logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="Active Capital Logo" />
        <GoogleTagManager gtmId="GTM-WLF2BJCJ" />
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
