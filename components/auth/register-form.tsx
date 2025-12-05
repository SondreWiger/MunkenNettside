"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function RegisterForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/min-side"
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError("Passordene stemmer ikke overens")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Passordet må være minst 8 tegn")
      setIsLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}${redirectTo}`,
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Denne e-postadressen er allerede registrert")
        } else {
          setError(signUpError.message)
        }
        return
      }

      if (data.user) {
        setSuccess(true)
      }
    } catch {
      setError("Noe gikk galt. Vennligst prøv igjen.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
          <CardTitle className="text-2xl font-bold">Sjekk e-posten din</CardTitle>
          <CardDescription className="text-base">
            Vi har sendt en bekreftelseslenke til <strong>{email}</strong>. Klikk på lenken for å aktivere kontoen din.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full h-12">
            <Link href="/logg-inn">Gå til innlogging</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Opprett konto</CardTitle>
        <CardDescription className="text-center">Fyll ut skjemaet for å opprette en ny konto</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-base">
              Fullt navn *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Ola Nordmann"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              E-post *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="din@epost.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base">
              Telefon (valgfritt)
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+47 123 45 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">
              Passord *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minst 8 tegn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-12 text-base pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-12 w-12"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Skjul passord" : "Vis passord"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-base">
              Bekreft passord *
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Gjenta passord"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="h-12 text-base"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Oppretter konto...
              </>
            ) : (
              "Opprett konto"
            )}
          </Button>

          <p className="text-center text-muted-foreground">
            Har du allerede konto?{" "}
            <Link href="/logg-inn" className="font-medium text-primary hover:underline">
              Logg inn
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
