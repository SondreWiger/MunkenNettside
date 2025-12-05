"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Loader2, Save, Globe, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SiteSettings {
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  address: string
  social_links: {
    facebook?: string
    instagram?: string
    twitter?: string
  }
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "Teateret",
    site_description: "Opplev magi på scenen",
    contact_email: "",
    contact_phone: "",
    address: "",
    social_links: {},
  })

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      const { data } = await supabase.from("site_settings").select("*").eq("key", "general").single()

      if (data?.value) {
        setSettings(data.value as SiteSettings)
      }
      setIsLoading(false)
    }
    loadSettings()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await supabase.from("site_settings").upsert({
        key: "general",
        value: settings,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast.success("Innstillinger lagret!")
    } catch (error) {
      console.error(error)
      toast.error("Kunne ikke lagre innstillinger")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="container px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    )
  }

  return (
    <main className="container px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Innstillinger</h1>
        <p className="text-muted-foreground">Administrer nettstedinnstillinger</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Generelt
            </CardTitle>
            <CardDescription>Grunnleggende nettstedinformasjon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Nettstedsnavn</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => setSettings((p) => ({ ...p, site_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Beskrivelse</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => setSettings((p) => ({ ...p, site_description: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Kontaktinformasjon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">E-post</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings((p) => ({ ...p, contact_email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefon</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => setSettings((p) => ({ ...p, contact_phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Sosiale medier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                type="url"
                value={settings.social_links.facebook || ""}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    social_links: { ...p.social_links, facebook: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                type="url"
                value={settings.social_links.instagram || ""}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    social_links: { ...p.social_links, instagram: e.target.value },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lagre innstillinger
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  )
}
