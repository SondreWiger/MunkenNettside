"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeDisplayProps {
  data: string
  size?: number
}

export function QRCodeDisplay({ data, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
    }
  }, [data, size])

  return (
    <div className="bg-white p-4 rounded-lg inline-block">
      <canvas ref={canvasRef} />
    </div>
  )
}
