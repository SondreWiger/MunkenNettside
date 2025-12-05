"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Film, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils/booking"
import type { Ensemble, Recording } from "@/lib/types"

export function RecordingCheckout() {
  const [ensemble, setEnsemble] = useState<Ensemble | null>(null)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [selectedTeam, setSelectedTeam] = useState<"yellow" | "blue" | "both">("yellow")
  const [customerEmail, setCustomerEmail] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [appliedDiscount, setAppliedDiscount] = useState<{ type: string; value: number } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowserClient()

  const ensembleId = searchParams.get("ensemble")
  const teamParam = searchParams.get("team") as "yellow" | "blue" | "both" | null

  useEffect(() => {
    if (!ensembleId) {
      router.push("/opptak")
      return
    }

    const fetchData = async () => {
      const { data: ensembleData } = await supabase.from("ensembles").select("*").eq("id", ensembleId).single()

      const { data: recordingsData } = await supabase.from("recordings").select("*").eq("ensemble_id", ensembleId)

      setEnsemble(ensembleData)
      setRecordings(recordingsData || [])

      if (teamParam) {
        setSelectedTeam(teamParam)
      }

      // Pre-fill email if logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        setCustomerEmail(user.email)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [ensembleId, teamParam, router, supabase])

  if (isLoading) {
    return (
      <div className="container px-4 py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Laster...</p>
      </div>
    )
  }

  if (!ensemble) {
    return (
      <div className="container px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-4">Produksjon ikke funnet</h1>
        <Button asChild>
          <Link href="/opptak">Tilbake til opptak</Link>
        </Button>
      </div>
    )
  }

  const yellowRecordings = recordings.filter((r) => r.team === "yellow")
  const blueRecordings = recordings.filter((r) => r.team === "blue")

  const calculatePrice = () => {
    const basePrice = ensemble.recording_price_nok
    let price = basePrice
    if (selectedTeam === "both") {
      price = basePrice * 2 * 0.8 // 20% discount for both
    }

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

  const getSelectedRecordings = () => {
    if (selectedTeam === "yellow") return yellowRecordings
    if (selectedTeam === "blue") return blueRecordings
    return recordings
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

      // Check if applicable to recordings
      if (code.applicable_to !== "both" && code.applicable_to !== "recordings") {
        setDiscountError("Denne rabattkoden kan ikke brukes på opptak")
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

    setIsProcessing(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login
        sessionStorage.setItem(
          "pendingPurchase",
          JSON.stringify({
            ensembleId: ensemble.id,
            team: selectedTeam,
            email: customerEmail,
          }),
        )
        router.push(`/logg-inn?redirect=/kasse?ensemble=${ensemble.id}&team=${selectedTeam}`)
        return
      }

      // Create purchase via API (mock payment)
      const response = await fetch("/api/purchases/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ensembleId: ensemble.id,
          recordingIds: getSelectedRecordings().map((r) => r.id),
          team: selectedTeam,
          amount: calculatePrice(),
          discountCode: appliedDiscount ? discountCode.toUpperCase() : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Kunne ikke fullføre kjøpet")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt")
    } finally {
      setIsProcessing(false)
    }
  }

  if (success) {
    return (
      <div className="container px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Takk for kjøpet!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Du har nå tilgang til opptaket. Gå til &quot;Mine opptak&quot; for å se det.
          </p>
          <div className="flex flex-col gap-4">
            <Button asChild size="lg">
              <Link href="/mine-opptak">
                <Film className="mr-2 h-5 w-5" />
                Se opptak
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Tilbake til forsiden</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Kjøp opptak</h1>
        <p className="text-lg text-muted-foreground mb-8">{ensemble.title}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Velg lag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {yellowRecordings.length > 0 && (
                <label
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedTeam === "yellow"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="team"
                      value="yellow"
                      checked={selectedTeam === "yellow"}
                      onChange={() => setSelectedTeam("yellow")}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-semibold">{ensemble.yellow_team_name}</p>
                      <p className="text-sm text-muted-foreground">{yellowRecordings.length} opptak</p>
                    </div>
                  </div>
                  <span className="font-bold">{formatPrice(ensemble.recording_price_nok)}</span>
                </label>
              )}

              {blueRecordings.length > 0 && (
                <label
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedTeam === "blue"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="team"
                      value="blue"
                      checked={selectedTeam === "blue"}
                      onChange={() => setSelectedTeam("blue")}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-semibold">{ensemble.blue_team_name}</p>
                      <p className="text-sm text-muted-foreground">{blueRecordings.length} opptak</p>
                    </div>
                  </div>
                  <span className="font-bold">{formatPrice(ensemble.recording_price_nok)}</span>
                </label>
              )}

              {yellowRecordings.length > 0 && blueRecordings.length > 0 && (
                <label
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedTeam === "both"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="team"
                      value="both"
                      checked={selectedTeam === "both"}
                      onChange={() => setSelectedTeam("both")}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-semibold">Begge lag</p>
                      <p className="text-sm text-muted-foreground">{recordings.length} opptak totalt</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{formatPrice(calculatePrice())}</span>
                    <Badge variant="secondary" className="ml-2">
                      Spar 20%
                    </Badge>
                  </div>
                </label>
              )}
            </CardContent>
          </Card>

          {/* Discount Code */}
          <Card>
            <CardHeader>
              <CardTitle>Rabattkode (valgfritt)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value)
                    if (appliedDiscount) setAppliedDiscount(null)
                  }}
                  placeholder="Skriv inn rabattkode"
                  className="h-12"
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
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle>Kontaktinformasjon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  className="h-12"
                  placeholder="din@epost.no"
                />
                <p className="text-sm text-muted-foreground">Bekreftelse sendes til denne adressen</p>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
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
              og forstår at digitale opptak ikke refunderes.
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Summary & Submit */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg">Totalt</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(calculatePrice())}</span>
              </div>
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
              <p className="text-sm text-muted-foreground text-center mt-4">
                Midlertidig: Betaling simuleres for testing. Vipps-integrasjon kommer snart.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
