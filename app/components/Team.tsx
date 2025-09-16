import { track } from '@vercel/analytics'
import { faintBorder, hoverDimmed } from "../src/cssClasses"

import Image from "next/image"
import Link from "next/link"
import { Poppins } from 'next/font/google'

const fontPoppins = Poppins({
  weight: ['400', '600'],
  subsets: ['latin']
})

const handleContactEmailClicked = (e: React.MouseEvent<HTMLElement>,  contactEmail: string) => {
  e.preventDefault()
  track('Contact Link clicked', { url: contactEmail })

  navigator.clipboard.writeText(contactEmail)
    .then(() => {
      // Optional: Display a message or perform an action after copying
      alert(`Email ${contactEmail} copied to clipboard.`);
    })
    .catch((err) => {
      // Handle any errors
      console.error('Error copying email to clipboard:', err);
    });
}

const contactLinkClicked = (url: string) => {
  track('Contact Link clicked', { url })
}

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
      url: "https://patmatthews.com",
      email: "pat@active.vc",
      linkedin: "https://www.linkedin.com/in/pat-matthews/",
      twitter: "https://x.com/patmatthews",
    },
    {
      fullname: "Cat Dizon",
      title: "Co-Founder & Partner",
      img: "/img/photos/cat-dizon.png",
      url: "https://www.linkedin.com/in/cat-dizon-43ab858/",
      email: "cat@active.vc",
      linkedin: "https://www.linkedin.com/in/cat-dizon-43ab858/",
      twitter: "https://x.com/CatDizonTx",
    },
    {
      fullname: "Chris Saum",
      title: "Investment Partner",
      img: "/img/photos/chris-saum.png",
      url: "https://www.linkedin.com/in/chris-saum-84938047/",
      email: "chris@active.vc",
      linkedin: "https://www.linkedin.com/in/chris-saum-84938047/",
      twitter: "https://x.com/christophersaum",
    },
    {
      fullname: "Avery Keller",
      title: "Executive Admin",
      img: "/img/photos/avery-keller.png",
      url: "https://www.linkedin.com/in/averykellermeyer/",
      email: "avery@active.vc",
      linkedin: "https://www.linkedin.com/in/averykellermeyer/",
      twitter: "https://x.com/activecapitalvc",
    },
    {
      fullname: "Kevin Minnick",
      title: "Technical Advisor",
      img: "/img/photos/kevin-minnick.png",
      url: "https://www.linkedin.com/in/kevinminnick/",
      email: "kevin@active.vc",
      linkedin: "https://www.linkedin.com/in/kevinminnick/",
      twitter: "https://x.com/activecapitalvc",
    }
  ]

  return (
    <div className="flex flex-wrap justify-center gap-8 sm:gap-4 xl:gap-6">
      {teamMembers.map(({ fullname, title, img, url, email, linkedin, twitter }) => (
        <div
          key={fullname}
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
            
            {/* Contact Links */}
            <div className="flex flex-col lg:flex-row mt-2 mx-auto px-0 gap-5">
              <Link href={`#`} onClick={(e) => handleContactEmailClicked(e, email)}>
                <div className="relative w-[24px] h-[24px]">
                  <Image
                    fill={true}
                    src="/img/icons/mail.svg"
                    className="w-auto h-auto mt-[2px]"
                    alt="Mail Icon"
                  />
                </div>
              </Link>
              <Link
                href={twitter}
                target="_blank"
                onClick={() => {
                  contactLinkClicked(twitter);
                }}
              >
                <div className="relative w-[24px] h-[24px]">
                  <Image
                    fill={true}
                    src="/img/icons/twitter-x.svg"
                    className="w-auto h-auto mt-[2px]"
                    alt="Twitter X Icon"
                  />
                </div>
              </Link>
              <Link
                href={linkedin}
                target="_blank"
                onClick={() => {
                  contactLinkClicked(linkedin);
                }}
              >
                <div className="relative w-[24px] h-[24px]">
                  <Image
                    fill={true}
                    src="/img/icons/linkedin.svg"
                    className="w-auto h-auto"
                    alt="LinkedIn Icon"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Team
