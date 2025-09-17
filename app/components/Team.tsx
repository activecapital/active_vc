// Team.tsx
import { track } from '@vercel/analytics';
import { faintBorder, hoverDimmed } from "../src/cssClasses";

import Image from "next/image";
import Link from "next/link";
import { Poppins } from 'next/font/google';
import React from 'react';

const fontPoppins = Poppins({
  weight: ['400', '600'],
  subsets: ['latin']
});

const handleContactEmailClicked = (e: React.MouseEvent<HTMLElement>, contactEmail: string) => {
  e.preventDefault();
  track('Contact Link clicked', { url: contactEmail });

  navigator.clipboard.writeText(contactEmail)
    .then(() => {
      alert(`Email ${contactEmail} copied to clipboard.`);
    })
    .catch((err) => {
      console.error('Error copying email to clipboard:', err);
    });
};

const contactLinkClicked = (url: string) => {
  track('Contact Link clicked', { url });
};

// Reusable ContactLink component
interface ContactLinkProps {
  type: "Email" | "LinkedIn" | "Twitter";
  link: string;
}

const ContactLink: React.FC<ContactLinkProps> = ({ type, link }) => {
  const isEmail = type === "Email";
  const iconSrc = isEmail ? "/img/icons/mail.svg" : type === "LinkedIn" ? "/img/icons/linkedin.svg" : "/img/icons/twitter-x.svg";
  const altText = `${type} Icon`;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isEmail) {
      handleContactEmailClicked(e, link);
    } else {
      contactLinkClicked(link);
    }
  };

  return (
    <Link
      href={isEmail ? '#' : link}
      target={isEmail ? '_self' : '_blank'}
      onClick={handleClick}
    >
      <div className="relative w-[24px] h-[24px]">
        <Image
          fill={true}
          src={iconSrc}
          className="w-auto h-auto mt-[2px]"
          alt={altText}
        />
      </div>
    </Link>
  );
};

const Team = () => {
  const memberCardStyles = `px-8 py-8 relative flex flex-col w-full ${faintBorder} rounded-[24px]`;
  const memberImageStyles = `rounded-full max-w-[124px] max-h-[124px] lg:max-w-[144px] lg:max-h-[144px] mx-auto`;
  const fullnameStyles = `text-center text-white hover:opacity-75 whitespace-nowrap overflow-hidden ${fontPoppins.className} ${hoverDimmed} mt-6`;
  const titleStyles = `text-center text-[16px] leading-6`;

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
      fullname: "Chris Saum",
      title: "Investment Partner",
      img: "/img/photos/chris-saum.png",
      url: "https://www.linkedin.com/in/chris-saum-84938047/",
      email: "chris@active.vc",
      linkedin: "https://www.linkedin.com/in/chris-saum-84938047/",
      twitter: "https://x.com/christophersaum",
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
      fullname: "Avery Keller",
      title: "Executive Admin",
      img: "/img/photos/avery-keller.png",
      url: "https://www.linkedin.com/in/averykellermeyer/",
      email: "",
      linkedin: "",
      twitter: "",
    },
    {
      fullname: "Kevin Minnick",
      title: "Technical Advisor",
      img: "/img/photos/kevin-minnick.png",
      url: "https://www.linkedin.com/in/kevinminnick/",
      email: "",
      linkedin: "",
      twitter: "",
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-8 sm:gap-4 xl:gap-6">
      {teamMembers.map(({ fullname, title, img, email, linkedin, twitter }) => (
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

            <div className="flex flex-row mt-2 mx-auto px-0 gap-5">
              {email && <ContactLink type="Email" link={email} />}
              {linkedin && <ContactLink type="LinkedIn" link={linkedin} />}
              {twitter && <ContactLink type="Twitter" link={twitter} />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Team;