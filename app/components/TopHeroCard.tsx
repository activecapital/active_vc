import { Lexend_Deca } from 'next/font/google'
import { getAllContent } from '@/lib/content'

const fontLexendDeca = Lexend_Deca({
  weight: ['600', '700'],
  subsets: ['latin']
})

const containerClasses = `p-4 md:p-8 text-center flex flex-col items-center justify-center`

const TopHeroCard = async () => {
  const content = await getAllContent()
  const heroTitle = content.hero_title
  const heroSubtitle = content.hero_subtitle

  return (<div className={`${containerClasses} h-[calc(50vh)] sm:h-[calc(100vh-96px-36px)]
    bg-[url('/img/hero-bg-500.svg')]
    md:bg-[url('/img/hero-bg.svg')]
    bg-no-repeat bg-contain bg-center
    `}
  >

    <h1 className={`${fontLexendDeca.className} text-white
      text-[34px] sm:text-[48px] md:text-[56px] 
      leading-[42px] sm:leading-[56px] md:leading-[74px]`}>
  {heroTitle.split('\n').length > 1
    ? heroTitle.split('\n').map((line, i) => (
        <span key={i}>{line}{i < heroTitle.split('\n').length - 1 && <br />}</span>
      ))
    : <>
        <span className="hidden md:inline">Founder Led Capital for<br />Founder Led Companies</span>
        <span className="md:hidden">{heroTitle}</span>
      </>
  }
</h1>

    <div className="
      mt-4
      text-gray
      text-[18px]
      md:text-[24px]
      leading-[24px] tracking-wide">
      {/* mobile screens */}
      <div className='md:hidden'>{heroSubtitle}</div>
      {/* large screens */}
      <div className='hidden md:block'>{heroSubtitle}</div>
    </div>
  </div>)
}

export default TopHeroCard