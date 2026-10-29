import Image from "next/image"
import { faintBorder } from "../src/cssClasses"
import type { ApproachItem } from "@/lib/content"

export default function HowWeInvest({ items }: { items: ApproachItem[] }) {
  return (
    <div className={`w-full ${faintBorder} rounded-[25px] overflow-hidden`}>
      <div className="hwi-grid">
        {items.map((item, i) => (
          <div key={i} className="hwi-cell">
            <Image
              src={item.icon}
              width={24}
              height={24}
              unoptimized
              alt={item.label}
              className="flex-shrink-0"
            />
            <span className="ml-[16px] text-white text- whitespace-nowrap">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
