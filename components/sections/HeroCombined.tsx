import SplashIntro from '../hero/SplashIntro'
import HeroSection from '../hero/HeroSection'

export default function HeroCombined({ data }: { data: any }) {
  return (
    <>
      <SplashIntro data={data} />
      <HeroSection data={data} />
    </>
  )
}
