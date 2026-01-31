import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AMBER Alert Simulation',
  description: 'Event-driven multi-agent AI system for AMBER Alert response',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
