'use client'
import { track } from '@vercel/analytics'

import Image from "next/image"
import Link from "next/link"

import DOMPurify from "isomorphic-dompurify"
import { faintBorder } from "./src/cssClasses"
import { Lexend_Deca } from 'next/font/google'
import Portfolio from "./components/Portfolio"
import Testimonials from "./components/Testimonials"
import Team from "./components/Team"
import Advisors from "./components/Advisors"
import Newsletter from "./components/Newsletter"
import HowWeInvest from "./components/HowWeInvest"
import { SITE_CONTENT as content } from "@/lib/content"


const fontLexendDeca = Lexend_Deca({
  weight: ['600', '700'],
  subsets: ['latin']
})

export default function Home() {
  const sectionHeadingStyles = `w-full
    text-center
    text-3xl
    md:text-4xl
    text-white
    my-12 md:mt-16 lg:mt-32
    ${fontLexendDeca.className}`

  const subHeadingStyles = `text-md text-center leading-relaxed
    px-2 sm:px-12 md:px-16 lg:px-20 
    mt-2
    mb-8 md:mb-12`

  const aboutMsgImgContainer = `flex
    justify-center items-center
    col-span-12 md:col-span-3 
    py-12
    px-4
    md:px-8
    `
  const aboutImgStyles = `rounded-full max-w-[120px] 
    md:max-w-percent-90 lg:max-w-percent-80`

  const aboutMsgTextContainer = `    
    flex justify-content items-center
    col-span-12 md:col-span-9
    pl-4 pr-4
    md:pl-0
    pb-4 md:py-8 md:pr-8 
    lg:py-8 lg:pr-8
    text-justify
    `
    
  const patAvatarClicked = (e: React.MouseEvent<HTMLElement>) => {
    track('Pat Avatar clicked')
  }

  // Preserve authored markup while keeping the existing HTML sanitization.
  const aboutPatText = DOMPurify.sanitize(content.about_pat)
  const aboutActiveCapitalText = DOMPurify.sanitize(content.about_active_capital)
  const contactHtml = DOMPurify.sanitize(content.contact_html)

  return (
    <main className="flex flex-col items-center justify-between pb-12
      px-4 py-4 md:px-12 lg:px-24 max-w-[1216px] mx-auto">

      {/* Message from Pat Mathews */}
      <div className={`grid grid-cols-12
          ${faintBorder} rounded-[24px] mt-8`}>
        <div className={`${aboutMsgImgContainer}`}>
          <Link href={`https://patmatthews.com`} onClick={patAvatarClicked} target="_blank">
            <Image src="/img/photos/pat-matthews_2026.png" width={800} height={800} alt="Pat Matthews" className={`${aboutImgStyles}`} />
          </Link>
        </div>
        <div className={`${aboutMsgTextContainer}`} dangerouslySetInnerHTML={{ __html: aboutPatText }} />
      </div>

      <h2 className={`${sectionHeadingStyles}`}>About</h2>

      {/* About Active Capital */}
      <div className={`grid grid-cols-12
          ${faintBorder} rounded-[24px]`}>
        <div className={`${aboutMsgImgContainer}`}>
          <Image src="/img/active-capital-icon.svg" width={180} height={180} alt="Active Capital Icon" className={`${aboutImgStyles}`} />
        </div>
        <div className={aboutMsgTextContainer} dangerouslySetInnerHTML={{ __html: aboutActiveCapitalText }} />
      </div>

      <h2 className={`${sectionHeadingStyles}`}>Approach</h2>

      <HowWeInvest items={content.approach_items} />

      {/* Portfolio */}
      <h2 className={`${sectionHeadingStyles}`}>Portfolio</h2>

      <Portfolio />

      {/* Newsletter */}
      <h2 className={`${sectionHeadingStyles}`}>Newsletter</h2>

      <Newsletter />

      {/* Testimonials */}
      <h2 className={`${sectionHeadingStyles}`}>Testimonials</h2>

      <Testimonials />

      {/* Team */}
      <h2 className={`${sectionHeadingStyles}`}>Team</h2>

      <Team />

      {/* Advisors */}
      <h2 className={`${sectionHeadingStyles}`}>Advisors</h2>

      <Advisors />

      {/* Contact */}
      <h2 className={`${sectionHeadingStyles}`}>Contact Us</h2>

      <div className={`${subHeadingStyles} mt-6`}
        dangerouslySetInnerHTML={{ __html: contactHtml }}
      />
    </main >
  )
}