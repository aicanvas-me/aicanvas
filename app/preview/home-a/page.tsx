import { HomePage } from '../../home/HomePage'
import { getHomeData } from '../../home/home-data'

// The homepage with variant A of the whoosh and icon sections, for comparison.
export default async function PreviewHomeA() {
  return <HomePage {...await getHomeData()} variant="a" />
}
