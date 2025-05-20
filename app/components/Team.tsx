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

  const teamContainerStyles = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 
    gap-8 sm:gap-4 xl:gap-8`

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

  const profileUrls = {
    'pat_matthews': 'https://patmatthews.com',
    'cat_dizon': 'https://www.linkedin.com/in/cat-dizon-43ab858/',
    'chris_saum': 'https://www.linkedin.com/in/chris-saum-84938047/',
    'avery_keller': 'https://www.linkedin.com/in/averykellermeyer/'
  }

  return <div className={teamContainerStyles}>

    {/* Pat Matthews */}
    <Link href={profileUrls.pat_matthews} target="_blank"
      onClick={() => { profileClicked('Pat Matthews', profileUrls.pat_matthews) }}>
      <div className={memberCardStyles}>
        <div className="flex justify-center items-center mb-4">
          <div className={`relative w-screen`}>
            <Image src={`/img/photos/pat-matthews.png`} width={532} height={544} alt="Pat Matthews" className={memberImageStyles} />
          </div>
        </div>

        <div className={fullnameStyles}>
          Pat Matthews
        </div>

        <div className={titleStyles}>Founder &amp; CEO</div>
      </div>
    </Link>

    {/* Cat Dizon */}
    <Link href={profileUrls.cat_dizon} target="_blank"
      onClick={() => { profileClicked('Cat Dizon', profileUrls.cat_dizon) }}>
      <div className={memberCardStyles}>
        <div className="flex justify-center items-center mb-4">
          <div className={`relative w-screen`}>
            <Image src={`/img/photos/cat-dizon.png`} width={532} height={544} alt="Cat Dizon" className={memberImageStyles} />
          </div>
        </div>

        <div className={`${fullnameStyles}`}>
          Cat Dizon
        </div>

        <div className={titleStyles}>Co-Founder &amp; Partner</div>
      </div>
    </Link>

    {/* Chris Saum */}
    <Link href={profileUrls.chris_saum} target="_blank"
      onClick={() => { profileClicked('Chris Saum', profileUrls.chris_saum) }}>
      <div className={memberCardStyles}>
        <div className="flex justify-center items-center mb-4">
          <div className={`relative w-screen`}>
            <Image src={`/img/photos/chris-saum.png`} width={532} height={544} alt="Chris Saum" className={memberImageStyles} />
          </div>
        </div>

        <div className={fullnameStyles}>
          Chris Saum
        </div>

        <div className={titleStyles}>Investment Partner</div>
      </div>
    </Link>

    {/* Avery Keller */}
    <Link href={profileUrls.avery_keller} target="_blank"
      onClick={() => { profileClicked('Avery Keller', profileUrls.avery_keller) }}>
      <div className={memberCardStyles}>
        <div className="flex justify-center items-center mb-4">
          <div className={`relative w-screen`}>
            <Image src={`/img/photos/avery-keller.png`} width={532} height={544} alt="Avery Keller" className={memberImageStyles} />
          </div>
        </div>

        <div className={fullnameStyles}>
          Avery Keller
        </div>

        <div className={titleStyles}>Executive Admin</div>
      </div>
    </Link>
  </div >
}

export default Team