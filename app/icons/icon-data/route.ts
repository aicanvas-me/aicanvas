import { icons } from '../_lib/server-data'

export const dynamic = 'force-static'

export function GET() {
  return Response.json(icons)
}
