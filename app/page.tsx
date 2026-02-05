import Image from 'next/image'
import { Header } from './components/Header'
import { RsvpForm } from './components/RsvpForm'
import { Countdown } from './components/Countdown'

export default function Home() {
  return (
    <>
      <main className="bg-pastel-pink">
        {/* Hero section with image */}
        <section id="hem" className="relative">
          {/* Logo overlay in top left */}
          <img
            src="/images/ej_logo.svg"
            alt="E&J Logo"
            className="absolute top-4 left-4 w-24 sm:w-32 h-auto z-10"
          />
          <Image
            src="/images/ej_main_img.png"
            alt="Engla and Jimmy"
            width={1200}
            height={800}
            className="w-full h-auto"
            priority
          />
        </section>

        <Header />

        {/* Timeline section */}
        <section id="datum" className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-script text-3xl sm:text-4xl text-gray-800 mb-4">
              Our story
            </h2>
            <p className="text-gray-600 text-sm mb-12">
              Här är några viktiga år i vår gemensamma resa.
            </p>
            
            {/* Timeline circles - Row 1 (4 circles) */}
            <div className="flex justify-center gap-6 sm:gap-10 mb-8">
              {['2018', '2019', '2020', '2021'].map((year) => (
                <div key={year} className="flex flex-col items-center">
                  <span className="text-sm text-gray-700 mb-2">{year}</span>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-pastel-green border-2 border-black"></div>
                </div>
              ))}
            </div>
            
            {/* Timeline circles - Row 2 (3 circles) */}
            <div className="flex justify-center gap-6 sm:gap-10">
              {['2022', '2023', '2024'].map((year) => (
                <div key={year} className="flex flex-col items-center">
                  <span className="text-sm text-gray-700 mb-2">{year}</span>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-pastel-green border-2 border-black"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info boxes section */}
        <section className="w-full bg-white py-16">
          {/* Box 1 - top left */}
          <div className="flex justify-start mb-6">
            <div className="w-[85%] sm:w-[45%] p-6 border-2 border-l-0" style={{ backgroundColor: 'var(--gul)', borderColor: 'var(--gul-dark)', borderRadius: '0 var(--box-radius) var(--box-radius) 0', minHeight: 'var(--box-min-height)' }}>
              <h3 className="font-script text-xl text-gray-800 mb-2">Före Bröllopet</h3>
              <p className="text-gray-600 text-sm">- Klädkod</p>
              <p className="text-gray-600 text-sm">- Paket</p>
              <p className="text-gray-600 text-sm">- Fråga till Toastmaster</p>
            </div>
          </div>
          {/* Box 2 - right, below box 1 */}
          <div className="flex justify-end mb-6">
            <div className="w-[85%] sm:w-[45%] p-6 border-2 border-r-0" style={{ backgroundColor: 'var(--pastel-green)', borderColor: 'var(--pastel-green-dark)', borderRadius: 'var(--box-radius) 0 0 var(--box-radius)', minHeight: 'var(--box-min-height)' }}>
              <h3 className="font-script text-xl text-gray-800 mb-2">Under Bröllopet</h3>
              <p className="text-gray-600 text-sm">- Onsala Kyrka</p>
              <p className="text-gray-600 text-sm">- Transport</p>
              <p className="text-gray-600 text-sm">- Hills</p>

            </div>
          </div>
          {/* Box 3 - left, below box 1 and box 2 */}
          <div className="flex justify-start">
            <div className="w-[85%] sm:w-[45%] p-6 border-2 border-l-0" style={{ backgroundColor: 'var(--pastel-pink)', borderColor: 'var(--pastel-pink-dark)', borderRadius: '0 var(--box-radius) var(--box-radius) 0', minHeight: 'var(--box-min-height)' }}>
              <h3 className="font-script text-xl text-gray-800 mb-2">Efter Bröllopet</h3>
              <p className="text-gray-600 text-sm">Content goes here</p>
            </div>
          </div>
        </section>

        {/* Timeline section - Vertical on mobile, Horizontal on desktop */}
        <section className="w-full bg-white pt-16">
          
          {/* Mobile: Vertical timeline */}
          <div className="sm:hidden px-4">
            <div className="relative">
              {/* Vertical line in center */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black -translate-x-1/2"></div>
              
              {/* Object 1 - Circle on right, text on left */}
              <div className="relative flex items-center mb-12">
                <div className="w-1/2 pr-8 text-right">
                  <h3 className="font-script text-xl text-gray-800 mb-1">Title 1</h3>
                  <p className="text-gray-600 text-sm">Description text here</p>
                </div>
                <div className="absolute left-1/2 flex items-center">
                  <div className="w-8 h-0.5 bg-black"></div>
                  <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2 z-10">
                    object 1
                  </div>
                </div>
                <div className="w-1/2"></div>
              </div>
              
              {/* Object 2 - Circle on left, text on right */}
              <div className="relative flex items-center mb-12">
                <div className="w-1/2"></div>
                <div className="absolute right-1/2 flex items-center flex-row-reverse">
                  <div className="w-8 h-0.5 bg-black"></div>
                  <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2 z-10">
                    object 2
                  </div>
                </div>
                <div className="w-1/2 pl-8 text-left">
                  <h3 className="font-script text-xl text-gray-800 mb-1">Title 2</h3>
                  <p className="text-gray-600 text-sm">Description text here</p>
                </div>
              </div>
              
              {/* Object 3 - Circle on right, text on left */}
              <div className="relative flex items-center mb-12">
                <div className="w-1/2 pr-8 text-right">
                  <h3 className="font-script text-xl text-gray-800 mb-1">Title 3</h3>
                  <p className="text-gray-600 text-sm">Description text here</p>
                </div>
                <div className="absolute left-1/2 flex items-center">
                  <div className="w-8 h-0.5 bg-black"></div>
                  <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2 z-10">
                    object 3
                  </div>
                </div>
                <div className="w-1/2"></div>
              </div>
              
              {/* Object 4 - Circle on left, text on right */}
              <div className="relative flex items-center">
                <div className="w-1/2"></div>
                <div className="absolute right-1/2 flex items-center flex-row-reverse">
                  <div className="w-8 h-0.5 bg-black"></div>
                  <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2 z-10">
                    object 4
                  </div>
                </div>
                <div className="w-1/2 pl-8 text-left">
                  <h3 className="font-script text-xl text-gray-800 mb-1">Title 4</h3>
                  <p className="text-gray-600 text-sm">Description text here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Horizontal timeline */}
          <div className="hidden sm:flex justify-center pt-32 pb-32">
            <div className="w-[80%] relative">
              {/* Object 1 - circle above, text below */}
              <div className="absolute left-[10%] -translate-x-1/2 bottom-full mb-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2">
                  time_line object 1
                </div>
              </div>
              <div className="absolute left-[10%] bottom-full w-0.5 h-8 bg-black -translate-x-1/2"></div>
              <div className="absolute left-[10%] top-full mt-4 -translate-x-1/2 text-center">
                <h3 className="font-script text-xl text-gray-800 mb-1">Title 1</h3>
                <p className="text-gray-600 text-sm">Description text here</p>
              </div>

              {/* Object 2 - text above, circle below */}
              <div className="absolute left-[40%] -translate-x-1/2 bottom-full mb-4 text-center">
                <h3 className="font-script text-xl text-gray-800 mb-1">Title 2</h3>
                <p className="text-gray-600 text-sm">Description text here</p>
              </div>
              <div className="absolute left-[40%] top-0 w-0.5 h-8 bg-black -translate-x-1/2"></div>
              <div className="absolute left-[40%] -translate-x-1/2 top-full mt-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2">
                  time_line object 2
                </div>
              </div>

              {/* Object 3 - circle above, text below */}
              <div className="absolute left-[60%] -translate-x-1/2 bottom-full mb-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2">
                  time_line object 3
                </div>
              </div>
              <div className="absolute left-[60%] bottom-full w-0.5 h-8 bg-black -translate-x-1/2"></div>
              <div className="absolute left-[60%] top-full mt-4 -translate-x-1/2 text-center">
                <h3 className="font-script text-xl text-gray-800 mb-1">Title 3</h3>
                <p className="text-gray-600 text-sm">Description text here</p>
              </div>

              {/* Object 4 - text above, circle below */}
              <div className="absolute left-[90%] -translate-x-1/2 bottom-full mb-4 text-center w-48">
                <h3 className="font-script text-xl text-gray-800 mb-1">Title 4</h3>
                <p className="text-gray-600 text-sm">Description text here</p>
              </div>
              <div className="absolute left-[90%] top-0 w-0.5 h-8 bg-black -translate-x-1/2"></div>
              <div className="absolute left-[90%] -translate-x-1/2 top-full mt-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2">
                  time_line object 4
                </div>
              </div>

              {/* Horizontal line */}
              <hr className="w-full border-t-2 border-black" />
            </div>
          </div>

          {/* Flowers image at bottom */}
          <div className="w-full">
            <img
              src="/images/flowers.png"
              alt="Decorative flowers"
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* OSA / RSVP section */}
        <section id="osa" className="py-16 px-4" style={{ backgroundColor: 'var(--gul)' }}>
          <div className="max-w-md mx-auto">
            <h2 className="font-script text-3xl sm:text-4xl text-gray-800 text-center mb-2">
              OSA
            </h2>
            <p className="text-gray-600 text-center text-sm mb-10">
              Vi hoppas att ni vill fira med oss. Svara senast 1 juni.
            </p>
            <RsvpForm />
          </div>
        </section>

        {/* Countdown section */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-script text-3xl sm:text-4xl text-gray-800 mb-8">
              Countdown
            </h2>
            <Countdown />
          </div>
        </section>
      </main>
    </>
  )
}
