'use client'

// npm install @phosphor-icons/react framer-motion

import { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BookmarkSimple } from '@phosphor-icons/react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type LogoKey = 'claude' | 'openai' | 'gemini' | 'vercel' | 'mistral' | 'perplexity'

interface CardData {
  rate: string
  title: string
  role: string
}

interface StackData {
  logo: LogoKey
  company: string
  // Both colors: 6-digit hex only, since the card border appends a 1A alpha.
  borderColor: string
  borderColorLight?: string
  cards: [CardData, CardData, CardData]
}

const STACKS: StackData[] = [
  {
    logo: 'claude' as const,
    company: 'Anthropic',
    borderColor: '#d97757',
    cards: [
      { rate: '$120/hr',     title: 'Prompt Engineer',        role: 'AI Research'        },
      { rate: '$145/hr',     title: 'AI Safety Researcher',   role: 'Safety & Alignment' },
      { rate: '$155/hr',     title: 'Interpretability Lead',  role: 'Research'           },
    ],
  },
  {
    logo: 'perplexity' as const,
    company: 'Perplexity',
    borderColor: '#FFFFFF',
    borderColorLight: '#1C1C1C',
    cards: [
      { rate: '$160/hr',     title: 'Generative AI Lead',     role: 'AI Platform'        },
      { rate: '$135/hr',     title: 'ML Engineer',            role: 'Infrastructure'     },
      { rate: '$140/hr',     title: 'Search AI Researcher',   role: 'Research'           },
    ],
  },
  {
    logo: 'gemini' as const,
    company: 'Google',
    borderColor: '#4893FC',
    cards: [
      { rate: '$130–160/hr', title: 'LLM Platform Engineer',  role: 'Engineering'        },
      { rate: '$150/hr',     title: 'AI Research Scientist',  role: 'Research'           },
      { rate: '$165/hr',     title: 'Multimodal AI Lead',     role: 'DeepMind'           },
    ],
  },
]

const CARD_H = 234
const PEEK   = 20

const SLOTS = [
  { y: 0,        scale: 1,    z: 3 },
  { y: PEEK,     scale: 0.96, z: 2 },
  { y: PEEK * 2, scale: 0.92, z: 1 },
]

function ClaudeLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#d97757"
        d="M 233.959793 800.214905 L 468.644287 668.536987 L 472.590637 657.100647 L 468.644287 650.738403 L 457.208069 650.738403 L 417.986633 648.322144 L 283.892639 644.69812 L 167.597321 639.865845 L 54.926208 633.825623 L 26.577238 627.785339 L 3.3e-05 592.751709 L 2.73832 575.27533 L 26.577238 559.248352 L 60.724873 562.228149 L 136.187973 567.382629 L 249.422867 575.194763 L 331.570496 580.026978 L 453.261841 592.671082 L 472.590637 592.671082 L 475.328857 584.859009 L 468.724915 580.026978 L 463.570557 575.194763 L 346.389313 495.785217 L 219.543671 411.865906 L 153.100723 363.543762 L 117.181267 339.060425 L 99.060455 316.107361 L 91.248367 266.01355 L 123.865784 230.093994 L 167.677887 233.073853 L 178.872513 236.053772 L 223.248367 270.201477 L 318.040283 343.570496 L 441.825592 434.738342 L 459.946411 449.798706 L 467.194672 444.64447 L 468.080597 441.020203 L 459.946411 427.409485 L 392.617493 305.718323 L 320.778564 181.932983 L 288.80542 130.630859 L 280.348999 99.865845 C 277.369171 87.221436 275.194641 76.590698 275.194641 63.624268 L 312.322174 13.20813 L 332.8591 6.604126 L 382.389313 13.20813 L 403.248352 31.328979 L 434.013519 101.71814 L 483.865753 212.537048 L 561.181274 363.221497 L 583.812134 407.919434 L 595.892639 449.315491 L 600.40271 461.959839 L 608.214783 461.959839 L 608.214783 454.711609 L 614.577271 369.825623 L 626.335632 265.61084 L 637.771851 131.516846 L 641.718201 93.745117 L 660.402832 48.483276 L 697.530334 24.000122 L 726.52356 37.852417 L 750.362549 72 L 747.060486 94.067139 L 732.886047 186.201416 L 705.100708 330.52356 L 686.979919 427.167847 L 697.530334 427.167847 L 709.61084 415.087341 L 758.496704 350.174561 L 840.644348 247.490051 L 876.885925 206.738342 L 919.167847 161.71814 L 946.308838 140.29541 L 997.61084 140.29541 L 1035.38269 196.429626 L 1018.469849 254.416199 L 965.637634 321.422852 L 921.825562 378.201538 L 859.006714 462.765259 L 819.785278 530.41626 L 823.409424 535.812073 L 832.75177 534.92627 L 974.657776 504.724915 L 1051.328979 490.872559 L 1142.818848 475.167786 L 1184.214844 494.496582 L 1188.724854 514.147644 L 1172.456421 554.335693 L 1074.604126 578.496765 L 959.838989 601.449829 L 788.939636 641.879272 L 786.845764 643.409485 L 789.261841 646.389343 L 866.255127 653.637634 L 899.194702 655.409424 L 979.812134 655.409424 L 1129.932861 666.604187 L 1169.154419 692.537109 L 1192.671265 724.268677 L 1188.724854 748.429688 L 1128.322144 779.194641 L 1046.818848 759.865845 L 856.590759 714.604126 L 791.355774 698.335754 L 782.335693 698.335754 L 782.335693 703.731567 L 836.69812 756.885986 L 936.322205 846.845581 L 1061.073975 962.81897 L 1067.436279 991.490112 L 1051.409424 1014.120911 L 1034.496704 1011.704712 L 924.885986 929.234924 L 882.604126 892.107544 L 786.845764 811.48999 L 780.483276 811.48999 L 780.483276 819.946289 L 802.550415 852.241699 L 919.087341 1027.409424 L 925.127625 1081.127686 L 916.671204 1098.604126 L 886.469849 1109.154419 L 853.288696 1103.114136 L 785.073914 1007.355835 L 714.684631 899.516785 L 657.906067 802.872498 L 650.979858 806.81897 L 617.476624 1167.704834 L 601.771851 1186.147705 L 565.530212 1200 L 535.328857 1177.046997 L 519.302124 1139.919556 L 535.328857 1066.550537 L 554.657776 970.792053 L 570.362488 894.68457 L 584.536926 800.134277 L 592.993347 768.724976 L 592.429626 766.630859 L 585.503479 767.516968 L 514.22821 865.369263 L 405.825531 1011.865906 L 320.053711 1103.677979 L 299.516815 1111.812256 L 263.919525 1093.369263 L 267.221497 1060.429688 L 287.114136 1031.114136 L 405.825531 880.107361 L 477.422913 786.52356 L 523.651062 732.483276 L 523.328918 724.671265 L 520.590698 724.671265 L 205.288605 929.395935 L 149.154434 936.644409 L 124.993355 914.01355 L 127.973183 876.885986 L 139.409409 864.80542 L 234.201385 799.570435 Z"
      />
    </svg>
  )
}

