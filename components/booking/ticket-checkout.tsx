"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, CreditCard, User, Mail, Phone, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { formatPrice, formatDateTime } from "@/lib/utils/booking"
import type { Show, Seat } from "@/lib/types"

interface BookingData {
  showId: string
  seatIds: string[]
  totalPrice: number
  reservedUntil: string
}

export function TicketCheckout() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [show, setShow] = useState<Show | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [discountCode, setDiscountCode] = useState("")
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [appliedDiscount, setAppliedDiscount] = useState<{ type: string; value: number } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowserClient()

  // Load booking data from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("booking")
    if (!stored) {
      router.push("/forestillinger")
      return
    }

    const data = JSON.parse(stored) as BookingData
    setBookingData(data)

    // Calculate time left
    const expiresAt = new Date(data.reservedUntil).getTime()
    const now = Date.now()
    const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
    setTimeLeft(remaining)

    if (remaining === 0) {
      sessionStorage.removeItem("booking")
      router.push("/forestillinger?message=expired")
      return
    }

    // Fetch show and seats
    const fetchData = async () => {
      const { data: showData } = await supabase
        .from("shows")
        .select(`
          *,
          ensemble:ensembles(*),
          venue:venues(*)
        `)
        .eq("id", data.showId)
        .single()

      const { data: seatsData } = await supabase.from("seats").select("*").in("id", data.seatIds)

      setShow(showData)
      setSeats(seatsData || [])
      setIsLoading(false)
    }

    fetchData()

    // Pre-fill user data if logged in
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (profile) {
          setCustomerName(profile.full_name || "")
          setCustomerEmail(profile.email || user.email || "")
          setCustomerPhone(profile.phone || "")
        }
      }
    }
    getUser()
  }, [router, supabase])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          sessionStorage.removeItem("booking")
          router.push("/forestillinger?message=expired")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, router])

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const calculatePrice = () => {
    let price = bookingData?.totalPrice || 0

    // Apply discount code if available
    if (appliedDiscount) {
      if (appliedDiscount.type === "percentage") {
        price = price * (1 - appliedDiscount.value / 100)
      } else if (appliedDiscount.type === "fixed") {
        price = Math.max(0, price - appliedDiscount.value)
      }
    }

    return price
  }

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Skriv inn en rabattkode")
      return
    }

    setDiscountError(null)

    try {
      const { data: code, error: codeError } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", discountCode.toUpperCase())
        .single()

      if (codeError || !code) {
        setDiscountError("Ugyldig rabattkode")
        setAppliedDiscount(null)
        return
      }

      // Check if code is valid
      const now = new Date()
      if (code.valid_from && new Date(code.valid_from) > now) {
        setDiscountError("Rabattkoden er ikke gyldig ennå")
        setAppliedDiscount(null)
        return
      }

      if (code.valid_until && new Date(code.valid_until) < now) {
        setDiscountError("Rabattkoden har utløpt")
        setAppliedDiscount(null)
        return
      }

      // Check if code has reached max uses
      if (code.max_uses && code.current_uses >= code.max_uses) {
        setDiscountError("Rabattkoden er ikke lenger tilgjengelig")
        setAppliedDiscount(null)
        return
      }

      // Check if applicable to shows
      if (code.applicable_to !== "both" && code.applicable_to !== "shows") {
        setDiscountError("Denne rabattkoden kan ikke brukes på billetter")
        setAppliedDiscount(null)
        return
      }

      setAppliedDiscount({
        type: code.type,
        value: parseFloat(code.value),
      })
      setDiscountError(null)
    } catch (err) {
      setDiscountError("Kunne ikke validere rabattkode")
      setAppliedDiscount(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      setError("Du må godta vilkårene for å fortsette")
      return
    }

    if (!bookingData || !show) {
      setError("Bestillingsinformasjon mangler")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create booking via API (mock payment)
      const payload = {
        showId: bookingData.showId,
        seatIds: bookingData.seatIds,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests,
        totalAmount: calculatePrice(),
        discountCode: appliedDiscount ? discountCode.toUpperCase() : null,
      }

      console.log("[v0] Sending booking payload:", payload)

      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Kunne ikke fullføre bestillingen")
      }

      // Clear session storage
      sessionStorage.removeItem("booking")

      // Redirect to confirmation
      router.push(`/bekreftelse/${result.bookingId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt")
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Laster bestilling...</p>
      </div>
    )
  }

  if (!show || !bookingData) {
    return (
      <div className="container px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-4">Bestilling ikke funnet</h1>
        <Button asChild>
          <Link href="/forestillinger">Tilbake til forestillinger</Link>
        </Button>
      </div>
    )
  }

  const showTitle = show.title || show.ensemble?.title || "Forestilling"

  return (
    <div className="container px-4 py-8">
      {/* Timer Warning */}
      <Alert className={`mb-6 ${timeLeft < 120 ? "border-destructive" : ""}`}>
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Reservasjonen utløper om</span>
          <span className={`font-mono text-lg font-bold ${timeLeft < 120 ? "text-destructive" : ""}`}>
            {formatTimeLeft()}
          </span>
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Kontaktinformasjon</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Fullt navn *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="h-12 text-base"
                    placeholder="Ola Nordmann"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-post *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="h-12 text-base"
                    placeholder="din@epost.no"
                  />
                  <p className="text-sm text-muted-foreground">Billetten sendes til denne e-postadressen</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefon (valgfritt)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-12 text-base"
                    placeholder="+47 123 45 678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requests" className="text-base">
                    Spesielle behov eller ønsker
                  </Label>
                  <Textarea
                    id="requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="min-h-24 text-base"
                    placeholder="F.eks. rullestoltilgang, allergier, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-base">
                    Rabattkode (valgfritt)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      type="text"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value)
                        if (appliedDiscount) setAppliedDiscount(null)
                      }}
                      placeholder="Skriv inn rabattkode"
                      className="h-12 text-base"
                      disabled={!!appliedDiscount}
                    />
                    <Button
                      type="button"
                      variant={appliedDiscount ? "secondary" : "default"}
                      onClick={() => {
                        if (appliedDiscount) {
                          setAppliedDiscount(null)
                          setDiscountCode("")
                          setDiscountError(null)
                        } else {
                          applyDiscountCode()
                        }
                      }}
                      disabled={isProcessing}
                      className="h-12"
                    >
                      {appliedDiscount ? "Fjern rabatt" : "Bruk"}
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-sm text-destructive">{discountError}</p>
                  )}
                  {appliedDiscount && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-semibold text-green-900">
                        ✓ Rabattkode aktivert!
                      </p>
                      <p className="text-sm text-green-700">
                        {appliedDiscount.type === "percentage"
                          ? `${appliedDiscount.value}% rabatt`
                          : `${formatPrice(appliedDiscount.value)} rabatt`}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-base leading-relaxed cursor-pointer">
                    Jeg godtar{" "}
                    <Link href="/vilkar" className="text-primary hover:underline">
                      kjøpsvilkårene
                    </Link>{" "}
                    og forstår at billetter ikke refunderes etter kjøp.
                  </Label>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isProcessing || !acceptTerms} size="lg" className="w-full h-14 text-lg">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Behandler...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Betal {formatPrice(calculatePrice())}
                    </>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Midlertidig: Betaling simuleres for testing. Vipps-integrasjon kommer snart.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Bestillingsoversikt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{showTitle}</h3>
                <p className="text-muted-foreground">{formatDateTime(show.show_datetime)}</p>
                {show.venue && <p className="text-muted-foreground">{show.venue.name}</p>}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Seter ({seats.length})</h4>
                <div className="space-y-1 text-sm">
                  {seats.map((seat) => (
                    <div key={seat.id} className="flex justify-between">
                      <span>
                        {seat.section}, Rad {seat.row}, Sete {seat.number}
                      </span>
                      <span>{formatPrice(seat.price_nok)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Totalt</span>
                  <span className="text-primary">{formatPrice(calculatePrice())}</span>
                </div>
                {appliedDiscount && (
                  <p className="text-sm text-green-600 mt-2">
                    {appliedDiscount.type === "percentage"
                      ? `${appliedDiscount.value}% rabatt avslag: -${formatPrice(
                          bookingData!.totalPrice * (appliedDiscount.value / 100),
                        )}`
                      : `Rabatt avslag: -${formatPrice(appliedDiscount.value)}`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
