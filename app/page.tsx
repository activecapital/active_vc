'use client'
import { track } from '@vercel/analytics'

import Image from "next/image"
import Link from "next/link"

import { faintBorder } from "./src/cssClasses"
import { Lexend_Deca } from 'next/font/google'
import Portfolio from "./components/Portfolio"
import Testimonials from "./components/Testimonials"
import Team from "./components/Team"
import Advisors from "./components/Advisors"
import Newsletter from "./components/Newsletter"
import HowWeInvest from "./components/HowWeInvest"


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
        <div className={aboutMsgTextContainer}>
          Hi, I’m Pat. I’m an entrepreneur turned investor. I’ve spent my career building, scaling, and investing in enterprise software and cloud infrastructure.&nbsp; I started Active Capital because I love working with technical founders and helping them reach their potential. Today, I’m backing founders rebuilding software and infrastructure for an AI-native world.&nbsp; If that’s you, I’d love to hear from you. Warm intros and cold emails are always welcome.
        </div>
      </div>

      <h2 className={`${sectionHeadingStyles}`}>About</h2>

      {/* About Active Capital */}
      <div className={`grid grid-cols-12
          ${faintBorder} rounded-[24px]`}>
        <div className={`${aboutMsgImgContainer}`}>
          <Image src="/img/active-capital-icon.svg" width={180} height={180} alt="Active Capital Icon" className={`${aboutImgStyles}`} />
        </div>
        <div className={aboutMsgTextContainer}>
          Active Capital is a founder-led, pre-seed venture capital firm. We like to be one of the first investors in a company, typically writing $500K first checks. We’re equally comfortable leading rounds or investing alongside other great investors. Having built and operated technology companies ourselves, we love working with founders who stay lean and scrappy until they find product-market fit, then scale ambitiously from there. As companies grow and relationships develop, we have the ability to invest significantly more over time.
        </div>
      </div>

      <h2 className={`${sectionHeadingStyles}`}>Approach</h2>

      <HowWeInvest />

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

      <div className={`${subHeadingStyles} mt-6`}>
        <p>If you’re raising a pre-seed round we’d love to learn more. Email is best: team@active.vc</p>
      </div>
    </main >
  )
}
