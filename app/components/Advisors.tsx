import { track } from '@vercel/analytics'
import { faintBorder, hoverDimmed } from "../src/cssClasses"

import Image from "next/image"
import Link from "next/link"

import { Poppins } from 'next/font/google'

const fontPoppins = Poppins({
  weight: ['400', '600'],
  subsets: ['latin']
})

const Advisors = () => {

  const teamContainerStyles = `grid grid-cols-1 md:grid-cols-2 lg:mx-[130px]
    gap-4 lg:gap-8`

  const memberCardStyles = `px-8 py-8 relative flex flex-col w-full
    ${faintBorder} rounded-[24px]`

  const memberImageStyles = `rounded-full max-w-[124px] max-h-[124px] lg:max-w-[144px] lg:max-h-[144px] mx-auto`


  const fullnameStyles = `text-center mt-6 whitespace-nowrap overflow-hidden
    text-white hover:opacity-75 
    ${fontPoppins.className}
    ${hoverDimmed}`

  const titleStyles = `text-center text-[16px] leading-6`

  const advisorClicked = (fullname: string, url: string) => {
    track('Advisor Profile clicked', { fullname, url })
  }

  const advisorUrls = {
    'graham_w': 'https://www.linkedin.com/in/grahamweston/',
    'pat_c': 'https://www.linkedin.com/in/pcondon/',
    'matt_b': 'https://www.linkedin.com/in/matt-bradley-0413726/',
    'chris_saum': 'https://www.linkedin.com/in/chris-saum-84938047/',
  }

  return <div className={teamContainerStyles}>

    

    {/* Graham Weston */}
    <Link href={advisorUrls.graham_w} target="_blank"
      onClick={() => { advisorClicked('Graham Weston', advisorUrls.graham_w) }}>
      <div className={memberCardStyles}>
        <div className="flex justify-center items-center mb-4">
          <div className={`relative w-screen`}>
            <Image src={`/img/photos/graham-weston.png`} width={532} height={544} alt="Graham Weston" className={memberImageStyles} />
          </div>
        </div>

        <div className={fullnameStyles}>
          Graham Weston
        </div>

        <div className={titleStyles}>Co-Founder, Rackspace</div>
      </div>
    </Link>

    {/* Pat Condon */}
    <Link href={advisorUrls.pat_c} target="_blank"
      onClick={() => { advisorClicked('Pat Condon', advisorUrls.pat_c) }}>
      <div className={memberCardStyles}>
        <div className="flex justify-center items-center mb-4">
          <div className={`relative w-screen`}>
            <Image src={`/img/photos/pat-condon.png`} width={532} height={544} alt="Pat Condon" className={memberImageStyles} />
          </div>
        </div>

        <div className={fullnameStyles}>
          Pat Condon
        </div>

        <div className={titleStyles}>Co-Founder, Rackspace</div>
      </div>
    </Link>

  </div>
}

export default Advisors