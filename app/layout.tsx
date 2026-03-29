import type { Metadata, Viewport } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const sourceSansPro = Source_Sans_3({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-source-sans'
})

export const metadata: Metadata = {
  title: 'StreamTV - Movies & Shows',
  description: 'Watch your favorite movies and TV shows',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${sourceSansPro.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
