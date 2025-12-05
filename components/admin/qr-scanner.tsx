"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode"
import { Camera, Keyboard, CheckCircle, XCircle, AlertTriangle, Loader2, Users, Scan, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { formatDateTime } from "@/lib/utils/booking"

interface ScanResult {
  status: "success" | "error" | "warning"
  message: string
  booking?: {
    id: string
    reference: string
    customerName: string
    showTitle: string
    showDatetime: string
    seats: Array<{ section: string; row: string; number: number }>
    specialRequests?: string
    alreadyCheckedIn: boolean
  }
}

export function QRScanner() {
  const [mode, setMode] = useState<"camera" | "manual">("manual") // Default to manual to avoid camera permission issues on load
  const [manualCode, setManualCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [autoCheckIn, setAutoCheckIn] = useState(true)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const processingRef = useRef(false)
  const cameraStartedRef = useRef(false)

  useEffect(() => {
    return () => {
      if (scannerRef.current && cameraStartedRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const handleScan = useCallback(
    async (data: string) => {
      // Prevent duplicate scans
      if (processingRef.current || data === lastScannedCode) return

      processingRef.current = true
      setIsProcessing(true)
      setLastScannedCode(data)

      try {
        // First verify the ticket
        const response = await fetch("/api/admin/verify-ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrData: data }),
        })

        const verifyResult = await response.json()

        // If valid and auto-check-in enabled, and not already checked in
        if (
          verifyResult.status === "success" &&
          autoCheckIn &&
          verifyResult.booking &&
          !verifyResult.booking.alreadyCheckedIn
        ) {
          // Auto check-in
          const checkInResponse = await fetch("/api/admin/check-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId: verifyResult.booking.id }),
          })

          const checkInResult = await checkInResponse.json()

          if (checkInResult.success) {
            setResult({
              status: "success",
              message: "Billett automatisk sjekket inn!",
              booking: { ...verifyResult.booking, alreadyCheckedIn: true },
            })
          } else {
            setResult({
              status: "error",
              message: checkInResult.error || "Kunne ikke sjekke inn",
              booking: verifyResult.booking,
            })
          }
        } else {
          setResult(verifyResult)
        }
      } catch (err) {
        console.error("[v0] Scan error:", err)
        setResult({
          status: "error",
          message: "Kunne ikke verifisere billett. Prøv igjen.",
        })
      } finally {
        processingRef.current = false
        setIsProcessing(false)

        // Reset last scanned code after 3 seconds to allow re-scanning same code
        setTimeout(() => {
          setLastScannedCode(null)
        }, 3000)
      }
    },
    [autoCheckIn, lastScannedCode],
  )

  const startScanner = async () => {
    if (!containerRef.current || cameraStartedRef.current) return

    try {
      setCameraError(null)
      
      // Create a new scanner instance
      scannerRef.current = new Html5Qrcode("qr-reader")

      // Attempt to get available cameras
      // This will work on any domain - camera access is handled by browser permissions
      let cameras: any[] | null = null
      
      try {
        cameras = await Html5Qrcode.getCameras()
      } catch (cameraErr) {
        const cameraErrMsg = cameraErr instanceof Error ? cameraErr.message : String(cameraErr)
        console.error("[v0] Camera enumeration error:", cameraErrMsg)
        
        // Provide user-friendly error message
        let userMessage = "Kamera ikke tilgjengelig"
        
        if (cameraErrMsg.toLowerCase().includes("permission") || 
            cameraErrMsg.toLowerCase().includes("denied") ||
            cameraErrMsg.toLowerCase().includes("notallowed")) {
          userMessage = "📱 Kameratillatelse avvist.\n\nLøsning:\n1. Klikk på ikonene i adresselinjen\n2. Finn \"Kamera\" eller \"Tillatelser\"\n3. Velg \"Tillat\"\n4. Prøv igjen"
        } else if (cameraErrMsg.toLowerCase().includes("no camera") || 
                   cameraErrMsg.toLowerCase().includes("notfound")) {
          userMessage = "❌ Ingen kamera funnet på enheten.\n\nBruk manuell inngang i stedet."
        } else if (cameraErrMsg.toLowerCase().includes("secure") || 
                   cameraErrMsg.toLowerCase().includes("https")) {
          userMessage = "🔒 Sikkerhetskrav: Bruk HTTPS eller spør IT-støtte\n\nBruk manuell inngang i stedet."
        } else {
          userMessage = `Kamerafeil: ${cameraErrMsg}\n\nBruk manuell inngang i stedet.`
        }
        
        throw new Error(userMessage)
      }

      if (!cameras || cameras.length === 0) {
        throw new Error("Ingen kameraer tilgjengelig på enheten.\n\nBruk manuell inngang i stedet.")
      }

      console.log("[v0] Available cameras:", cameras)

      // Use the back camera if available, otherwise the first camera
      const backCamera = cameras.find((c) => 
        c.label.toLowerCase().includes("back") || 
        c.label.toLowerCase().includes("rear") ||
        c.label.toLowerCase().includes("environment")
      )
      const cameraId = backCamera?.id || cameras[0].id

      console.log("[v0] Starting camera with ID:", cameraId)

      await scannerRef.current.start(
        cameraId,
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        async (decodedText) => {
          console.log("[v0] QR code decoded:", decodedText)
          await handleScan(decodedText)
        },
        (errorMessage) => {
          // Silently ignore frame errors (continuous scanning errors)
          if (errorMessage && !errorMessage.includes("NotFoundException")) {
            // Only log if it's a real error, not a scan failure
            if (!errorMessage.includes("No QR code found")) {
              console.debug("[v0] Scanner frame info:", errorMessage)
            }
          }
        },
      )

      cameraStartedRef.current = true
      setIsScanning(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error("[v0] Scanner startup error:", errorMessage)

      // Format error message for user
      const userMessage = errorMessage.includes("\n") 
        ? errorMessage 
        : `❌ Kunne ikke starte kamera:\n${errorMessage}\n\nBruk manuell inngang i stedet.`

      setCameraError(userMessage)
      setResult({
        status: "error",
        message: userMessage,
      })
      
      // Optionally switch to manual mode automatically
      console.info("[v0] Suggest switching to manual mode")
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && cameraStartedRef.current) {
      try {
        await scannerRef.current.stop()
        cameraStartedRef.current = false
        setIsScanning(false)
        setCameraError(null)
      } catch (err) {
        console.error("[v0] Error stopping scanner:", err)
      }
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return

    setIsProcessing(true)

    try {
      const response = await fetch("/api/admin/verify-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingReference: manualCode.trim().toUpperCase() }),
      })

      const verifyResult = await response.json()

      // If valid and auto-check-in enabled, and not already checked in
      if (
        verifyResult.status === "success" &&
        autoCheckIn &&
        verifyResult.booking &&
        !verifyResult.booking.alreadyCheckedIn
      ) {
        const checkInResponse = await fetch("/api/admin/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: verifyResult.booking.id }),
        })

        const checkInResult = await checkInResponse.json()

        if (checkInResult.success) {
          setResult({
            status: "success",
            message: "Billett sjekket inn!",
            booking: { ...verifyResult.booking, alreadyCheckedIn: true },
          })
        } else {
          setResult({
            status: "error",
            message: checkInResult.error || "Kunne ikke sjekke inn",
            booking: verifyResult.booking,
          })
        }
      } else {
        setResult(verifyResult)
      }
    } catch {
      setResult({
        status: "error",
        message: "Kunne ikke verifisere billett. Prøv igjen.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckIn = async () => {
    if (!result?.booking) return

    setIsProcessing(true)

    try {
      const response = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: result.booking.id }),
      })

      const checkInResult = await response.json()

      if (checkInResult.success) {
        setResult({
          status: "success",
          message: "Billett sjekket inn!",
          booking: { ...result.booking, alreadyCheckedIn: true },
        })
      } else {
        setResult({
          status: "error",
          message: checkInResult.error || "Kunne ikke sjekke inn",
        })
      }
    } catch {
      setResult({
        status: "error",
        message: "Feil ved innsjekking",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const clearResult = () => {
    setResult(null)
    setManualCode("")
    setLastScannedCode(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-primary" />
              <Label htmlFor="auto-checkin" className="font-medium">
                Automatisk innsjekking
              </Label>
            </div>
            <Switch id="auto-checkin" checked={autoCheckIn} onCheckedChange={setAutoCheckIn} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {autoCheckIn
              ? "Billetter sjekkes inn automatisk når QR-koden leses"
              : "Du må manuelt bekrefte innsjekking for hver billett"}
          </p>
        </CardContent>
      </Card>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === "camera" ? "default" : "outline"}
          onClick={() => {
            setMode("camera")
            clearResult()
          }}
          className="flex-1"
        >
          <Camera className="mr-2 h-5 w-5" />
          📸 Kamera
        </Button>
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => {
            setMode("manual")
            stopScanner()
            clearResult()
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <Keyboard className="mr-2 h-5 w-5" />
          ⌨️ Manuell (Anbefalt)
        </Button>
      </div>

      {/* Scanner / Manual Input */}
      <Card>
        <CardContent className="p-6">
      {cameraError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kamerafeil</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap text-sm font-mono">
            {cameraError}
          </AlertDescription>
        </Alert>
      )}          {mode === "camera" ? (
            <div className="space-y-4">
              <div
                id="qr-reader"
                ref={containerRef}
                className="w-full aspect-square bg-muted rounded-lg overflow-hidden"
              />

              {isScanning && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Skanner aktivt - hold QR-kode foran kamera</span>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifiserer billett...</span>
                </div>
              )}

              {!isScanning ? (
                <Button onClick={startScanner} className="w-full h-14 text-lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Start kamera
                </Button>
              ) : (
                <Button onClick={stopScanner} variant="outline" className="w-full h-14 text-lg bg-transparent">
                  Stopp kamera
                </Button>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-bold mb-2">
                  📋 Bestillingsreferanse
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Eksempel: THTR-20240315-A3F9
                </p>
                <Input
                  id="code"
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Skriv inn referanse..."
                  className="h-14 text-lg font-mono text-center uppercase"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={isProcessing || !manualCode.trim()} className="w-full h-14 text-lg bg-green-600 hover:bg-green-700">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifiserer...
                  </>
                ) : (
                  "✓ Verifiser billett"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card
          className={`border-2 ${
            result.status === "success"
              ? "border-green-500"
              : result.status === "warning"
                ? "border-yellow-500"
                : "border-red-500"
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.status === "success" && <CheckCircle className="h-6 w-6 text-green-500" />}
              {result.status === "warning" && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
              {result.status === "error" && <XCircle className="h-6 w-6 text-red-500" />}
              {result.status === "success" ? "Gyldig billett" : result.status === "warning" ? "Advarsel" : "Ugyldig"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={result.status === "error" ? "destructive" : "default"}>
              <AlertDescription className="text-lg">{result.message}</AlertDescription>
            </Alert>

            {result.booking && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Kunde</p>
                  <p className="text-xl font-bold">{result.booking.customerName}</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Referanse</p>
                  <p className="text-lg font-mono font-semibold">{result.booking.reference}</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Forestilling</p>
                  <p className="text-lg font-semibold">{result.booking.showTitle}</p>
                  <p className="text-muted-foreground">{formatDateTime(result.booking.showDatetime)}</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Seter</p>
                  <div className="flex flex-wrap gap-2">
                    {result.booking.seats.map((seat, i) => (
                      <Badge key={i} variant="secondary" className="text-base py-1 px-3">
                        {seat.section}, Rad {seat.row}, Sete {seat.number}
                      </Badge>
                    ))}
                  </div>
                </div>

                {result.booking.specialRequests && (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertTitle>Spesielle behov</AlertTitle>
                    <AlertDescription>{result.booking.specialRequests}</AlertDescription>
                  </Alert>
                )}

                {!result.booking.alreadyCheckedIn &&
                  (result.status === "success" || result.status === "warning") &&
                  !autoCheckIn && (
                    <Button
                      onClick={handleCheckIn}
                      disabled={isProcessing}
                      className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sjekker inn...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Marker som sjekket inn
                        </>
                      )}
                    </Button>
                  )}

                {result.booking.alreadyCheckedIn && (
                  <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-700 dark:text-green-400 font-semibold">Innsjekket</p>
                  </div>
                )}
              </div>
            )}

            <Button onClick={clearResult} variant="outline" className="w-full bg-transparent">
              Skann neste
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
