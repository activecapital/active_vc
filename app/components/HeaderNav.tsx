'use client'

import { ActiveCapitalLogo } from "./Logos"

const headerNavStyles = `bg-gray-dark 
  w-full h-[96px] 
  z-10
  flex items-center justify-center rounded-none px-4 py-2 lg:px-8 lg:py-4`

const HeaderNav = () => {


  return (<div className={headerNavStyles}>
    <div className="flex align-center items-center justify-center">

      <ActiveCapitalLogo />

    </div>
  </div>)
}

export default HeaderNav