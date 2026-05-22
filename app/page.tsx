import { questions, getTopicStats } from '@/data/questions'
import HeroSlideshow from '@/components/HeroSlideshow'
import HeroContent from '@/components/HeroContent'
import MobileAbout from '@/components/MobileAbout'
import AuthRedirect from '@/components/AuthRedirect'

export const metadata = { title: 'TolDrive – Führerschein Theorie' }

export default function HomePage() {
  const stats = getTopicStats()
  const totalQuestions = questions.length
  const topicsCount = Object.keys(stats).length

  return (
    <>
      <AuthRedirect />
      <HeroSlideshow>
        <HeroContent totalQuestions={totalQuestions} topicsCount={topicsCount} />
      </HeroSlideshow>
      <MobileAbout />
    </>
  )
}
