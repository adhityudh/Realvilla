import SplashIntro from '../hero/SplashIntro'
import HeroSection from '../hero/HeroSection'

export default function HeroCombined({ data, dict }: { data: any, dict?: any }) {
  return (
    <>
      <SplashIntro data={data} dict={dict} />
      <HeroSection data={data} dict={dict} />
    </>
  )
}
