'use client'
import { track } from '@vercel/analytics'
import Image from "next/image"
import Link from "next/link"

const teamContactEmail = process.env.NEXT_PUBLIC_TEAM_CONTACT_EMAIL || ""

const handleContactEmailClicked = (e: React.MouseEvent<HTMLElement>) => {
  e.preventDefault()
  track('Contact Link clicked', { url: teamContactEmail })

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

const contactLinkClicked = (url: string) => {
  track('Contact Link clicked', { url })
}

const Contact = () => {

  const contactContainerStyles = `border-0 lg:border-[2px] w-full border-white/[.09]
    rounded-2xl lg:p-6 justify-center items-center`

  const contactInnerStyles = `flex flex-col lg:flex-row mx-auto 
    px-0 
    w-full lg:w-fit`

  const contactLinkStyles = `text-white flex flew-row items-center
    opacity-50 hover:opacity-100

    border-[2px] lg:border-0 border-white/[.09]
    p-6 lg:p-0 rounded-2xl 
    md:mx-4
    my-2 lg:my-0 
    justify-center items-center
    w-full
    `

  return <div className={contactContainerStyles}>
    <div className={contactInnerStyles}>
      <Link
        href={`#`}
        onClick={handleContactEmailClicked}
        className={contactLinkStyles}>

        <div className="relative w-[24px] h-[24px]">
          <Image
            fill={true}
            src="/img/icons/mail.svg"
            className="w-auto h-auto mt-[2px]"
            alt="Mail Icon"
          />
        </div>
        <div className="ml-3">
          {teamContactEmail}
        </div>
      </Link>

      <Link
        href={`https://twitter.com/patmatthews`}
        target="_blank"
        className={contactLinkStyles}
        onClick={() => { contactLinkClicked(`https://twitter.com/patmatthews`) }}>

        <div className="relative w-[24px] h-[24px]">
          <Image
            fill={true}
            src="/img/icons/twitter-x.svg"
            className="w-auto h-auto mt-[2px]"
            alt="Twitter X Icon"
          />
        </div>
        <div className="ml-3">
          @patmatthews
        </div>
      </Link>

      <Link
        href={`https://www.linkedin.com/in/pat-matthews/`}
        target="_blank"
        className={contactLinkStyles}
        onClick={() => { contactLinkClicked(`https://www.linkedin.com/in/pat-matthews/`) }}>

        <div className="relative w-[24px] h-[24px]">
          <Image
            fill={true}
            src="/img/icons/linkedin.svg"
            className="w-auto h-auto"
            alt="LinkedIn Icon"
          />
        </div>
        <div className="ml-3 text-nowrap">
          pat-matthews
        </div>
      </Link>

    </div>
  </div>
}

export default Contact