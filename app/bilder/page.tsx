import Link from 'next/link'
import { Header } from '../components/Header'
import { PhotoUploader } from '../components/PhotoUploader'

export const metadata = {
  title: 'Dela bilder · Engla & Jimmy',
  description: 'Ladda upp dina bilder och filmer från bröllopet.',
}

export default function PhotosPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20 sm:pt-24 pb-16">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <h1 className="font-script text-3xl sm:text-4xl text-black text-center mb-3">
            Dela dina bilder
          </h1>
          <p className="text-black text-center text-sm mb-2">
            Tog du bilder eller filmer under bröllopet? Vi vill så gärna se dem!
          </p>
          <p className="text-gray-600 text-center text-xs mb-10">
            Det du laddar upp visas i galleriet här på sidan.
          </p>
          <div className="text-center mb-10">
            <Link
              href="/galleri"
              className="inline-block px-6 py-2.5 text-sm font-medium text-black rounded hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--gul)' }}
            >
              Visa galleriet
            </Link>
          </div>

          <PhotoUploader />
        </div>
      </main>
    </>
  )
}
