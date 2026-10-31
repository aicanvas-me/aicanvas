// Types for the site's icons. Import each icon from its own file (@/app/_icons/icons/<name>):
// built by scripts/site-icons.mjs from the vault package, with no barrel on purpose.
import type { ComponentType } from 'react'
import type { IconProps } from './Icon'

export type { IconProps, IconVariant } from './Icon'
export type SiteIcon = ComponentType<IconProps>
