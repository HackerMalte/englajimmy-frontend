import Image from 'next/image'
import { Header } from './components/Header'

export default function Home() {
  return (
    <>
      <Header />
      <main id="hem" className="min-h-screen bg-black flex flex-col items-center justify-center p-6 pt-20 sm:pt-24">
        <Image
        src="/images/date_and_name.png"
        alt="Engla and Jimmy"
        width={600}
        height={400}
        className="w-full max-w-lg h-auto"
        priority
      />
      </main>
    </>
  )
}
