export type SpecimenIcon = { name: string; markup: string }

// What the homepage hands the icon section.
export type SectionProps = {
  /** Every icon in the set; 0 in a build without the icon source. */
  iconCount: number
  /** Real Line icons (name + SVG markup) for live demos; empty without the icon source. */
  lineIcons: SpecimenIcon[]
}
