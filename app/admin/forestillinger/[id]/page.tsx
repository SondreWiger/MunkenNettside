"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export const dynamic = "force-dynamic"

interface Show {
  id: string
  ensemble_id: string
  venue_id: string
  show_datetime: string
  doors_open_time: string
  team: string
  status: string
  base_price_nok: number
  available_seats: number
  special_notes: string
  age_restriction: string
  title: string
}

interface Ensemble {
  id: string
  title: string
}

interface Venue {
  id: string
  name: string
  capacity: number
}

export default function EditShowPage() {
  const router = useRouter()
  const params = useParams()
  const showId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [show, setShow] = useState<Show | null>(null)
  const [ensembles, setEnsembles] = useState<Ensemble[]>([])
  const [venues, setVenues] = useState<Venue[]>([])

  useEffect(() => {
    loadData()
  }, [showId])

  async function loadData() {
    const supabase = getSupabaseBrowserClient()

    const [showRes, ensemblesRes, venuesRes] = await Promise.all([
      supabase.from("shows").select("*").eq("id", showId).single(),
      supabase.from("ensembles").select("id, title").order("title"),
      supabase.from("venues").select("id, name, capacity").order("name"),
    ])

    if (showRes.error) {
      console.error("[v0] Error loading show:", showRes.error.message)
      toast.error("Kunne ikke laste forestilling")
      router.push("/admin/forestillinger")
      return
    }

    setShow(showRes.data)
    setEnsembles(ensemblesRes.data || [])
    setVenues(venuesRes.data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!show) return
    setSaving(true)

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("shows").update(show).eq("id", showId)

    if (error) {
      console.error("[v0] Save error:", error.message)
      toast.error("Kunne ikke lagre: " + error.message)
    } else {
      toast.success("Forestilling lagret!")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <main className="container px-4 py-8">
        <p>Laster...</p>
      </main>
    )
  }

  if (!show) {
    return (
      <main className="container px-4 py-8">
        <p>Forestilling ikke funnet</p>
      </main>
    )
  }

  return (
    <main className="container px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/forestillinger">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Rediger forestilling</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Lagrer..." : "Lagre"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forestillingsdetaljer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ensemble</Label>
            <Select value={show.ensemble_id || ""} onValueChange={(value) => setShow({ ...show, ensemble_id: value })}>
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
            <Label>Venue</Label>
            <Select value={show.venue_id || ""} onValueChange={(value) => setShow({ ...show, venue_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Velg venue" />
              </SelectTrigger>
              <SelectContent>
                {venues.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} ({v.capacity} plasser)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lag</Label>
              <Select value={show.team || ""} onValueChange={(value) => setShow({ ...show, team: value })}>
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
              <Label>Status</Label>
              <Select value={show.status || ""} onValueChange={(value) => setShow({ ...show, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Kladd</SelectItem>
                  <SelectItem value="scheduled">Planlagt</SelectItem>
                  <SelectItem value="on_sale">I salg</SelectItem>
                  <SelectItem value="sold_out">Utsolgt</SelectItem>
                  <SelectItem value="completed">Fullført</SelectItem>
                  <SelectItem value="cancelled">Kansellert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Forestillingsdato og -tid</Label>
              <Input
                type="datetime-local"
                value={show.show_datetime ? show.show_datetime.slice(0, 16) : ""}
                onChange={(e) => setShow({ ...show, show_datetime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Dørene åpner</Label>
              <Input
                type="datetime-local"
                value={show.doors_open_time ? show.doors_open_time.slice(0, 16) : ""}
                onChange={(e) => setShow({ ...show, doors_open_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Basispris (NOK)</Label>
              <Input
                type="number"
                value={show.base_price_nok || ""}
                onChange={(e) => setShow({ ...show, base_price_nok: Number.parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Aldersgrense</Label>
              <Select
                value={show.age_restriction || ""}
                onValueChange={(value) => setShow({ ...show, age_restriction: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Alle</SelectItem>
                  <SelectItem value="6">6 år</SelectItem>
                  <SelectItem value="9">9 år</SelectItem>
                  <SelectItem value="12">12 år</SelectItem>
                  <SelectItem value="15">15 år</SelectItem>
                  <SelectItem value="18">18 år</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Spesielle notater</Label>
            <Textarea
              value={show.special_notes || ""}
              onChange={(e) => setShow({ ...show, special_notes: e.target.value })}
              placeholder="F.eks. pauseservering, spesielle arrangementer..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
