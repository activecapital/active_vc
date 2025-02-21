import Image from "next/image"

export const ActiveCapitalLogo = () => {

  return (
    <>
      <div className={`flex flex-row items-center justify-center
        ease-in
        duration-700
        delay-[400ms]
        transition-opacity
      `}>
        <div className="relative">
          <Image
            src="/img/active-capital-icon-white.svg"
            width={36}
            height={0}
            className={`w-auto h-auto`}
            alt="Active Capital Icon"
            unoptimized
            priority />
        </div>
        <div className="relative ml-2">
          <Image
            src="/img/logo-white.svg"
            width={153}
            height={0}
            className={`w-auto h-auto`}
            alt={`Active Capital Logo`}
            unoptimized
            priority />
        </div>
      </div>

      <div className={`flex flex-row items-center justify-center
        ease-in
        duration-700
        delay-[600ms]
        transition-opacity
        hidden
      `}>
        <div className="absolute top-7 left-1/2 transform -translate-x-1/2">
          <Image
            src="/img/active-capital-icon-white.svg"
            width={36}
            height={0}
            className={`w-auto h-auto`}
            alt="Active Capital Icon"
            unoptimized
            priority />
        </div>
      </div>
    </>)
}