import { Lexend } from "next/font/google"

const fontLexend = Lexend({
  weight: '300',
  subsets: ['latin'],
})

const footerStyles = `bg-gray-dark absolute bottom-0 w-full h-[96px] tracking-widest
flex items-center justify-center rounded-none z-10`

const Footer = () => {

  const scrollFadeInStyles = `
    transition-opacity
    ease-in
    duration-500
  `

  return (<div className={`${footerStyles}`}>
    <div className={`flex flex-col lg:flex-row items-center justify-between 
      w-full 
      text-[10px] text-white opacity-40
      ${fontLexend.className} leading-relaxed
      ${scrollFadeInStyles}
      `}>
      <div className="lg:ml-16">&copy; {new Date().getFullYear()} ACTIVE VENTURE PARTNERS, LLC.</div>
      <div className="lg:mr-16">BUILDING IN TEXAS. INVESTING ALL OVER.</div>
    </div>
  </div>)
}

export default Footer