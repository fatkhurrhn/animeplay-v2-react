import React, { useEffect, useState } from 'react'
import MobilePage from './MobilePage'
import PageDesktop from './PageDesktop'

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768) // batas mobile 768px
    }

    checkScreen() // cek pertama kali
    window.addEventListener('resize', checkScreen)

    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  return (
    <>
      {isMobile ? <MobilePage /> : <PageDesktop />}
    </>
  )
}