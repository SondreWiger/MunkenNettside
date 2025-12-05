"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Users, Calendar, MapPin, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { formatDate, formatTime, formatPrice } from "@/lib/utils/booking"
import type { Show, Seat } from "@/lib/types"

interface SeatSelectorProps {
  show: Show
  seats: Seat[]
}

export function SeatSelector({ show, seats: initialSeats }: SeatSelectorProps) {
  const [seats, setSeats] = useState(initialSeats)
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const showTitle = show.title || show.ensemble?.title || "Forestilling"
  const teamName =
    show.team && show.ensemble
      ? show.team === "yellow"
        ? show.ensemble.yellow_team_name
        : show.ensemble.blue_team_name
      : null

  // Subscribe to seat changes
  useEffect(() => {
    const channel = supabase
      .channel(`seats-${show.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seats",
          filter: `show_id=eq.${show.id}`,
        },
  (payload: any) => {
          if (payload.eventType === "UPDATE") {
            setSeats((prev) => prev.map((seat) => (seat.id === payload.new.id ? { ...seat, ...payload.new } : seat)))
            // Remove from selection if seat was taken
            if (payload.new.status !== "available") {
              setSelectedSeats((prev) => prev.filter((s) => s.id !== payload.new.id))
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [show.id, supabase])

  useEffect(() => {
    const refreshSeats = async () => {
      const { data: freshSeats } = await supabase.from("seats").select("*").eq("show_id", show.id)

      if (freshSeats) {
        setSeats(freshSeats)
      }
    }
    refreshSeats()
  }, [show.id, supabase])

  const toggleSeat = useCallback((seat: Seat) => {
    const st = (seat.status || "").toString().toLowerCase()
    if (st !== "available") return

    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => s.id === seat.id)
      if (isSelected) {
        return prev.filter((s) => s.id !== seat.id)
      }
      return [...prev, seat]
    })
  }, [])

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price_nok, 0)

  // Group seats by section and row
  const seatsBySection = seats.reduce(
    (acc, seat) => {
      if (!acc[seat.section]) {
        acc[seat.section] = {}
      }
      if (!acc[seat.section][seat.row]) {
        acc[seat.section][seat.row] = []
      }
      acc[seat.section][seat.row].push(seat)
      return acc
    },
    {} as Record<string, Record<string, Seat[]>>,
  )

  // Sort seats within each row
  Object.values(seatsBySection).forEach((rows) => {
    Object.values(rows).forEach((rowSeats) => {
      rowSeats.sort((a, b) => a.number - b.number)
    })
  })

  const handleProceed = async () => {
    if (selectedSeats.length === 0) {
      setError("Vennligst velg minst ett sete")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const seatIds = selectedSeats.map((s) => s.id)

      // Call API to reserve seats (uses admin client to bypass RLS)
      const response = await fetch("/api/seats/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatIds, showId: show.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Refresh seats to show current status
        const { data: freshSeats } = await supabase.from("seats").select("*").eq("show_id", show.id)
        if (freshSeats) {
          setSeats(freshSeats)
        }

        // Clear unavailable seats from selection
        if (result.unavailableSeatIds) {
          setSelectedSeats((prev) => prev.filter((s) => !result.unavailableSeatIds.includes(s.id)))
        } else {
          setSelectedSeats([])
        }

        throw new Error(result.error || "Kunne ikke reservere setene")
      }

      // Store selection in session storage and redirect to checkout
      sessionStorage.setItem(
        "booking",
        JSON.stringify({
          showId: show.id,
          seatIds,
          totalPrice,
          reservedUntil: result.reservedUntil,
        }),
      )

      router.push(`/kasse/billett?show=${show.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt")
      setIsLoading(false)
    }
  }

  const getSeatColor = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id)
    const st = (seat.status || "").toString().toLowerCase()

    if (isSelected) return "bg-primary text-primary-foreground"
    if (st === "sold") return "bg-muted text-muted-foreground cursor-not-allowed"
    if (st === "reserved") return "bg-yellow-500/20 text-yellow-700 cursor-not-allowed"
    if (st === "blocked") return "bg-muted text-muted-foreground cursor-not-allowed"
    return "bg-green-500/20 text-green-700 hover:bg-green-500/40 cursor-pointer"
  }

  return (
    <div className="container px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Velg seter</CardTitle>
              <p className="text-muted-foreground">Klikk på ledige seter for å velge dem</p>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-500/20 border border-green-500/50" />
                  <span className="text-sm">Ledig</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary" />
                  <span className="text-sm">Valgt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-muted border" />
                  <span className="text-sm">Opptatt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-yellow-500/20 border border-yellow-500/50" />
                  <span className="text-sm">Reservert</span>
                </div>
              </div>

              {/* Stage indicator */}
              <div className="mb-8 text-center">
                <div className="inline-block px-16 py-3 bg-muted rounded-t-full text-muted-foreground font-medium">
                  SCENE
                </div>
              </div>

              {/* Seat Grid */}
              <div className="space-y-8">
                {Object.entries(seatsBySection).map(([sectionName, rows]) => (
                  <div key={sectionName}>
                    <h3 className="text-lg font-semibold mb-4">{sectionName}</h3>
                    <div className="space-y-2">
                      {Object.entries(rows)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([rowName, rowSeats]) => (
                          <div key={rowName} className="flex items-center gap-2">
                            <span className="w-8 text-sm font-medium text-muted-foreground">{rowName}</span>
                            <div className="flex gap-1 flex-wrap">
                              {rowSeats.map((seat) => (
                                <button
                                  key={seat.id}
                                  onClick={() => toggleSeat(seat)}
                                    disabled={(seat.status || "").toString().toLowerCase() !== "available"}
                                  className={`w-10 h-10 rounded text-sm font-medium transition-colors ${getSeatColor(seat)}`}
                                  aria-label={`Rad ${seat.row}, Sete ${seat.number}, ${
                                    (seat.status || "").toString().toLowerCase() === "available" ? "Ledig" : "Opptatt"
                                  }, ${formatPrice(seat.price_nok)}`}
                                >
                                  {seat.number}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Show Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">{showTitle}</h2>
              {teamName && (
                <Badge variant="secondary" className="mb-3">
                  {teamName}
                </Badge>
              )}
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(show.show_datetime)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  kl. {formatTime(show.show_datetime)}
                </p>
                {show.venue && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {show.venue.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Seats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Valgte seter ({selectedSeats.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSeats.length > 0 ? (
                <div className="space-y-2">
                  {selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>
                        {seat.section}, Rad {seat.row}, Sete {seat.number}
                      </span>
                      <span className="font-medium">{formatPrice(seat.price_nok)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Totalt</span>
                      <span className="text-primary">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Ingen seter valgt ennå</p>
              )}
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleProceed}
            disabled={selectedSeats.length === 0 || isLoading}
            size="lg"
            className="w-full h-14 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Reserverer...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Gå til betaling
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Setene reserveres i 10 minutter mens du fullfører bestillingen
          </p>
        </div>
      </div>
    </div>
  )
}
