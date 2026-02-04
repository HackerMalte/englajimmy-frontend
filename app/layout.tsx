import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'We\'re Getting Married',
  description: 'Join us for our wedding celebration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-serif">{children}</body>
    </html>
  )
}
