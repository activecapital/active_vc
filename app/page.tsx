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
            Hi, I&apos;m Pat, an entrepreneur turned investor, and the founder of Active Capital.  
            Over the past 20+ years, I&apos;ve started, scaled, and invested in dozens of enterprise 
            software and cloud infrastructure companies—often in cities outside the usual tech hubs.  
            I launched Active Capital because I believe founders deserve early capital from someone 
            who&apos;s walked in their shoes. Someone who truly understands the challenges of starting 
            and building a great company.  As an entrepreneur, I&apos;ve helped lead companies through 
            major shifts, from old-school software to SaaS, cloud, and mobile. Today, I couldn&apos;t be 
            more excited to back the next generation of founders who are re-shaping software and infrastructure 
            in the AI era.  If you&apos;re building something bold at the pre-seed stage, 
            I&apos;d love to hear from you. 
            <br/><br/>
            Warm intros and{` `}
            <Link href={`#`}
              onClick={handleContactEmailClicked}
              className={`underline underline-offset-2 ${hoverDimmed}`}>cold emails</Link>
              {` `}are always welcome.
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
        Active Capital is a venture firm focused on pre-seed investing in the future of enterprise software &amp; 
        cloud infrastructure. We back ambitious, technical founders, often in underdog cities across America, who 
        are building software &amp; AI products to solve real business problems.  We invest $500k to $1M in small 
        pre-seed rounds led by founders who are financially disciplined and customer obsessed.
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
        If you&apos;re building something bold at the pre-seed stage, we&apos;d love to hear from you.
      </div>

      <Contact />
    </main >
  )
}
