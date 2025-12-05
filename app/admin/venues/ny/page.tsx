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
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function NewVenuePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postal_code: "",
    rows: 10,
    seatsPerRow: 10,
  })

  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const totalCapacity = formData.rows * formData.seatsPerRow

      const { error } = await supabase.from("venues").insert({
        name: formData.name,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        capacity: totalCapacity,
        seat_map_config: {
          rows: formData.rows,
          seatsPerRow: formData.seatsPerRow,
        },
      })

      if (error) {
        console.log("[v0] Supabase error:", error.message)
        throw new Error(error.message)
      }

      toast.success("Lokale opprettet!")
      router.push("/admin/venues")
    } catch (error) {
      console.error("[v0] Error:", error)
      toast.error(error instanceof Error ? error.message : "Kunne ikke opprette lokale")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/venues">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nytt lokale</h1>
          <p className="text-muted-foreground">Opprett et nytt teater/venue</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Lokaleinformasjon</CardTitle>
            <CardDescription>Fyll ut informasjon om lokalet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Navn *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="F.eks. Hovedscenen"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                placeholder="Gateadresse"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postnummer</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData((p) => ({ ...p, postal_code: e.target.value }))}
                  placeholder="0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">By</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                  placeholder="Oslo"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rows">Antall rader</Label>
                <Input
                  id="rows"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.rows}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      rows: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seatsPerRow">Seter per rad</Label>
                <Input
                  id="seatsPerRow"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.seatsPerRow}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      seatsPerRow: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Totalt antall seter: <strong>{formData.rows * formData.seatsPerRow}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button asChild variant="outline">
            <Link href="/admin/venues">Avbryt</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Opprett lokale
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  )
}
