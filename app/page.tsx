import Image from 'next/image'
import { Header } from './components/Header'
import { RsvpForm } from './components/RsvpForm'
import { Countdown } from './components/Countdown'
import { InfoCard } from './components/InfoCard'

const timelineItems = [
  { title: 'Vigsel', description: '16:00', objectLabel: 'object 1', image: '/images/church_timeline.png' },
  { title: 'Hills', description: '17:30', objectLabel: 'object 2', image: '/images/mingel.png' },
  { title: 'Middag', description: '19:00', objectLabel: 'object 3', image: '/images/middag.png' },
  { title: 'Party', description: '22:00', objectLabel: 'object 4', image: '/images/party.png' },
  { title: 'Natta käk', description: '00:00', objectLabel: 'object 5', image: '/images/sausage.jpg' },
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
            <h2 className="font-script text-3xl sm:text-4xl text-black mb-4">
              Vår historia
            </h2>
            <p className="text-black text-sm mb-12">
            Vår historia började genom gemensamma vänner som, med en liten knuff i rätt riktning, matchade ihop oss. Det som först var en nyfiken introduktion växte snabbt till något mer. Vi började tillbringa allt mer tid tillsammans och sommaren gled sakta över i höst. Någonstans bland sena kvällar, långa samtal och många skratt växte en självklarhet fram. Det var en känsla av att det här var början på något alldeles speciellt. I slutet av 2019, på en sushi-dejt, bestämde vi oss för att det skulle vara vi.
            <br /> <br /> 
            År 2021 tog livet oss åt olika håll, men bara geografiskt. Jimmy började plugga i Luleå medans Engla gjorde sin militärtjänst i Halmstad. Plötsligt var vi särbos, med ungefär 120 mil mellan oss. Det blev ett år fyllt av längtan och flygresor.<br /> <br /> 
            År 2022 flyttade Engla upp till Luleå för att börja plugga, och äntligen fick vi bli sambos på riktigt. Tillsammans skapade vi vårt hem och vår vardag. År 2023 utökades familjen när vår älskade hund Maestro kom in i våra liv och fyllde det med ännu mer kärlek och bus.<br /> <br /> 
            Under 2025 tog vi examen, packade ihop vårt liv och flyttade ner till Göteborg igen. Det var dags att börja nästa kapitel med jobb och nya drömmar. På vår 6-årsdag, den 1 november 2025, förlovade vi oss vilket också var ett självklart steg i vår resa tillsammans. <br /> <br /> 
            Från en matchning genom vänner till ett liv tillsammans är vi så tacksamma för allt vi fått uppleva och för allt som väntar. Under 2026 tar vi nästa steg och säger ja till varandra. Vi ser fram emot att fira starten på det nya kapitlet tillsammans med dig!
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
                <div key={item.year} className="flex flex-col items-center w-48">
                  <span className="font-script text-2xl text-black mb-2">{item.year}</span>
                  <img src={item.image} alt={item.year} className="w-full h-auto rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Welcome/Date section */}
        <section>
          <div className="max-w-md mx-auto">
            <img src="/images/date.png" alt="Engla & Jimmy - 22 Augusti 2026" className="w-full h-auto" />
          </div>
        </section>

        {/* Info boxes section */}
        <section id="info" className="w-full bg-white py-16">
          {/* Box 1 - Före Bröllopet */}
          <InfoCard
            title="Före Bröllopet"

            bgColor="var(--gul)"
            borderColor="var(--gul-dark)"
            align="left"
          >
            <div>
              <p className="font-semibold mb-1">Klädkod</p>
              <p>Sommarfin</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Presenter</p>
              <p>Din närvaro är den finaste presenten vi kan få.</p> 
              
                <p className="mt-1">För dig som ändå önskar uppmärksamma oss lite extra och vill ha lite inspiration kring vad vi önskar oss, är du varmt välkommen att kontakta våra toastmadamer. De hjälper gärna till med tips och idéer!</p>
                
            </div>
            <div>
              <p className="font-semibold mb-1">Kontakt med våra Toastmadamer</p>
              <p>Vill du hålla tal, göra ett spex eller bidra med något annat under middagen? Anmäl detta senast 10:e augusti.</p>
              <p className="mt-1">Hit kan du även vända dig om du har en fråga om bröllopet.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Kontakt</p>
              <div className="space-y-2">
                <p>
                  <span className="underline">Elise Harrysson</span>
                  <br />
                  0706709440
                  <br />
                  eliseharryson@gmail.com
                </p>
                <p>
                  <span className="underline">Axélia Hamrén</span>
                  <br />
                  0706-825919
                  <br />
                  axeliahamren@icloud.com
                </p>
              </div>
            </div>
          </InfoCard>

          {/* Box 2 - Under Bröllopet */}
          <InfoCard
            title="Bröllopsdagen"

            bgColor="var(--pastel-green)"
            borderColor="var(--pastel-green-dark)"
            align="right"
          >
            <div>
              <p className="font-semibold mb-1">Vigsel</p>
              <p>16:00 i Onsala kyrka</p>
              <p className="mt-1">
                Adress:{' '}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Pr%C3%A4stg%C3%A5rdsv%C3%A4gen+16%2C+439+31+Onsala"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Prästgårdsvägen 16, 439 31 Onsala
                </a>
                .
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Transport</p>
              <p>Efter vigseln tar vi oss vidare mot festlokalen. Transport sker med eget fordon, behöver du hjälp med transport ange det i OSA formuläret.</p>
              
            </div>
            <div>
              <p className="font-semibold mb-1">Hills Golf and Sports Club</p>
              <p>Bröllopsfesten hålls på Hills Golf and Sports Club, där vi ser fram emot middag, tal, skratt och dans fram till 01:00.</p>
              <p className="mt-1">
                Adress:{' '}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Hills+v%C3%A4g+2%2C+431+51+M%C3%B6lndal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Hills väg 2, 431 51 Mölndal
                </a>
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Middag</p>
              <p>Middagen består av förrätt, varmrätt och efterrätt. Vi bjuder på dryck under minglet och middagen. Baren öppnar vid 22 med after work priser.</p>
            </div>
          </InfoCard>

          {/* Box 3 - Efter Bröllopet */}
          <InfoCard
            title="Efter Bröllopet"

            bgColor="var(--pastel-pink)"
            borderColor="var(--pastel-pink-dark)"
            align="left"
          >
            <p>Efter bröllopet kommer vi att samla och dela bilder från dagen. Mer information om hur ni får tillgång till dessa kommer efter bröllopet.</p>
            <p>Har ni själva tagit bilder eller filmer under dagen blir vi jätteglada om ni vill dela dem med oss.</p>
          </InfoCard>
        </section>

        {/* Timeline section - Vertical on mobile, Horizontal on desktop */}
        <section className="w-full bg-white">
          
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
                      <h3 className="font-script text-xl text-black mb-1">{item.title}</h3>
                      <p className="text-black text-sm">{item.description}</p>
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
                      <h3 className="font-script text-xl text-black mb-1">{item.title}</h3>
                      <p className="text-black text-sm">{item.description}</p>
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
                      <h3 className="font-script text-xl text-black mb-1">{item.title}</h3>
                      <p className="text-black text-sm">{item.description}</p>
                    </div>
                  </div>
                ) : (
                  <div key={i}>
                    {/* Text above */}
                    <div className="absolute -translate-x-1/2 bottom-full mb-4 text-center" style={{ left: `${pos}%` }}>
                      <h3 className="font-script text-xl text-black mb-1">{item.title}</h3>
                      <p className="text-black text-sm">{item.description}</p>
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
            <h2 className="font-script text-3xl sm:text-4xl text-black text-center mb-2">
              OSA
            </h2>
            <p className="text-black text-center text-sm mb-10">
              Tack alla som har svarat!
            </p>
            <RsvpForm />
          </div>
        </section>

        {/* Countdown section */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-script text-3xl sm:text-4xl text-black mb-8">
              Tid kvar till bröllopet
            </h2>
            <Countdown />
          </div>
        </section>
      </main>
    </>
  )
}
