"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function NewDiscountCodePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: 10,
    max_uses: "",
    valid_from: "",
    valid_until: "",
    applicable_to: "both",
  })

  const supabase = getSupabaseBrowserClient()

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((p) => ({ ...p, code }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("discount_codes").insert({
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        max_uses: formData.max_uses ? Number.parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        applicable_to: formData.applicable_to,
        current_uses: 0,
      })

      if (error) {
        console.error("[v0] Supabase error:", error.message)
        throw new Error(error.message)
      }

      toast.success("Rabattkode opprettet!")
      router.push("/admin/rabattkoder")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ukjent feil"
      console.error("[v0] Error:", message)
      toast.error(`Kunne ikke opprette rabattkode: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/rabattkoder">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ny rabattkode</h1>
          <p className="text-muted-foreground">Opprett en ny rabattkode</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Rabattkodeinformasjon</CardTitle>
            <CardDescription>Definer rabattkoden og dens vilkår</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode *</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="F.eks. SOMMER2024"
                  className="font-mono"
                  required
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  Generer
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Prosent (%)</SelectItem>
                    <SelectItem value="fixed">Fast beløp (kr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Verdi *</Label>
                <Input
                  id="value"
                  type="number"
                  min={1}
                  value={formData.value}
                  onChange={(e) => setFormData((p) => ({ ...p, value: Number.parseInt(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gjelder for</Label>
              <Select
                value={formData.applicable_to}
                onValueChange={(v) => setFormData((p) => ({ ...p, applicable_to: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Alt (billetter og opptak)</SelectItem>
                  <SelectItem value="shows">Kun billetter</SelectItem>
                  <SelectItem value="recordings">Kun opptak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_uses">Maks antall bruk (valgfritt)</Label>
              <Input
                id="max_uses"
                type="number"
                min={1}
                value={formData.max_uses}
                onChange={(e) => setFormData((p) => ({ ...p, max_uses: e.target.value }))}
                placeholder="Ubegrenset"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Gyldig fra</Label>
                <Input
                  id="valid_from"
                  type="datetime-local"
                  value={formData.valid_from}
                  onChange={(e) => setFormData((p) => ({ ...p, valid_from: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">Gyldig til</Label>
                <Input
                  id="valid_until"
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData((p) => ({ ...p, valid_until: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button asChild variant="outline">
            <Link href="/admin/rabattkoder">Avbryt</Link>
          </Button>
          <Button type="submit" disabled={isLoading || !formData.code}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Opprett kode
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  )
}
