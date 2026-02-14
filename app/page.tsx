import Image from 'next/image'
import { Header } from './components/Header'
import { RsvpForm } from './components/RsvpForm'
import { Countdown } from './components/Countdown'
import { InfoCard } from './components/InfoCard'

const timelineItems = [
  { title: 'Vigsel', description: '16:00', objectLabel: 'object 1', image: '/images/church_timeline.png' },
  { title: 'Hills', description: '17:30', objectLabel: 'object 2', image: '/images/mingel.png' },
  { title: 'Middag', description: '18:30', objectLabel: 'object 3', image: '/images/middag.png' },
  { title: 'Party', description: '22:00', objectLabel: 'object 4', image: '/images/party.png' },
]

export default function Home() {
  const desktopPositions = timelineItems.map((_, i) => {
    const step = 86 / (timelineItems.length - 1)
    return Math.round(7 + i * step)
  })

  return (
    <>
      <main className="bg-white">
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
              Vår historia
            </h2>
            <p className="text-gray-600 text-sm mb-12">
              Här är några viktiga år i vår gemensamma resa.
            </p>
            
            {/* Timeline circles - responsive wrap */}
            <div className="flex flex-wrap justify-center gap-8">
              {[
                { year: '2019', image: '/images/2019.JPEG' },
                { year: '2020', image: '/images/2020.jpeg' },
                { year: '2021', image: '/images/2021.JPEG' },
                { year: '2022', image: '/images/2022.JPEG' },
                { year: '2023', image: '/images/2023.jpeg' },
                { year: '2024', image: '/images/2024.jpeg' },
                { year: '2025', image: '/images/2025.JPEG' },
              ].map((item) => (
                <div key={item.year} className="flex flex-col items-center">
                  <span className="text-sm text-gray-700 mb-2">{item.year}</span>
                  <div className="w-48 h-48 rounded-full border-2 border-black overflow-hidden">
                    <img src={item.image} alt={item.year} className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info boxes section */}
        <section className="w-full bg-white py-16">
          {/* Box 1 - Före Bröllopet */}
          <InfoCard
            title="Före Bröllopet"

            bgColor="var(--gul)"
            borderColor="var(--gul-dark)"
            align="left"
          >
            <div>
              <p className="font-semibold mb-1">Klädkod</p>
              <p>Sommarfint. Välj gärna något ni känner er fina och bekväma i — det viktigaste för oss är att ni trivs och är redo för en dag fylld av kärlek och fest.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Paket</p>
              <p>Er närvaro är den finaste presenten vi kan få ❤️. För er som ändå önskar uppmärksamma oss lite extra och vill ha lite inspiration kring vad brudparet önskar sig, är ni varmt välkomna att kontakta vår toastmadam.</p>
              <p className="mt-1">Hon hjälper gärna till med tips och idéer.</p>
              <p className="mt-1">📩 Kontakt: [toastmadams namn och kontaktuppgifter]</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Fråga till Toastmadame</p>
              <p>Vill du hålla tal, göra ett spex eller bidra med något annat under middagen? Anmäl detta i god tid till vår toastmaster Axelia/Elise, så att allt kan planeras på bästa sätt.</p>
              <p className="mt-1">Här kan du även vända dig med frågor, idéer eller önskemål kring möhippa/svensexa eller andra överraskningar inför bröllopet.</p>
              <p className="mt-1">📩 Kontakt: [telefonnummer/e-post]</p>
            </div>
          </InfoCard>

          {/* Box 2 - Under Bröllopet */}
          <InfoCard
            title="Under Bröllopet"

            bgColor="var(--pastel-green)"
            borderColor="var(--pastel-green-dark)"
            align="right"
          >
            <div>
              <p className="font-semibold mb-1">Transport</p>
              <p>Efter vigseln tar vi oss vidare mot festlokalen. Transport sker via [t.ex. gemensam buss / egen bil / ?].</p>
              <p className="mt-1">Mer detaljer kring transporten kommer närmare bröllopsdagen.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Hills Golfklubb</p>
              <p>Bröllopsfesten hålls på Hills Golfklubb, där vi ser fram emot middag, tal, skratt och dans fram till 01:00.</p>
              <p className="mt-1">📍 Adress: Hills Golfklubb, 437 40 Mölndal</p>
              <p className="mt-1">🍽 Middag och fest följer efter ankomst</p>
            </div>
          </InfoCard>

          {/* Box 3 - Efter Bröllopet */}
          <InfoCard
            title="Efter Bröllopet"

            bgColor="var(--pastel-pink)"
            borderColor="var(--pastel-pink-dark)"
            align="left"
          >
            <p>Efter bröllopet kommer vi att samla och dela bilder från dagen. Mer information om hur ni får tillgång till dessa (t.ex. via länk eller digitalt galleri) kommer efter bröllopet.</p>
            <p>Har ni själva tagit bilder eller filmer under dagen blir vi jätteglada om ni vill dela dem med oss 💕</p>
          </InfoCard>
        </section>

        {/* Timeline section - Vertical on mobile, Horizontal on desktop */}
        <section className="w-full bg-white pt-16">
          
          {/* Mobile: Vertical timeline */}
          <div className="min-[900px]:hidden px-4">
            <div className="relative">
              {/* Vertical line in center */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black -translate-x-1/2"></div>
              
              {timelineItems.map((item, i) => {
                const isOdd = i % 2 === 0 // 0-indexed: items 0,2,4,6 → circle right, text left
                const isLast = i === timelineItems.length - 1
                return isOdd ? (
                  <div key={i} className={`relative flex items-center ${isLast ? '' : 'mb-20'}`}>
                    <div className="w-1/2 pr-8 text-right">
                      <h3 className="font-script text-xl text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                    <div className="absolute left-1/2 flex items-center">
                      <div className="w-8 h-0.5 bg-black"></div>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-24 h-24 object-contain z-10" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2 z-10">
                          {item.objectLabel}
                        </div>
                      )}
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                ) : (
                  <div key={i} className={`relative flex items-center ${isLast ? '' : 'mb-20'}`}>
                    <div className="w-1/2"></div>
                    <div className="absolute right-1/2 flex items-center flex-row-reverse">
                      <div className="w-8 h-0.5 bg-black"></div>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-24 h-24 object-contain z-10" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2 z-10">
                          {item.objectLabel}
                        </div>
                      )}
                    </div>
                    <div className="w-1/2 pl-8 text-left">
                      <h3 className="font-script text-xl text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Desktop: Horizontal timeline */}
          <div className="hidden min-[900px]:flex justify-center pt-32 pb-32">
            <div className="w-[90%] relative">
              {timelineItems.map((item, i) => {
                const pos = desktopPositions[i]
                const isOdd = i % 2 === 0 // 0-indexed: items 0,2,4,6 → circle above, text below
                return isOdd ? (
                  <div key={i}>
                    {/* Circle/Image above */}
                    <div className={`absolute -translate-x-1/2 bottom-full mb-4 flex flex-col items-center`} style={{ left: `${pos}%` }}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-28 h-28 object-contain" />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2">
                          {item.objectLabel}
                        </div>
                      )}
                    </div>
                    {/* Vertical line above */}
                    <div className="absolute bottom-full w-0.5 h-8 bg-black -translate-x-1/2" style={{ left: `${pos}%` }}></div>
                    {/* Text below */}
                    <div className="absolute top-full mt-4 -translate-x-1/2 text-center" style={{ left: `${pos}%` }}>
                      <h3 className="font-script text-xl text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ) : (
                  <div key={i}>
                    {/* Text above */}
                    <div className="absolute -translate-x-1/2 bottom-full mb-4 text-center" style={{ left: `${pos}%` }}>
                      <h3 className="font-script text-xl text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                    {/* Vertical line below */}
                    <div className="absolute top-0 w-0.5 h-8 bg-black -translate-x-1/2" style={{ left: `${pos}%` }}></div>
                    {/* Circle/Image below */}
                    <div className="absolute -translate-x-1/2 top-full mt-4 flex flex-col items-center" style={{ left: `${pos}%` }}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-28 h-28 object-contain" />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-black flex items-center justify-center text-white text-xs text-center p-2">
                          {item.objectLabel}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

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
              Tid kvar till bröllopet
            </h2>
            <Countdown />
          </div>
        </section>
      </main>
    </>
  )
}
