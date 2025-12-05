"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

interface Ensemble {
  id: string
  title: string
}

interface Venue {
  id: string
  name: string
  capacity: number // Use capacity instead of total_seats
}

export default function NewShowPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [ensembles, setEnsembles] = useState<Ensemble[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [formData, setFormData] = useState({
    ensemble_id: "",
    venue_id: "",
    show_datetime: "", // Use show_datetime
    team: "yellow",
    base_price_nok: 250,
    status: "draft",
  })

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function loadData() {
      const [{ data: e }, { data: v }] = await Promise.all([
        supabase.from("ensembles").select("id, title"),
        supabase
          .from("venues")
          .select("id, name, capacity"), // Use capacity
      ])
      setEnsembles(e || [])
      setVenues(v || [])
    }
    loadData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("shows").insert({
        ensemble_id: formData.ensemble_id,
        venue_id: formData.venue_id,
        show_datetime: new Date(formData.show_datetime).toISOString(),
        team: formData.team,
        base_price_nok: formData.base_price_nok,
        status: formData.status,
      })

      if (error) {
        console.log("[v0] Show insert error:", error.message)
        throw new Error(error.message)
      }

      toast.success("Forestilling opprettet!")
      router.push("/admin/forestillinger")
    } catch (error) {
      console.error("[v0] Error:", error)
      toast.error(error instanceof Error ? error.message : "Kunne ikke opprette forestilling")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/forestillinger">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ny forestilling</h1>
          <p className="text-muted-foreground">Opprett en ny forestilling for billettsalg</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Forestillingsinformasjon</CardTitle>
            <CardDescription>Velg ensemble, lokale og tidspunkt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ensemble *</Label>
              <Select
                value={formData.ensemble_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, ensemble_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg ensemble" />
                </SelectTrigger>
                <SelectContent>
                  {ensembles.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Venue *</Label>
              <Select value={formData.venue_id} onValueChange={(v) => setFormData((p) => ({ ...p, venue_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg lokale" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.capacity} seter)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Dato og tid *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.show_datetime}
                onChange={(e) => setFormData((p) => ({ ...p, show_datetime: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Lag</Label>
              <Select value={formData.team} onValueChange={(v) => setFormData((p) => ({ ...p, team: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yellow">Gult lag</SelectItem>
                  <SelectItem value="blue">Blått lag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Grunnpris (NOK) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={formData.base_price_nok}
                onChange={(e) => setFormData((p) => ({ ...p, base_price_nok: Number.parseInt(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Kladd</SelectItem>
                  <SelectItem value="scheduled">Planlagt</SelectItem>
                  <SelectItem value="on_sale">I salg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button asChild variant="outline">
            <Link href="/admin/forestillinger">Avbryt</Link>
          </Button>
          <Button type="submit" disabled={isLoading || !formData.ensemble_id || !formData.venue_id}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Opprett forestilling
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  )
}
