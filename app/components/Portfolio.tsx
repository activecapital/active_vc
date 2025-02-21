'use client'
import { track } from '@vercel/analytics'

import Image from "next/image"
import Link from "next/link"
import { PortfolioCompanies } from "../src/portfolio-companies"
import { useEffect, useState } from "react"
import { faintBorder, hoverDimmed } from "../src/cssClasses"

import EmblaCarousel from "./EmblaCarousel"

const Portfolio = () => {

  const [numCompaniesPerPage, setNumCompaniesPerPage] = useState(0)
  const initNumPortPages = numCompaniesPerPage > 0 ? Math.ceil(PortfolioCompanies.length / numCompaniesPerPage) : 1

  const [numPortPages, setNumPortPages] = useState(initNumPortPages)


  useEffect(() => {
    const numCompanies = (window?.innerWidth >= 1024) ? 12 : 6
    setNumCompaniesPerPage(numCompanies)

    const numPortPages = numCompanies > 0 ? Math.ceil(PortfolioCompanies.length / numCompanies) : 1
    setNumPortPages(numPortPages)
  }, [])

  const portfolioLogoContainer = `relative h-[94px] sm:h-[124px]
    flex flex-col justify-center items-center 
    p-4 md:p-12
    ${faintBorder} rounded-2xl
    bg-gray-dark`

  const portolioCardClicked = (companyName: string, website: string) => {
    track('Portfolio Company clicked', { companyName, website })
  }

  const SLIDES = Array.from({ length: numPortPages }, (_, index) => (
    <div className={`w-full grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-4`}
      key={`portfolio-slide-${index}`}>
      {PortfolioCompanies.slice(
        (index * numCompaniesPerPage),
        (index * numCompaniesPerPage) + numCompaniesPerPage).map(c => {
          return <div
            className={`${portfolioLogoContainer}`}
            key={`${c.companyName}-portfolio-card`}>
            <Link href={c.website} target="_blank"
              onClick={() => { portolioCardClicked(c.companyName, c.website) }}>
              <Image
                src={c.src}
                width={c.width}
                height={c.height}
                className={`${hoverDimmed} w-auto h-auto`}
                alt={`${c.companyName} Logo`}
                unoptimized
                priority />
            </Link>

            {c.acquiredBy &&
              <div className="text-[12px] md:text-[14px] opacity-[.5] absolute bottom-1 p-2 text-center leading-normal">
                Acquired by {c.acquiredBy}
              </div>
            }
          </div>
        })}
    </div>
  ))

  return <>
    <EmblaCarousel slides={SLIDES} options={{ loop: true }} />
  </>
}

export default Portfolio