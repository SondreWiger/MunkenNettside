"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SecureVideoPlayerProps {
  recordingId: string
  accessToken: string
  title: string
  team: string
  description?: string
}

export function SecureVideoPlayer({ recordingId, accessToken, title, team, description }: SecureVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(100)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLIFrameElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchSecureUrl()

    // Prevent right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  async function fetchSecureUrl() {
    try {
      const res = await fetch(`/api/video/stream?recordingId=${recordingId}&token=${accessToken}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke laste video")
      }

      setVideoUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "En feil oppstod")
    } finally {
      setLoading(false)
    }
  }

  function toggleFullscreen() {
    if (!containerRef.current) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  function handleMouseMove() {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Laster video...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <p className="text-red-500 mb-4">{error}</p>
          <Button asChild variant="outline">
            <Link href="/mine-opptak">Tilbake til mine opptak</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black select-none" onMouseMove={handleMouseMove}>
      {/* Header */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Link href="/mine-opptak">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <div>
            <h1 className="text-white text-xl font-bold">{title}</h1>
            <p className="text-white/70 text-sm">
              {team === "yellow" ? "Gult lag" : "Blått lag"}
              {description && ` • ${description}`}
            </p>
          </div>
        </div>
      </div>

      {/* Video iframe with security measures */}
      {videoUrl && (
        <iframe
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{
            pointerEvents: "auto",
            userSelect: "none",
          }}
        />
      )}

      {/* Overlay to prevent easy downloading */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "transparent",
        }}
      />

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-20 right-4 text-white/20 text-sm pointer-events-none select-none">
        Lisensiert visning
      </div>
    </div>
  )
}
