import { Lexend_Deca } from 'next/font/google'
const fontLexendDeca = Lexend_Deca({
  weight: ['600', '700'],
  subsets: ['latin']
})

const containerClasses = `p-4 md:p-8 text-center flex flex-col items-center justify-center`

const TopHeroCard = () => {

  return (<div className={`${containerClasses} h-[calc(50vh)] sm:h-[calc(100vh-96px-36px)]
    bg-[url('/img/hero-bg-500.svg')]
    md:bg-[url('/img/hero-bg.svg')]
    bg-no-repeat bg-contain bg-center
    `}
  >

    <h1 className={`${fontLexendDeca.className} text-white
      text-[34px] sm:text-[48px] md:text-[56px] 
      leading-[42px] sm:leading-[56px] md:leading-[74px]`}>
  <span className="hidden md:inline">Founder Led Capital For<br />Founder Led Companies</span>
  <span className="md:hidden">Founder Led Capital For Founder Led Companies</span>
</h1>

    <div className="
      mt-4
      text-gray
      text-[14px]
      md:text-[20px]
      leading-[24px] tracking-wide">
      {/* mobile screens */}
      <div className='md:hidden'>Pre-Seed Investing in the</div>
      <div className='md:hidden'>Future of Enterprise Software</div>
      {/* large screens */}
      <div className='hidden md:block'>Pre-Seed Investing in the Future of Enterprise Software
      </div>
    </div>
  </div>)
}

export default TopHeroCard