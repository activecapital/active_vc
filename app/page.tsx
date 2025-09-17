'use client'
import { track } from '@vercel/analytics'

import Image from "next/image"
import Link from "next/link"

import { faintBorder, hoverDimmed } from "./src/cssClasses"
import { Lexend_Deca } from 'next/font/google'
import Portfolio from "./components/Portfolio"
import Testimonials from "./components/Testimonials"
import Team from "./components/Team"
import Advisors from "./components/Advisors"
import Contact from "./components/Contact"
import Newsletter from "./components/Newsletter"


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
    mt-12 md:mt-16 lg:mt-32
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
    
  const teamContactEmail = process.env.NEXT_PUBLIC_TEAM_CONTACT_EMAIL || ""

  const handleContactEmailClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    track('Cold Emails Link clicked', { email: teamContactEmail })

    navigator.clipboard.writeText(teamContactEmail)
      .then(() => {
        // Optional: Display a message or perform an action after copying
        alert(`Email ${teamContactEmail} copied to clipboard.`);
      })
      .catch((err) => {
        // Handle any errors
        console.error('Error copying email to clipboard:', err);
      });
  }

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
            <Image src="/img/pat-matthews.png" width={800} height={800} alt="Pat Matthews" className={`${aboutImgStyles}`} />
          </Link>
        </div>
        <div className={`${aboutMsgTextContainer}`}>
          Hi, I&apos;m Pat.  I&apos;m an entrepreneur turned investor. I&apos;ve spent my entire career starting, 
          scaling, and investing in startups.  I started Active Capital because I love investing in ambitious founders 
          and doing my best to help them reach their potential. I&apos;ve been working in enterprise software and cloud 
          infrastructure for 20+ years, and I believe the future is brighter than ever.  If you&apos;re a pre-seed company building the future of enterprise software, we&apos;d love to connect. I welcome warm intros and cold emails!
        </div>
      </div>

      <h2 className={`${sectionHeadingStyles}`}>About</h2>
      <div className={`${subHeadingStyles}`}>Backing ambitious, technical founders across America.</div>

      {/* About Active Capital */}
      <div className={`grid grid-cols-12
          ${faintBorder} rounded-[24px]`}>
        <div className={`${aboutMsgImgContainer}`}>
          <Image src="/img/active-capital-icon.svg" width={180} height={180} alt="Active Capital Icon" className={`${aboutImgStyles}`} />
        </div>
        <div className={aboutMsgTextContainer}>
        Active Capital is a venture firm focused on pre-seed investing in the future of enterprise software.  We back ambitious, technical founders solving real business problems with software and AI. We love working with founders who stay small and scrappy until they find true product-market fit.  We typically invest $100K to $1M, with the ability to invest significantly more as companies grow and our relationship develops. We like to invest early and prefer to be a meaningful part of the first capital raised.
        </div>
      </div>

      {/* Newsletter */}
      <h2 className={`${sectionHeadingStyles}`}>Newsletter</h2>

      <div className={`${subHeadingStyles}`}>
        Sign up to stay informed.
      </div>

      <Newsletter />

      {/* Portfolio */}
      <h2 className={`${sectionHeadingStyles}`}>Portfolio</h2>

      <div className={`${subHeadingStyles}`}>Check out a few of the companies we&apos;ve backed.</div>

      <Portfolio />

      {/* Testimonials */}
      <h2 className={`${sectionHeadingStyles}`}>Testimonials</h2>

      <div className={`${subHeadingStyles}`}>
        Hear from some of the founders &amp; CEOs we work with.
      </div>

      <Testimonials />

      {/* Team */}
      <h2 className={`${sectionHeadingStyles}`}>Team</h2>

      <div className={`${subHeadingStyles}`}>
        We&apos;ve been starting, building, and investing together for 20+ years.
      </div>

      <Team />

      {/* Advisors */}
      <h2 className={`${sectionHeadingStyles}`}>Advisors</h2>

      <div className={`${subHeadingStyles}`}>
        We met at Rackspace 20+ years ago and have been working together ever since.
      </div>

      <Advisors />

      {/* Contact */}
      <h2 className={`${sectionHeadingStyles}`}>Contact Us</h2>

      <div className={`${subHeadingStyles} mt-6`}>
        <p>
          If you&apos;re a founder building the future of enterprise, please email:&nbsp;
          <Link
          href={`#`}
          onClick={handleContactEmailClicked}
          className="text-white hover:underline">{teamContactEmail}</Link>
        </p>

        <p>
          Please include your deck, memo or anything else we can read to learn more quickly.
        </p>
      </div>
    </main >
  )
}
