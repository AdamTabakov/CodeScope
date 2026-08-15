import { useEffect, useState } from 'react'

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: -200, y: -200 })

  useEffect(() => {
    const onPointerMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  return <div className="cursor-glow" style={{ '--x': `${position.x}px`, '--y': `${position.y}px` }} aria-hidden="true" />
}
