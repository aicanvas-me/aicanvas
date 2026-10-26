import { BRAIN_FAQ, faqJsonLd } from '@/app/lib/faq'

// The AI Brain page's questions come from the one site FAQ (app/lib/faq.ts), so
// they read the same here as on /faq. The same strings render the visible FAQ
// (BrainStoryV4) and the FAQPage structured data (page.tsx).
export { BRAIN_FAQ }
export const BRAIN_FAQ_JSON_LD = faqJsonLd(BRAIN_FAQ)
