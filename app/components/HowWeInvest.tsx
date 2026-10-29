import Image from "next/image"
import { faintBorder } from "../src/cssClasses"
const items = [
  {
    "icon": "/img/icons/how_we_invest/Pre-Seed Investing.svg",
    "label": "First Check Investing"
  },
  {
    "icon": "/img/icons/how_we_invest/AI-Native Software.svg",
    "label": "Pre-Seed Focused"
  },
  {
    "icon": "/img/icons/how_we_invest/100k-1M Checks.svg",
    "label": "Flexible Check Size"
  },
  {
    "icon": "/img/icons/how_we_invest/Buildin in the US.svg",
    "label": "Lead or Participate"
  },
  {
    "icon": "/img/icons/how_we_invest/Technical Founders.svg",
    "label": "Technical Founders "
  },
  {
    "icon": "/img/icons/how_we_invest/B2B, Infra, Dev Tools.png",
    "label": "AI Software & Infra"
  }
]

export default function HowWeInvest() {
  return (
    <div className={`w-full ${faintBorder} rounded-[25px] overflow-hidden`}>
      <div className="hwi-grid">
        {items.map((item, i) => (
          <div key={i} className="hwi-cell">
            <Image
              src={item.icon.split('/').map(encodeURIComponent).join('/')}
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
