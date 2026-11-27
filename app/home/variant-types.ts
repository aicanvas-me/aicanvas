import type { SpecimenIcon } from './IconSpecimen'

// What the homepage hands each design variant of the whoosh and icon sections.
export type VariantProps = {
  /** Every icon in the set; 0 in a build without the icon source. */
  iconCount: number
  /** Real Line icons (name + SVG markup) for live demos; empty without the icon source. */
  lineIcons: SpecimenIcon[]
}
