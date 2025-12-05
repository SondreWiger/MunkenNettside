"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function NewEnsemblePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    year: new Date().getFullYear(),
    genre: [] as string[],
    genreInput: "", // For comma-separated input
    synopsis_short: "",
    synopsis_long: "",
    thumbnail_url: "",
    banner_url: "",
    trailer_url: "",
    director: "",
    yellow_team_name: "Gult lag",
    blue_team_name: "Blått lag",
    yellow_cast: [] as { role: string; actor: string }[],
    blue_cast: [] as { role: string; actor: string }[],
    crew: [] as { role: string; name: string }[],
    duration_minutes: 120,
    age_rating: "Alle",
    is_published: false,
  })

  const supabase = getSupabaseBrowserClient()

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

  const addTeamMember = (team: "yellow_cast" | "blue_cast") => {
    setFormData((prev) => ({
      ...prev,
      [team]: [...prev[team], { role: "", actor: "" }],
    }))
  }

  const updateTeamMember = (
    team: "yellow_cast" | "blue_cast",
    index: number,
    field: "role" | "actor",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [team]: prev[team].map((member, i) => (i === index ? { ...member, [field]: value } : member)),
    }))
  }

  const removeTeamMember = (team: "yellow_cast" | "blue_cast", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [team]: prev[team].filter((_, i) => i !== index),
    }))
  }

  const addCrewMember = () => {
    setFormData((prev) => ({
      ...prev,
      crew: [...prev.crew, { role: "", name: "" }],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("ensembles").insert({
        title: formData.title,
        slug: formData.slug,
        year: formData.year,
        genre: formData.genreInput
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
        synopsis_short: formData.synopsis_short || null,
        synopsis_long: formData.synopsis_long || null,
        thumbnail_url: formData.thumbnail_url || null,
        banner_url: formData.banner_url || null,
        trailer_url: formData.trailer_url || null,
        director: formData.director || null,
        yellow_team_name: formData.yellow_team_name,
        blue_team_name: formData.blue_team_name,
        yellow_cast: formData.yellow_cast.filter((m) => m.role && m.actor),
        blue_cast: formData.blue_cast.filter((m) => m.role && m.actor),
        crew: formData.crew.filter((m) => m.role && m.name),
        duration_minutes: formData.duration_minutes,
        age_rating: formData.age_rating,
        is_published: formData.is_published,
      })

      if (error) {
        console.error("[v0] Supabase error:", error.message)
        toast.error(error.message || "Kunne ikke opprette ensemble")
        return
      }

      toast.success("Ensemble opprettet!")
      router.push("/admin/ensembler")
    } catch (error) {
      console.error("[v0] Unexpected error:", error)
      const message = error instanceof Error ? error.message : "En uventet feil oppstod"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/ensembler">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nytt ensemble</h1>
          <p className="text-muted-foreground">Opprett en ny teaterproduksjon</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Grunninfo</TabsTrigger>
            <TabsTrigger value="cast">Rollebesetning</TabsTrigger>
            <TabsTrigger value="crew">Crew</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Grunnleggende informasjon</CardTitle>
                <CardDescription>Fyll ut informasjon om produksjonen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tittel *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL-slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="year">År *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData((prev) => ({ ...prev, year: Number.parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Varighet (minutter)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, duration_minutes: Number.parseInt(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Aldersgrense</Label>
                    <Input
                      id="age"
                      value={formData.age_rating}
                      onChange={(e) => setFormData((prev) => ({ ...prev, age_rating: e.target.value }))}
                      placeholder="Alle, 6+, 12+..."
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Sjanger (kommaseparert)</Label>
                    <Input
                      id="genre"
                      value={formData.genreInput}
                      onChange={(e) => setFormData((prev) => ({ ...prev, genreInput: e.target.value }))}
                      placeholder="Musical, Drama, Komedie"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="director">Regissør</Label>
                    <Input
                      id="director"
                      value={formData.director}
                      onChange={(e) => setFormData((prev) => ({ ...prev, director: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="synopsis_short">Kort beskrivelse</Label>
                  <Textarea
                    id="synopsis_short"
                    value={formData.synopsis_short}
                    onChange={(e) => setFormData((prev) => ({ ...prev, synopsis_short: e.target.value }))}
                    rows={2}
                    placeholder="En kort oppsummering for listeoversikter..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="synopsis_long">Full synopsis</Label>
                  <Textarea
                    id="synopsis_long"
                    value={formData.synopsis_long}
                    onChange={(e) => setFormData((prev) => ({ ...prev, synopsis_long: e.target.value }))}
                    rows={4}
                    placeholder="Detaljert beskrivelse av handlingen..."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Miniatyrbilde URL</Label>
                    <Input
                      id="thumbnail"
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banner">Banner URL</Label>
                    <Input
                      id="banner"
                      type="url"
                      value={formData.banner_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, banner_url: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trailer">Trailer URL</Label>
                  <Input
                    id="trailer"
                    type="url"
                    value={formData.trailer_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, trailer_url: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))}
                  />
                  <Label htmlFor="published">Publiser umiddelbart</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cast">
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div className="space-y-2">
                <Label htmlFor="yellow_team_name">Navn på gult lag</Label>
                <Input
                  id="yellow_team_name"
                  value={formData.yellow_team_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, yellow_team_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blue_team_name">Navn på blått lag</Label>
                <Input
                  id="blue_team_name"
                  value={formData.blue_team_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, blue_team_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    {formData.yellow_team_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.yellow_cast.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Rolle"
                        value={member.role}
                        onChange={(e) => updateTeamMember("yellow_cast", index, "role", e.target.value)}
                      />
                      <Input
                        placeholder="Skuespiller"
                        value={member.actor}
                        onChange={(e) => updateTeamMember("yellow_cast", index, "actor", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTeamMember("yellow_cast", index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => addTeamMember("yellow_cast")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Legg til rolle
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                    {formData.blue_team_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.blue_cast.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Rolle"
                        value={member.role}
                        onChange={(e) => updateTeamMember("blue_cast", index, "role", e.target.value)}
                      />
                      <Input
                        placeholder="Skuespiller"
                        value={member.actor}
                        onChange={(e) => updateTeamMember("blue_cast", index, "actor", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTeamMember("blue_cast", index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => addTeamMember("blue_cast")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Legg til rolle
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="crew">
            <Card>
              <CardHeader>
                <CardTitle>Crew og produksjonsteam</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.crew.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Stilling (f.eks. Regissør)"
                      value={member.role}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          crew: prev.crew.map((m, i) => (i === index ? { ...m, role: e.target.value } : m)),
                        }))
                      }
                    />
                    <Input
                      placeholder="Navn"
                      value={member.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          crew: prev.crew.map((m, i) => (i === index ? { ...m, name: e.target.value } : m)),
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, crew: prev.crew.filter((_, i) => i !== index) }))
                      }
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" className="w-full bg-transparent" onClick={addCrewMember}>
                  <Users className="h-4 w-4 mr-2" />
                  Legg til crew-medlem
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-8">
          <Button asChild variant="outline">
            <Link href="/admin/ensembler">Avbryt</Link>
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
                Opprett ensemble
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  )
}