function OpenAILogo({ isDark }: { isDark: boolean }) {
  const fill = isDark ? '#FFFFFF' : '#000000'
  return (
    <svg width="24" height="24" viewBox="18 0 288 320" fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path d="M123.2,118.3V85c0-2.2,0.6-3.8,2.9-5.1L187.9,44c8.3-4.8,18.9-7,29.2-7c39.1,0,63.8,30.1,63.8,62.5
        c0,2.6,0,6.1-0.6,9l-64.7-37.8c-3.2-1.9-6.7-2.2-10.6,0L123.2,118.3z M266.1,236.6v-74c0-4.2-1.6-7-5.4-9.3l-82-47.7l28.8-16.7
        c1.6-1,4.2-1,5.8,0l62.2,35.9c17.6,10.3,29.8,32.7,29.8,54.1C305.2,204.2,289.8,227.6,266.1,236.6z M106.2,172.8l-28.5-17
        c-2.2-1.3-2.9-2.9-2.9-5.1V79.3c0-34.9,26.6-61.2,62.8-61.2c14.1,0,27.6,4.8,38.4,13.5L111.7,69c-3.8,2.2-5.4,5.1-5.4,9.3V172.8z
        M162,204.9l-38.8-21.8v-46.1l38.8-21.8l38.4,21.8v46.1L162,204.9z M186,301.9c-14.1,0-27.6-4.8-38.4-13.5L212,251
        c3.8-2.2,5.4-5.1,5.4-9.3v-94.5l28.8,17c2.2,1.3,2.9,2.9,2.9,5.1v71.5C249.1,275.7,222.2,301.9,186,301.9z M110.4,231.1l-62.2-35.9
        c-17.6-10.3-29.8-32.7-29.8-54.1c0-25.6,15.7-48.7,39.4-57.7v74.3c0,4.2,1.6,7,5.4,9.3l81.7,47.4l-28.8,16.7
        C114.6,232.1,112,232.1,110.4,231.1z M106.5,283c-36.8,0-63.8-27.6-63.8-61.8c0-3.2,0.3-6.4,0.6-9.3l64.4,37.2c3.8,2.2,7,2.2,10.9,0
        l81.7-47.4V235c0,2.2-0.6,3.8-2.9,5.1L135.7,276C127.4,280.8,116.8,283,106.5,283z M186,319.2c38.4,0,70.5-27.6,77.5-64.1
        c35.9-9,59-42.3,59-76.3c0-22.4-9.6-43.9-27.2-59.6c1.6-6.7,2.9-13.8,2.9-20.5c0-45.2-36.8-79.1-79.1-79.1
        c-8.7,0-17.3,1.6-25.6,4.5C179,9.7,159.4,0.8,137.6,0.8c-38.4,0-70.5,27.6-77.5,64.1c-35.9,9-59,42.3-59,76.3
        c0,22.4,9.6,43.9,27.2,59.6c-1.6,6.7-2.9,13.8-2.9,20.5c0,45.2,36.8,79.1,79.1,79.1c8.7,0,17.3-1.6,25.6-4.5
        C144.7,310.3,164.2,319.2,186,319.2z" />
    </svg>
  )
}

function GeminiLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gemini-grad" x1="18.447" y1="43.42" x2="52.153" y2="15.004" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4893FC" />
          <stop offset="0.27" stopColor="#4893FC" />
          <stop offset="0.777" stopColor="#969DFF" />
          <stop offset="1" stopColor="#BD99FE" />
        </linearGradient>
      </defs>
      <path
        d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z"
        fill="url(#gemini-grad)"
      />
    </svg>
  )
}

function VercelLogo({ isDark }: { isDark: boolean }) {
  const fill = isDark ? '#FFFFFF' : '#000000'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,3 22,21 2,21" fill={fill} />
    </svg>
  )
}

function MistralLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#FF7000" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#FF7000" opacity="0.7" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#FF7000" opacity="0.7" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#FF7000" />
    </svg>
  )
}

function PerplexityLogo({ isDark }: { isDark: boolean }) {
  const fill = isDark ? '#FFFFFF' : '#1C1C1C'
  return (
    <svg width="24" height="24" viewBox="0 0 16 16" fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 .188a.5.5 0 0 1 .503.5V4.03l3.022-2.92.059-.048a.51.51 0 0 1 .49-.054.5.5 0 0 1 .306.46v3.247h1.117l.1.01a.5.5 0 0 1 .403.49v5.558a.5.5 0 0 1-.503.5H12.38v3.258a.5.5 0 0 1-.312.462.51.51 0 0 1-.55-.11l-3.016-3.018v3.448c0 .275-.225.5-.503.5a.5.5 0 0 1-.503-.5v-3.448l-3.018 3.019a.51.51 0 0 1-.548.11.5.5 0 0 1-.312-.463v-3.258H2.503a.5.5 0 0 1-.503-.5V5.215l.01-.1c.047-.229.25-.4.493-.4H3.62V1.469l.006-.074a.5.5 0 0 1 .302-.387.51.51 0 0 1 .547.102l3.023 2.92V.687c0-.276.225-.5.503-.5M4.626 9.333v3.984l2.87-2.872v-4.01zm3.877 1.113 2.871 2.871V9.333l-2.87-2.897zm3.733-1.668a.5.5 0 0 1 .145.35v1.145h.612V5.715H9.201zm-9.23 1.495h.613V9.13c0-.131.052-.257.145-.35l3.033-3.064h-3.79zm1.62-5.558H6.76L4.626 2.652zm4.613 0h2.134V2.652z" />
    </svg>
  )
}

