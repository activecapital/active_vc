'use client'
import { track } from '@vercel/analytics'
import Image from "next/image"
import Link from "next/link"

import { useEffect, useState } from "react"
import { faintBorder, hoverDimmed } from "../src/cssClasses"
import { TestimonialInfo, testimonials } from '../src/testimonials'

import EmblaCarousel from "./EmblaCarousel"

const Testimonials = () => {

  const [pageChanging, setPageChange] = useState(false)

  const [numTmPerPage, setNumTmPerPage] = useState(1)
  const [tmStart, setTmStart] = useState(0)
  const [tmEnd, setTmEnd] = useState(1)

  const [numTmPages, setNumTmPages] = useState(testimonials.length)

  const tmContainerStyles = `grid grid-cols-1
    w-full
    justify-center items-center
    ${faintBorder} rounded-[24px]
    md:px-8 lg:px-18
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

  const SLIDES = Array.from({ length: numTmPages }, (_, index) => (
    <div className={tmContainerStyles} key={`testimonials-slide-${index}`}>
      <div className={tmInnerStyles}>
        <Link href={testimonials[index].url} target="_blank"
          onClick={() => { profileClicked(testimonials[index].fullname, testimonials[index].url) }}>
          <div className="relative w-[80px] h-[80px]">
            <Image src={testimonials[index].avatarSrc}
              width={544} height={544}
              alt={testimonials[index].fullname} className="rounded-full" />
          </div>
        </Link>
      </div>

      <div className={tmTextContainerStyles}>
        &ldquo;{testimonials[index].text}&rdquo;

        <div className={`mt-4 lg:mt-8 text-white ${hoverDimmed}`}>
          <Link href={testimonials[index].url} target="_blank">
            {testimonials[index].fullname}
          </Link>
        </div>
        <div className="text-[16px] leading-5">
          {testimonials[index].title}
        </div>
      </div>
    </div>
  ))

  return <>
    <EmblaCarousel slides={SLIDES} options={{ loop: true }} />
  </>
}

export default Testimonials