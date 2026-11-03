import { TOTAL_COMPONENTS } from './component-nav.generated'
import { ANDROMEDA_COMPONENT_META, ANDROMEDA_TEMPLATE_META } from '../_lib/andromeda/andromeda-meta'
import {
  ANDROMEDA_COMPONENT_META as ANDROMEDA_PRO_COMPONENT_META,
  ANDROMEDA_TEMPLATE_META as ANDROMEDA_PRO_TEMPLATE_META,
} from '../_lib/andromeda-pro/andromeda-meta'

// Everything installable, counted from source: the standalones plus both
// systems' components and templates. The same sum the homepage shows. Server
// only in practice: the two meta lists are ~45 KB, so a client page takes the
// number as a prop instead of importing this.
export const CATALOG_TOTAL =
  TOTAL_COMPONENTS +
  ANDROMEDA_COMPONENT_META.length +
  ANDROMEDA_TEMPLATE_META.length +
  ANDROMEDA_PRO_COMPONENT_META.length +
  ANDROMEDA_PRO_TEMPLATE_META.length