function BrandLogo({ logo, isDark }: { logo: LogoKey; isDark: boolean }) {
  switch (logo) {
    case 'claude':      return <ClaudeLogo />
    case 'openai':      return <OpenAILogo isDark={isDark} />
    case 'gemini':      return <GeminiLogo />
    case 'vercel':      return <VercelLogo isDark={isDark} />
    case 'mistral':     return <MistralLogo />
    case 'perplexity':  return <PerplexityLogo isDark={isDark} />
    default:            return null
  }
}

function useIsDark(ref: React.RefObject<HTMLElement | null>) {
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)
  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => {
      const card = el.closest('[data-card-theme]')
      setIsDark(card
        ? card.classList.contains('dark')
        : document.documentElement.classList.contains('dark'))
    }
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) obs.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [ref])
  return isDark
}

interface SingleCardProps {
  card: CardData
  stack: StackData
  isDark: boolean
  isFront: boolean
  frontIndex: number
  onCycle: () => void
}

function SingleCard({ card, stack, isDark, isFront, frontIndex, onCycle }: SingleCardProps) {
  const [bookmarked, setBookmarked] = useState(false)

  const cardBg = isDark ? '#1e1e1c' : '#F7F7EF'
  const borderColor = isDark ? stack.borderColor : (stack.borderColorLight ?? stack.borderColor)
  const rateColor    = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(30,30,28,0.55)'
  const titleColor   = isDark ? '#F5F5F0' : '#141412'
  const arrowColor   = isFront
    ? (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)')
    : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)')
  const dotFill      = isDark ? '#E5E5E0' : '#2a2a28'
  const dotEmpty     = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)'
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const companyColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const roleColor    = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'
  const btnBg        = isDark ? '#e8e8e0' : '#1a1a18'
  const btnText      = isDark ? '#1a1a18' : '#FFFFFF'
  const shadowVal    = isDark
    ? '0 2px 12px rgba(0,0,0,0.35)'
    : '0 2px 8px rgba(0,0,0,0.07)'
  const shadowHover  = isDark
    ? '0 12px 32px rgba(0,0,0,0.55)'
    : '0 12px 24px rgba(0,0,0,0.13)'

  return (
    <div
      onMouseEnter={e => { if (isFront) (e.currentTarget as HTMLDivElement).style.boxShadow = shadowHover }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = shadowVal }}
      style={{
        background: cardBg,
        borderRadius: 32,
        border: `1px solid ${borderColor}1A`,
        padding: '18px 18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        boxShadow: shadowVal,
        transition: 'box-shadow 0.25s ease',
        height: CARD_H,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: rateColor, letterSpacing: '0.02em' }}>
          {card.rate}
        </span>
        <motion.button
          onClick={(e) => { e.stopPropagation(); setBookmarked(b => !b) }}
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <BookmarkSimple weight={bookmarked ? 'fill' : 'regular'} size={18} color={bookmarked ? '#e05c6a' : arrowColor} />
        </motion.button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flex: 1 }}>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: titleColor,
            lineHeight: 1.18,
            letterSpacing: '-0.025em',
            margin: 0,
            flex: 1,
            maxWidth: '72%',
          }}
        >
          {card.title}
        </h3>
        <motion.button
          onClick={(e) => { e.stopPropagation(); if (isFront) onCycle() }}
          whileTap={isFront ? { scale: 0.9 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            background: 'none', border: 'none',
            cursor: isFront ? 'pointer' : 'default',
            padding: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 5, flexShrink: 0, marginRight: 6,
          }}
          aria-label={isFront ? 'Next card' : undefined}
        >
          {[0, 1, 2].map(i => {
            const isFrontDot = i === frontIndex
            return (
              <div key={i} style={{
                width: 5,
                height: isFrontDot ? 32 : 5,
                borderRadius: 3,
                background: isFrontDot ? dotFill : dotEmpty,
                transition: 'height 0.25s ease, background 0.25s ease',
              }} />
            )
          })}
        </motion.button>
      </div>

      <div style={{ height: 1, background: dividerColor, marginBottom: 14 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, flexShrink: 0 }}>
            <BrandLogo logo={stack.logo} isDark={isDark} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: roleColor, lineHeight: 1.2 }}>
              {stack.company}
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, color: companyColor, lineHeight: 1.2 }}>
              {card.role}
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: btnBg, color: btnText, border: 'none',
            borderRadius: 999, padding: '7px 16px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            letterSpacing: '0.01em', flexShrink: 0,
          }}
        >
          View
        </motion.button>
      </div>
    </div>
  )
}

