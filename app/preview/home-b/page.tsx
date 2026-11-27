import { HomePage } from '../../home/HomePage'
import { getHomeData } from '../../home/home-data'

// The homepage with variant B of the whoosh and icon sections, for comparison.
export default async function PreviewHomeB() {
  return <HomePage {...await getHomeData()} variant="b" />
}
