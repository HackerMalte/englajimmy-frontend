import { Header } from '../components/Header'
import { RsvpForm } from '../components/RsvpForm'

export default function RsvpPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20 sm:pt-24 pb-16">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-2xl sm:text-3xl text-gray-800 text-center mb-2">
            OSA
          </h1>
          <p className="text-gray-600 text-center text-sm mb-10">
            Vi hoppas att ni vill fira med oss. Svara senast 1 juni.
          </p>
          <RsvpForm />
        </div>
      </main>
    </>
  )
}
