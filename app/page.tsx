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
    `

  const teamContactEmail = 'team@active.vc'

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
          <div>
            Hi, I&apos;m Pat.  I&apos;m an entrepreneur turned investor.  I&apos;ve been starting,
            scaling, and investing in startups my entire career.  I started Active Capital because I
            love investing in ambitious founders and doing my best to help them reach their potential.
            I&apos;ve been working in SaaS and cloud infrastructure for 20+ years and believe the future
            is brighter than ever.  If you&apos;re a pre-seed founder building products at the intersection
            of SaaS, cloud, &amp; AI, please get in touch. We welcome warm intros and {` `}
            <Link href={`#`}
              onClick={handleContactEmailClicked}
              className={`underline underline-offset-2 ${hoverDimmed}`}>cold emails!</Link>
          </div>
        </div>
      </div>

      <h2 className={`${sectionHeadingStyles}`}>About</h2>
      <div className={`${subHeadingStyles}`}>We live in Texas and invest all over the country.</div>

      {/* About Active Capital */}
      <div className={`grid grid-cols-12
          ${faintBorder} rounded-[24px]`}>
        <div className={`${aboutMsgImgContainer}`}>
          <Image src="/img/active-capital-icon.svg" width={180} height={180} alt="Active Capital Icon" className={`${aboutImgStyles}`} />
        </div>
        <div className={aboutMsgTextContainer}>
        Active Capital is a venture firm focused on leading pre-seed rounds for AI-powered business software companies.
        We invest in ambitious founders solving real business problems at the intersection of software, cloud, & AI.
        We love founders who are willing to stay super scrappy until finding true product market fit. Our initial check size is typically in the $500k-$1M range and we will invest significantly more as companies grow and our relationship develops. We like to invest early and prefer to be a material part of the first $1-2M raised.
        </div>
      </div>

      {/* Portfolio */}
      <h2 className={`${sectionHeadingStyles}`}>Portfolio</h2>

      <div className={`${subHeadingStyles}`}>Check out some of the amazing companies we&apos;ve invested in.</div>

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
        We&apos;ve been starting, building, and investing in software startups for 20+ years.
      </div>

      <Team />

      {/* Advisors */}
      <h2 className={`${sectionHeadingStyles}`}>Advisors</h2>

      <div className={`${subHeadingStyles}`}>
        We met at Rackspace and have been working together ever since.
      </div>

      <Advisors />

      {/* Contact */}
      <h2 className={`${sectionHeadingStyles}`}>Contact</h2>

      <div className={`${subHeadingStyles}`}>
        If you are a pre-seed founder building the future of business software, please get in touch!
      </div>

      <Contact />
    </main >
  )
}
