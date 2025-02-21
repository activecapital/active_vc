'use client'

import Image from "next/image"
import { useState, forwardRef, useImperativeHandle, Ref } from "react"

export interface ArrowPageNavRef {
  onLeft: () => void
  onRight: () => void
}

interface ArrowsPageNavProps {
  numPages: number
  onLeftClicked: () => void
  onRightClicked: () => void
  onGoToPage: (pageNum: number) => void
}

const ArrowsPageNav = forwardRef((props: ArrowsPageNavProps, ref: Ref<ArrowPageNavRef>) => {
  const { numPages, onLeftClicked, onRightClicked, onGoToPage } = props

  const [activePageNum, setActivePageNum] = useState(1)

  const arrowStyles = `cursor-pointer opacity-35 hover:opacity-100 transition-opacity ease-in-out duration-500`

  const bulletStyles = `text-white text-[38px] flex justify-center items-center mx-[8px] 
    transition-opacity ease-in-out duration-500`

  // functions parent can call
  useImperativeHandle(ref, function getRefValue() {
    return {
      onLeft() {
        handleLeftclicked()
      },
      onRight() {
        handleRightClicked()
      },
    }
  })

  const handleLeftclicked = () => {
    onLeftClicked()
    if (activePageNum > 1) {
      setActivePageNum(activePageNum - 1)
      return
    }

    setActivePageNum(numPages)
  }

  const handleRightClicked = () => {
    onRightClicked()
    if (activePageNum < numPages) {
      setActivePageNum(activePageNum + 1)
      return
    }

    // reset back to 1
    setActivePageNum(1)
  }

  const handleOnGoToPage = (pageNum: number) => {
    setActivePageNum(pageNum)
    onGoToPage(pageNum)
  }

  const getPageBullets = (count: number) => {
    if (count <= 0) {
      return <></>
    }
    // Create an array of `count` elements and map it to div elements
    const elements = Array.from({ length: count }, (_, index) => (
      <Image src={`/img/icons/ellipse.svg`}
        key={`pagenav-${index}`}
        width={8}
        height={8}
        onClick={() => { handleOnGoToPage(index + 1) }}
        className={`${bulletStyles} w-auto h-[8px] cursor-pointer
          ${activePageNum === index + 1 ? 'opacity-100' : 'opacity-50'}`}
        alt="ellipse" />
    ))

    return <>{elements}</>
  }

  return <div className="flex flex-row justify-between items-center">
    <div className={`${arrowStyles} mr-1 md:mr-[12px]`}>
      <Image src={`/img/icons/left-arrow-circle-white.svg`}
        onClick={handleLeftclicked}
        width={48}
        height={48}
        alt="left arrow" />
    </div>

    {getPageBullets(numPages)}

    <div className={`${arrowStyles} ml-1 md:ml-[12px]`}>
      <Image src={`/img/icons/right-arrow-circle-white.svg`}
        onClick={handleRightClicked}
        width={48}
        height={48}
        alt="right arrow" />
    </div>
  </div>
})

ArrowsPageNav.displayName = 'ArrowsPageNav'

export default ArrowsPageNav