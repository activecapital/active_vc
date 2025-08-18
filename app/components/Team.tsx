import { track } from '@vercel/analytics'
import { faintBorder, hoverDimmed } from "../src/cssClasses"

import Image from "next/image"
import Link from "next/link"
import { Poppins } from 'next/font/google'

const fontPoppins = Poppins({
  weight: ['400', '600'],
  subsets: ['latin']
})

const Team = () => {
  const memberCardStyles = `px-8 py-8 relative flex flex-col w-full
    ${faintBorder} rounded-[24px]`

  const memberImageStyles = `rounded-full max-w-[124px] max-h-[124px] lg:max-w-[144px] lg:max-h-[144px] mx-auto`

  const fullnameStyles = `text-center
    text-white hover:opacity-75 whitespace-nowrap overflow-hidden
    ${fontPoppins.className}
    ${hoverDimmed}
    mt-6`

  const titleStyles = `text-center text-[16px] leading-6`

  const profileClicked = (fullname: string, url: string) => {
    track('Team Member clicked', { fullname, url })
  }

  const teamMembers = [
    {
      fullname: "Pat Matthews",
      title: "Founder & CEO",
      img: "/img/photos/pat-matthews.png",
      url: "https://patmatthews.com"
    },
    {
      fullname: "Cat Dizon",
      title: "Co-Founder & Partner",
      img: "/img/photos/cat-dizon.png",
      url: "https://www.linkedin.com/in/cat-dizon-43ab858/"
    },
    {
      fullname: "Chris Saum",
      title: "Investment Partner",
      img: "/img/photos/chris-saum.png",
      url: "https://www.linkedin.com/in/chris-saum-84938047/"
    },
    {
      fullname: "Avery Keller",
      title: "Executive Admin",
      img: "/img/photos/avery-keller.png",
      url: "https://www.linkedin.com/in/averykellermeyer/"
    },
    {
      fullname: "Kevin Minnick",
      title: "Technical Advisor",
      img: "/img/photos/kevin-minnick.png",
      url: "https://www.linkedin.com/in/kevinminnick/"
    }
  ]

  return (
    <div className="flex flex-wrap justify-center gap-8 sm:gap-4 xl:gap-6">
      {teamMembers.map(({ fullname, title, img, url }) => (
        <Link
          key={fullname}
          href={url}
          target="_blank"
          onClick={() => profileClicked(fullname, url)}
          className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] max-w-[360px]"
        >
          <div className={memberCardStyles}>
            <div className="flex justify-center items-center mb-4">
              <div className="relative w-screen">
                <Image
                  src={img}
                  width={532}
                  height={544}
                  alt={fullname}
                  className={memberImageStyles}
                />
              </div>
            </div>
            <div className={fullnameStyles}>{fullname}</div>
            <div className={titleStyles}>{title}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default Team
