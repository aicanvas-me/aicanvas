/* eslint-disable @typescript-eslint/no-unused-vars -- each call only adds its @font-face */
import localFont from 'next/font/local'
import styles from './site.module.css'

// Google's own files, one per script: latin preloads, the rest load only when used.

const manropeCyrillicExt = localFont({
  src: './manrope/cyrillic-ext.woff2',
  weight: '200 800',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Manrope'" },
    { prop: 'unicode-range', value: 'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F' },
  ],
})

const manropeCyrillic = localFont({
  src: './manrope/cyrillic.woff2',
  weight: '200 800',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Manrope'" },
    { prop: 'unicode-range', value: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116' },
  ],
})

const manropeGreek = localFont({
  src: './manrope/greek.woff2',
  weight: '200 800',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Manrope'" },
    { prop: 'unicode-range', value: 'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF' },
  ],
})

const manropeVietnamese = localFont({
  src: './manrope/vietnamese.woff2',
  weight: '200 800',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Manrope'" },
    { prop: 'unicode-range', value: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB' },
  ],
})

const manropeLatinExt = localFont({
  src: './manrope/latin-ext.woff2',
  weight: '200 800',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Manrope'" },
    { prop: 'unicode-range', value: 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF' },
  ],
})

const manropeLatin = localFont({
  src: './manrope/latin.woff2',
  weight: '200 800',
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Manrope'" },
    { prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' },
  ],
})

const geistMonoCyrillicExt = localFont({
  src: './geist-mono/cyrillic-ext.woff2',
  weight: '100 900',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Geist Mono'" },
    { prop: 'unicode-range', value: 'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F' },
  ],
})

const geistMonoCyrillic = localFont({
  src: './geist-mono/cyrillic.woff2',
  weight: '100 900',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Geist Mono'" },
    { prop: 'unicode-range', value: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116' },
  ],
})

const geistMonoSymbols2 = localFont({
  src: './geist-mono/symbols2.woff2',
  weight: '100 900',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Geist Mono'" },
    { prop: 'unicode-range', value: 'U+2000-2001, U+2004-2008, U+200A, U+23B8-23BD, U+2500-259F' },
  ],
})

const geistMonoVietnamese = localFont({
  src: './geist-mono/vietnamese.woff2',
  weight: '100 900',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Geist Mono'" },
    { prop: 'unicode-range', value: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB' },
  ],
})

const geistMonoLatinExt = localFont({
  src: './geist-mono/latin-ext.woff2',
  weight: '100 900',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Geist Mono'" },
    { prop: 'unicode-range', value: 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF' },
  ],
})

const geistMonoLatin = localFont({
  src: './geist-mono/latin.woff2',
  weight: '100 900',
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'Geist Mono'" },
    { prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' },
  ],
})

export const manrope = { variable: styles.manrope }
export const geistMono = { variable: styles.geistMono }
