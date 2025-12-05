import Link from "next/link"
import Image from "next/image"
import { Film, Play, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils/booking"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Digitale opptak | Teateret",
  description: "Se teaterforestillinger hjemmefra med våre profesjonelle opptak",
}

async function getEnsemblesWithRecordings() {
  const supabase = await getSupabaseServerClient()

  const { data: ensembles } = await supabase
    .from("ensembles")
    .select(`
      *,
      recordings(*)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  // Filter to only ensembles with recordings
  return (ensembles || []).filter((e) => e.recordings && e.recordings.length > 0)
}

export default async function RecordingsPage() {
  const ensembles = await getEnsemblesWithRecordings()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="hovedinnhold" className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container px-4">
            <h1 className="text-4xl font-bold md:text-5xl">Digitale opptak</h1>
            <p className="mt-4 text-xl text-primary-foreground/80">
              Opplev forestillingene hjemmefra med profesjonelle opptak
            </p>
          </div>
        </section>

        {/* Recordings Grid */}
        <section className="py-12">
          <div className="container px-4">
            {ensembles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ensembles.map((ensemble) => {
                  const yellowCount = ensemble.recordings.filter((r: { team: string }) => r.team === "yellow").length
                  const blueCount = ensemble.recordings.filter((r: { team: string }) => r.team === "blue").length

                  return (
                    <Card key={ensemble.id} className="overflow-hidden group">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {ensemble.thumbnail_url ? (
                          <Image
                            src={ensemble.thumbnail_url || "/placeholder.svg"}
                            alt={ensemble.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Film className="h-16 w-16 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-16 w-16 text-white" />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {ensemble.genre?.slice(0, 2).map((g: string) => (
                            <Badge key={g} variant="secondary" className="text-xs">
                              {g}
                            </Badge>
                          ))}
                        </div>
                        <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {ensemble.title}
                        </h2>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {ensemble.synopsis_short || ensemble.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          {ensemble.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {ensemble.duration_minutes} min
                            </span>
                          )}
                          {ensemble.director && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {ensemble.director}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          {yellowCount > 0 && <Badge variant="outline">{ensemble.yellow_team_name}</Badge>}
                          {blueCount > 0 && <Badge variant="outline">{ensemble.blue_team_name}</Badge>}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(ensemble.recording_price_nok)}
                        </span>
                        <Button asChild>
                          <Link href={`/ensemble/${ensemble.slug}`}>Se mer</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Film className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Ingen opptak tilgjengelig</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                  Vi jobber med å legge til nye opptak. Kom tilbake snart!
                </p>
                <Button asChild size="lg">
                  <Link href="/forestillinger">Se forestillinger</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
