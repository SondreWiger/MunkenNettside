import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Film, Play, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Mine opptak | Teateret",
  description: "Se dine kjøpte opptak",
}

async function getUserPurchasesWithRecordings() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      *,
      ensemble:ensembles(
        *,
        recordings(*)
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })

  return purchases || []
}

export default async function MyRecordingsPage() {
  const purchases = await getUserPurchasesWithRecordings()

  if (purchases === null) {
    redirect("/logg-inn?redirect=/mine-opptak")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="hovedinnhold" className="flex-1">
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container px-4">
            <h1 className="text-3xl font-bold md:text-4xl">Mine opptak</h1>
            <p className="mt-2 text-lg text-primary-foreground/80">Se dine kjøpte forestillingsopptak</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container px-4">
            {purchases.length === 0 ? (
              <div className="text-center py-16">
                <Film className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Ingen opptak ennå</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                  Du har ikke kjøpt noen opptak ennå. Utforsk vårt utvalg!
                </p>
                <Button asChild size="lg">
                  <Link href="/opptak">Se opptak</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {purchases.map((purchase) => {
                  const ensemble = purchase.ensemble
                  if (!ensemble) return null

                  const purchasedRecordingIds = purchase.recording_ids || []
                  const allRecordings = ensemble.recordings || []
                  const availableRecordings =
                    purchasedRecordingIds.length > 0
                      ? allRecordings.filter((r: { id: string }) => purchasedRecordingIds.includes(r.id))
                      : allRecordings

                  return (
                    <Card key={purchase.id} className="overflow-hidden">
                      <div className="md:flex">
                        <div className="md:w-1/3 aspect-video md:aspect-auto relative bg-muted">
                          {ensemble.thumbnail_url ? (
                            <Image
                              src={ensemble.thumbnail_url || "/placeholder.svg"}
                              alt={ensemble.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Film className="h-16 w-16 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-6 md:w-2/3">
                          <h2 className="text-2xl font-semibold mb-2">{ensemble.title}</h2>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            {ensemble.duration_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {ensemble.duration_minutes} min
                              </span>
                            )}
                            <Badge variant="secondary">{availableRecordings.length} opptak tilgjengelig</Badge>
                          </div>

                          <div className="space-y-3">
                            <h3 className="font-medium">Tilgjengelige opptak:</h3>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {availableRecordings.map(
                                (recording: {
                                  id: string
                                  team: string
                                  description: string
                                  quality: string
                                  recording_date: string
                                }) => (
                                  <Button
                                    key={recording.id}
                                    asChild
                                    variant="outline"
                                    className="justify-start h-auto py-3 bg-transparent"
                                  >
                                    <Link href={`/se/${recording.id}`}>
                                      <Play className="mr-2 h-4 w-4 flex-shrink-0" />
                                      <div className="text-left">
                                        <p className="font-medium">
                                          {recording.team === "yellow"
                                            ? ensemble.yellow_team_name || "Gult lag"
                                            : ensemble.blue_team_name || "Blått lag"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {recording.description || recording.quality}
                                          {recording.recording_date &&
                                            ` • ${new Date(recording.recording_date).toLocaleDateString("nb-NO")}`}
                                        </p>
                                      </div>
                                    </Link>
                                  </Button>
                                ),
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
