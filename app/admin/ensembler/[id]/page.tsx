"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Plus, Trash2, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export const dynamic = "force-dynamic"

interface Recording {
  id: string
  team: string
  description: string
  jottacloud_embed_url: string
  quality: string
  recording_date: string
  duration: number
  thumbnail_url: string
}

interface Ensemble {
  id: string
  title: string
  slug: string
  description: string
  synopsis_short: string
  synopsis_long: string
  thumbnail_url: string
  banner_url: string
  trailer_url: string
  hero_video_url: string
  yellow_team_name: string
  blue_team_name: string
  yellow_cast: { name: string; role: string }[]
  blue_cast: { name: string; role: string }[]
  crew: { name: string; role: string }[]
  director: string
  year: number
  premiere_date: string
  duration_minutes: number
  age_rating: string
  genre: string[]
  language: string
  recording_price_nok: number
  is_published: boolean
  featured: boolean
}

export default function EditEnsemblePage() {
  const router = useRouter()
  const params = useParams()
  const ensembleId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ensemble, setEnsemble] = useState<Ensemble | null>(null)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [newRecording, setNewRecording] = useState({
    team: "yellow",
    description: "",
    jottacloud_embed_url: "",
    quality: "1080p",
    recording_date: "",
    duration: 0,
    thumbnail_url: "",
  })

  useEffect(() => {
    loadEnsemble()
  }, [ensembleId])

  async function loadEnsemble() {
    const supabase = getSupabaseBrowserClient()

    const { data: ensembleData, error: ensembleError } = await supabase
      .from("ensembles")
      .select("*")
      .eq("id", ensembleId)
      .single()

    if (ensembleError) {
      console.error("[v0] Error loading ensemble:", ensembleError.message)
      toast.error("Kunne ikke laste ensemble")
      router.push("/admin/ensembler")
      return
    }

    const { data: recordingsData } = await supabase
      .from("recordings")
      .select("*")
      .eq("ensemble_id", ensembleId)
      .order("recording_date", { ascending: false })

    setEnsemble({
      ...ensembleData,
      yellow_cast: ensembleData.yellow_cast || [],
      blue_cast: ensembleData.blue_cast || [],
      crew: ensembleData.crew || [],
      genre: ensembleData.genre || [],
    })
    setRecordings(recordingsData || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!ensemble) return
    setSaving(true)

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("ensembles").update(ensemble).eq("id", ensembleId)

    if (error) {
      console.error("[v0] Save error:", error.message)
      toast.error("Kunne ikke lagre: " + error.message)
    } else {
      toast.success("Ensemble lagret!")
    }
    setSaving(false)
  }

  async function addRecording() {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("recordings")
      .insert({
        ensemble_id: ensembleId,
        ...newRecording,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Add recording error:", error.message)
      toast.error("Kunne ikke legge til opptak: " + error.message)
    } else {
      setRecordings([data, ...recordings])
      setNewRecording({
        team: "yellow",
        description: "",
        jottacloud_embed_url: "",
        quality: "1080p",
        recording_date: "",
        duration: 0,
        thumbnail_url: "",
      })
      toast.success("Opptak lagt til!")
    }
  }

  async function deleteRecording(id: string) {
    if (!confirm("Er du sikker på at du vil slette dette opptaket?")) return

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("recordings").delete().eq("id", id)

    if (error) {
      toast.error("Kunne ikke slette opptak: " + error.message)
    } else {
      setRecordings(recordings.filter((r) => r.id !== id))
      toast.success("Opptak slettet")
    }
  }

  if (loading) {
    return (
      <main className="container px-4 py-8">
        <p>Laster...</p>
      </main>
    )
  }

  if (!ensemble) {
    return (
      <main className="container px-4 py-8">
        <p>Ensemble ikke funnet</p>
      </main>
    )
  }

  return (
    <main className="container px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/ensembler">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Rediger {ensemble.title}</h1>
          <p className="text-muted-foreground">Endre ensemble og legg til opptak</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Lagrer..." : "Lagre"}
        </Button>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="cast">Rollebesetning</TabsTrigger>
          <TabsTrigger value="recordings">Opptak ({recordings.length})</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grunnleggende informasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tittel</Label>
                  <Input value={ensemble.title} onChange={(e) => setEnsemble({ ...ensemble, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input value={ensemble.slug} onChange={(e) => setEnsemble({ ...ensemble, slug: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Beskrivelse</Label>
                <Textarea
                  value={ensemble.description || ""}
                  onChange={(e) => setEnsemble({ ...ensemble, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Kort synopsis</Label>
                <Textarea
                  value={ensemble.synopsis_short || ""}
                  onChange={(e) => setEnsemble({ ...ensemble, synopsis_short: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Full synopsis</Label>
                <Textarea
                  value={ensemble.synopsis_long || ""}
                  onChange={(e) => setEnsemble({ ...ensemble, synopsis_long: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>År</Label>
                  <Input
                    type="number"
                    value={ensemble.year || ""}
                    onChange={(e) => setEnsemble({ ...ensemble, year: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Varighet (min)</Label>
                  <Input
                    type="number"
                    value={ensemble.duration_minutes || ""}
                    onChange={(e) => setEnsemble({ ...ensemble, duration_minutes: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aldersgrense</Label>
                  <Select
                    value={ensemble.age_rating || ""}
                    onValueChange={(value) => setEnsemble({ ...ensemble, age_rating: value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Regissør</Label>
                  <Input
                    value={ensemble.director || ""}
                    onChange={(e) => setEnsemble({ ...ensemble, director: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opptakspris (NOK)</Label>
                  <Input
                    type="number"
                    value={ensemble.recording_price_nok || ""}
                    onChange={(e) =>
                      setEnsemble({ ...ensemble, recording_price_nok: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gult lag - navn</Label>
                  <Input
                    value={ensemble.yellow_team_name || ""}
                    onChange={(e) => setEnsemble({ ...ensemble, yellow_team_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Blått lag - navn</Label>
                  <Input
                    value={ensemble.blue_team_name || ""}
                    onChange={(e) => setEnsemble({ ...ensemble, blue_team_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={ensemble.is_published}
                    onCheckedChange={(checked) => setEnsemble({ ...ensemble, is_published: checked })}
                  />
                  <Label>Publisert</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={ensemble.featured}
                    onCheckedChange={(checked) => setEnsemble({ ...ensemble, featured: checked })}
                  />
                  <Label>Fremhevet</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gult lag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(ensemble.yellow_cast || []).map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Navn"
                    value={member.name}
                    onChange={(e) => {
                      const newCast = [...ensemble.yellow_cast]
                      newCast[index] = { ...member, name: e.target.value }
                      setEnsemble({ ...ensemble, yellow_cast: newCast })
                    }}
                  />
                  <Input
                    placeholder="Rolle"
                    value={member.role}
                    onChange={(e) => {
                      const newCast = [...ensemble.yellow_cast]
                      newCast[index] = { ...member, role: e.target.value }
                      setEnsemble({ ...ensemble, yellow_cast: newCast })
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newCast = ensemble.yellow_cast.filter((_, i) => i !== index)
                      setEnsemble({ ...ensemble, yellow_cast: newCast })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setEnsemble({
                    ...ensemble,
                    yellow_cast: [...(ensemble.yellow_cast || []), { name: "", role: "" }],
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Legg til
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blått lag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(ensemble.blue_cast || []).map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Navn"
                    value={member.name}
                    onChange={(e) => {
                      const newCast = [...ensemble.blue_cast]
                      newCast[index] = { ...member, name: e.target.value }
                      setEnsemble({ ...ensemble, blue_cast: newCast })
                    }}
                  />
                  <Input
                    placeholder="Rolle"
                    value={member.role}
                    onChange={(e) => {
                      const newCast = [...ensemble.blue_cast]
                      newCast[index] = { ...member, role: e.target.value }
                      setEnsemble({ ...ensemble, blue_cast: newCast })
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newCast = ensemble.blue_cast.filter((_, i) => i !== index)
                      setEnsemble({ ...ensemble, blue_cast: newCast })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setEnsemble({
                    ...ensemble,
                    blue_cast: [...(ensemble.blue_cast || []), { name: "", role: "" }],
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Legg til
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recordings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Legg til nytt opptak</CardTitle>
              <CardDescription>
                Last opp video til Jottacloud og lim inn delingslenken her. Lenken vil bli skjult for brukere.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lag</Label>
                  <Select
                    value={newRecording.team}
                    onValueChange={(value) => setNewRecording({ ...newRecording, team: value })}
                  >
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
                  <Label>Kvalitet</Label>
                  <Select
                    value={newRecording.quality}
                    onValueChange={(value) => setNewRecording({ ...newRecording, quality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="4K">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Jottacloud embed/delingslenke</Label>
                <Input
                  placeholder="https://www.jottacloud.com/s/..."
                  value={newRecording.jottacloud_embed_url}
                  onChange={(e) => setNewRecording({ ...newRecording, jottacloud_embed_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Beskrivelse</Label>
                <Input
                  placeholder="F.eks. Premiere 15. mars 2024"
                  value={newRecording.description}
                  onChange={(e) => setNewRecording({ ...newRecording, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opptaksdato</Label>
                  <Input
                    type="date"
                    value={newRecording.recording_date}
                    onChange={(e) => setNewRecording({ ...newRecording, recording_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Varighet (sekunder)</Label>
                  <Input
                    type="number"
                    value={newRecording.duration || ""}
                    onChange={(e) => setNewRecording({ ...newRecording, duration: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Button onClick={addRecording} disabled={!newRecording.jottacloud_embed_url}>
                <Plus className="h-4 w-4 mr-2" />
                Legg til opptak
              </Button>
            </CardContent>
          </Card>

          {recordings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Eksisterende opptak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recordings.map((recording) => (
                  <div key={recording.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Film className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {recording.team === "yellow" ? "Gult lag" : "Blått lag"} - {recording.quality}
                      </p>
                      <p className="text-sm text-muted-foreground">{recording.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {recording.recording_date && new Date(recording.recording_date).toLocaleDateString("nb-NO")}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteRecording(recording.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bilder og video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Miniatyrbilde URL</Label>
                <Input
                  value={ensemble.thumbnail_url || ""}
                  onChange={(e) => setEnsemble({ ...ensemble, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Banner URL</Label>
                <Input
                  value={ensemble.banner_url || ""}
                  onChange={(e) => setEnsemble({ ...ensemble, banner_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Trailer URL</Label>
                <Input
                  value={ensemble.trailer_url || ""}
                  onChange={(e) => setEnsemble({ ...ensemble, trailer_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label>Hero video URL</Label>
                <Input
                  value={ensemble.hero_video_url || ""}
                  onChange={(e) => setEnsemble({ ...ensemble, hero_video_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
