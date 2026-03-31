import { Lexend_Deca } from 'next/font/google'
import { getAllContent } from '@/lib/content'
import { renderTextWithBreaks } from '../src/renderText'

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
  {renderTextWithBreaks(heroTitle)}
</h1>

    <div className="
      mt-4
      text-gray
      text-[18px]
      md:text-[24px]
      leading-[24px] tracking-wide">
      {renderTextWithBreaks(heroSubtitle)}
    </div>
  </div>)
}

export default TopHeroCard