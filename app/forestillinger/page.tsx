import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatDate, formatTime, formatPrice } from "@/lib/utils/booking"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Forestillinger | Teateret",
  description: "Se alle kommende forestillinger og kjøp billetter",
}

async function getShows() {
  const supabase = await getSupabaseServerClient()

  const { data: shows } = await supabase
    .from("shows")
    .select(`
      *,
      ensemble:ensembles(*),
      venue:venues(*)
    `)
    .in("status", ["scheduled", "on_sale"])
    .gte("show_datetime", new Date().toISOString())
    .order("show_datetime", { ascending: true })

  return shows || []
}

export default async function ShowsPage() {
  const shows = await getShows()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="hovedinnhold" className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container px-4">
            <h1 className="text-4xl font-bold md:text-5xl">Forestillinger</h1>
            <p className="mt-4 text-xl text-primary-foreground/80">
              Finn og bestill billetter til kommende forestillinger
            </p>
          </div>
        </section>

        {/* Shows List */}
        <section className="py-12">
          <div className="container px-4">
            {shows.length > 0 ? (
              <div className="space-y-6">
                {shows.map((show) => (
                  <Card key={show.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="aspect-video md:aspect-square md:w-64 relative bg-muted shrink-0">
                        {show.ensemble?.thumbnail_url ? (
                          <Image
                            src={show.ensemble.thumbnail_url || "/placeholder.svg"}
                            alt={show.title || show.ensemble?.title || "Forestilling"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Ticket className="h-16 w-16 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <CardContent className="flex-1 p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex flex-wrap items-center gap-2 text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(show.show_datetime)}
                            </span>
                            <span className="text-primary font-medium">kl. {formatTime(show.show_datetime)}</span>
                          </div>

                          <h2 className="text-2xl font-bold mb-2">{show.title || show.ensemble?.title}</h2>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {show.team && show.ensemble && (
                              <Badge variant="secondary">
                                {show.team === "yellow" ? show.ensemble.yellow_team_name : show.ensemble.blue_team_name}
                              </Badge>
                            )}
                            {show.status === "sold_out" && <Badge variant="destructive">Utsolgt</Badge>}
                          </div>

                          {show.venue && (
                            <p className="flex items-center gap-2 text-muted-foreground mb-4">
                              <MapPin className="h-4 w-4" />
                              {show.venue.name}, {show.venue.city}
                            </p>
                          )}

                          <div className="mt-auto flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-primary">
                                Fra {formatPrice(show.base_price_nok)}
                              </span>
                              {show.available_seats > 0 && (
                                <p className="text-sm text-muted-foreground">{show.available_seats} plasser ledige</p>
                              )}
                            </div>
                            <Button asChild size="lg" disabled={show.status === "sold_out"}>
                              <Link href={`/bestill/${show.id}`}>
                                {show.status === "sold_out" ? "Utsolgt" : "Kjøp billetter"}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Ticket className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Ingen kommende forestillinger</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                  Vi jobber med å planlegge nye forestillinger. Kom tilbake snart!
                </p>
                <Button asChild size="lg">
                  <Link href="/opptak">Se digitale opptak</Link>
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