interface CardStackProps {
  stack: StackData
  isDark: boolean
}

function CardStack({ stack, isDark }: CardStackProps) {
  const [order, setOrder] = useState<[number, number, number]>([0, 1, 2])
  const [exitingId, setExitingId] = useState<number | null>(null)
  const exitDir = useRef<'up' | 'down'>('up')
  const [returningIds, setReturningIds] = useState<Set<number>>(new Set())
  const dismissing = useRef(false)
  const orderRef = useRef(order)

  useEffect(() => {
    orderRef.current = order
  }, [order])

  const cycle = useCallback((dir: 'up' | 'down' = 'up') => {
    if (dismissing.current) return
    dismissing.current = true
    exitDir.current = dir

    const frontId = orderRef.current[0]
    setExitingId(frontId)

    setTimeout(() => {
      setReturningIds(new Set([frontId]))
      setOrder(prev => [prev[1], prev[2], prev[0]])
      setExitingId(null)

      requestAnimationFrame(() => requestAnimationFrame(() => {
        setReturningIds(new Set())
        dismissing.current = false
      }))
    }, 380)
  }, [])

  const containerHeight = CARD_H + PEEK * 2 + 4

  return (
    <div
      style={{
        position: 'relative',
        height: containerHeight,
        width: '100%',
      }}
    >
      {([0, 1, 2] as const).map((cardIndex) => {
        const slotIndex = order.indexOf(cardIndex)
        const slot = SLOTS[slotIndex]
        const isExiting = exitingId === cardIndex
        const isReturning = returningIds.has(cardIndex)
        const isFront = slotIndex === 0

        const animTarget = isExiting
          ? { y: exitDir.current === 'down' ? 160 : -160, scale: 0.88, opacity: 0 }
          : { y: slot.y, scale: slot.scale, opacity: 1 }

        // The exit duration must equal the 380 ms timeout in cycle().
        const animTransition = isExiting
          ? { duration: 0.38, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
          : isReturning
            ? { duration: 0 }
            : { type: 'spring' as const, stiffness: 280, damping: 26 }

        return (
          <motion.div
            key={cardIndex}
            animate={animTarget}
            transition={animTransition}
            drag={isFront ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.y) > 60 || Math.abs(info.velocity.y) > 400) {
                cycle(info.offset.y > 0 ? 'down' : 'up')
              }
            }}
            whileHover={isFront ? { y: slot.y - 4, transition: { type: 'spring', stiffness: 300, damping: 24 } } : {}}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              zIndex: isExiting ? 10 : slot.z,
              transformOrigin: 'center top',
              cursor: isFront ? 'grab' : 'default',
            }}
          >
            <SingleCard
              card={stack.cards[cardIndex]}
              stack={stack}
              isDark={isDark}
              isFront={isFront}
              frontIndex={order[0]}
              onCycle={cycle}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

export default function AiJobCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDark = useIsDark(containerRef)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setNarrow(entry.contentRect.width < 480)
      }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const outerBg = isDark ? '#0d0d0c' : '#CADBDD'

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen w-full items-center justify-center"
      style={{ background: outerBg }}
    >
      <div
        style={{
          width: '100%',
          padding: 'clamp(16px, 5%, 40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: narrow ? 'column' : 'row',
            gap: 16,
            width: '100%',
            maxWidth: 760,
            alignItems: narrow ? 'stretch' : 'flex-start',
          }}
        >
          {STACKS.map((stack, i) => (
            <div key={i} style={{ flex: 1, minWidth: 0 }}>
              <CardStack stack={stack} isDark={isDark} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
