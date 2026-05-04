'use client'
import { track } from '@vercel/analytics'
import Image from "next/image"
import Link from "next/link"

import { faintBorder, hoverDimmed } from "../src/cssClasses"
import { testimonials } from '../src/testimonials'

import EmblaCarousel from "./EmblaCarousel"

const Testimonials = () => {
  const tmContainerStyles = `grid grid-cols-1
    w-full
    justify-center items-center
    ${faintBorder} rounded-[24px]
    md:px-8 lg:px-20
    pb-8`

  const tmInnerStyles = `min-h-[140px] lg:min-h-[160px]
    flex justify-center items-center
    pt-4 lg:pt-8`

  const tmTextContainerStyles = `text-center
    px-2 sm:px-4 md:px-8 lg:px-16
    min-h-[320px] sm:min-h-[240px]
    text-[16px] md:text-[20px]
    leading-[40px]`

  const profileClicked = (fullname: string, url: string) => {
    track('Testimonial clicked', { fullname, url })
  }

  const SLIDES = testimonials.map((t, index) => (
    <div className={tmContainerStyles} key={`testimonials-slide-${index}`}>
      <div className={tmInnerStyles}>
        <Link href={t.url} target="_blank"
          onClick={() => { profileClicked(t.fullname, t.url) }}>
          <div className="relative w-[80px] h-[80px]">
            <Image src={t.avatarSrc}
              width={544} height={544}
              alt={t.fullname} className="rounded-full" />
          </div>
        </Link>
      </div>

      <div className={tmTextContainerStyles}>
        &ldquo;{t.text}&rdquo;

        <div className={`mt-4 lg:mt-8 text-white ${hoverDimmed}`}>
          <Link href={t.url} target="_blank">
            {t.fullname}
          </Link>
        </div>
        <div className="text-[16px] leading-5">
          {t.title}
        </div>
      </div>
    </div>
  ))

  return <>
    <EmblaCarousel slides={SLIDES} options={{ loop: true }} />
  </>
}

export default Testimonials
