export interface ApproachItem {
  label: string
  icon: string
}

export interface SiteContent {
  hero_title: string
  hero_subtitle: string
  about_pat: string
  about_active_capital: string
  approach_items: ApproachItem[]
  contact_html: string
}

// Production content captured on 2026-10-29. Edit here and deploy to update the site.
export const SITE_CONTENT: SiteContent = {
  "about_active_capital": "Active Capital is a founder-led, pre-seed venture capital firm. We like to be one of the first investors in a company, typically writing $500K first checks. We’re equally comfortable leading rounds or investing alongside other great investors. Having built and operated technology companies ourselves, we love working with founders who stay lean and scrappy until they find product-market fit, then scale ambitiously from there. As companies grow and relationships develop, we have the ability to invest significantly more over time.",
  "about_pat": "Hi, I’m Pat. I’m an entrepreneur turned investor. I’ve spent my career building, scaling, and investing in enterprise software and cloud infrastructure.&nbsp; I started Active Capital because I love working with technical founders and helping them reach their potential. Today, I’m backing founders rebuilding software and infrastructure for an AI-native world.&nbsp; If that’s you, I’d love to hear from you. Warm intros and cold emails are always welcome.",
  "approach_items": [
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
  ],
  "contact_html": "<p>If you’re raising a pre-seed round we’d love to learn more. Email is best: team@active.vc</p>",
  "hero_subtitle": "<div>Backing technical founders rebuilding&nbsp;</div><div>software &amp; infrastructure for an AI-native world.</div>",
  "hero_title": "Founder Led Capital for Founder Led Companies"
}
