import Image from "next/image"
import { faintBorder } from "../src/cssClasses"
import type { ApproachItem } from "@/lib/content"

const DEFAULT_ITEMS: ApproachItem[] = [
  { label: "Pre-Seed Investing", icon: "/img/icons/how_we_invest/Pre-Seed Investing.svg" },
  { label: "Business Software", icon: "/img/icons/how_we_invest/AI-Native Software.svg" },
  { label: "$100k - $1M Checks", icon: "/img/icons/how_we_invest/100k-1M Checks.svg" },
  { label: "Technical Founders", icon: "/img/icons/how_we_invest/Technical Founders.svg" },
  { label: "Apps, Agents, Infra", icon: "/img/icons/how_we_invest/B2B, Infra, Dev Tools.png" },
  { label: "Building in the US", icon: "/img/icons/how_we_invest/Buildin in the US.svg" },
]

export default function HowWeInvest({ items }: { items?: ApproachItem[] }) {
  const displayItems = items && items.length > 0 ? items : DEFAULT_ITEMS

  return (
    <div className={`w-full ${faintBorder} rounded-[25px] overflow-hidden`}>
      <div className="hwi-grid">
        {displayItems.map((item, i) => (
          <div key={i} className="hwi-cell">
            <Image
              src={item.icon}
              width={24}
              height={24}
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
