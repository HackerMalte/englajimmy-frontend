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
          <p className="text-black text-center text-sm mb-10">
            Tog du bilder eller filmer? Ladda upp dem här — de hamnar i galleriet.
          </p>

          <PhotoUploader />
        </div>
      </main>
    </>
  )
}
