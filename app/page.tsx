import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Film, Ticket, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatDate, formatPrice } from "@/lib/utils/booking"

interface Ensemble {
  id: string
  title: string
  slug: string
  description?: string
  synopsis_short?: string
  thumbnail_url?: string
  genre?: string[]
  year?: number
  duration_minutes?: number
  director?: string
  recording_price_nok?: number
  yellow_team_name?: string
  blue_team_name?: string
}

interface Show {
  id: string
  title?: string
  show_datetime: string
  base_price_nok: number
  team?: string
  ensemble?: Ensemble
  venue?: {
    name: string
    city: string
  }
}

async function getHomePageData() {
  try {
    const supabase = await getSupabaseServerClient()

    const [featuredResult, showsResult, allResult] = await Promise.all([
      supabase
        .from("ensembles")
        .select("*")
        .eq("is_published", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("shows")
        .select(`
          *,
          ensemble:ensembles(*),
          venue:venues(*)
        `)
        .in("status", ["scheduled", "on_sale"])
        .gte("show_datetime", new Date().toISOString())
        .order("show_datetime", { ascending: true })
        .limit(4),
      supabase
        .from("ensembles")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6),
    ])

    return {
      featuredEnsembles: (featuredResult.data || []) as Ensemble[],
      upcomingShows: (showsResult.data || []) as Show[],
      allEnsembles: (allResult.data || []) as Ensemble[],
      dbConnected: true,
    }
  } catch (error) {
    console.error("Database error:", error)
    return {
      featuredEnsembles: [],
      upcomingShows: [],
      allEnsembles: [],
      dbConnected: false,
    }
  }
}

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const { featuredEnsembles, upcomingShows, allEnsembles, dbConnected } = await getHomePageData()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main id="hovedinnhold" className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
          <div className="container relative px-4 py-24 md:py-32 lg:py-40">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-balance">
                Velkommen til Teateret
              </h1>
              <p className="mt-6 text-xl md:text-2xl text-primary-foreground/90 leading-relaxed text-pretty">
                Opplev magien på scenen - eller hjemmefra med våre digitale opptak. Kvalitetsforestillinger for hele
                familien.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg">
                  <Link href="/forestillinger">
                    <Ticket className="mr-2 h-5 w-5" />
                    Se forestillinger
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/opptak">
                    <Film className="mr-2 h-5 w-5" />
                    Utforsk opptak
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Database Setup Notice */}
        {!dbConnected && (
          <section className="py-8 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800">
            <div className="container px-4">
              <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold">Database ikke satt opp</p>
                  <p className="text-sm">Kjør SQL-skriptene i scripts/-mappen for å opprette tabellene.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured Ensembles */}
        {featuredEnsembles.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold md:text-4xl">Fremhevede produksjoner</h2>
                  <p className="mt-2 text-lg text-muted-foreground">Våre mest populære forestillinger</p>
                </div>
                <Button asChild variant="ghost" className="hidden sm:flex">
                  <Link href="/opptak">
                    Se alle <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredEnsembles.map((ensemble) => (
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
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {ensemble.genre?.slice(0, 2).map((g: string) => (
                          <Badge key={g} variant="secondary">
                            {g}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-xl">{ensemble.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {ensemble.synopsis_short || ensemble.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-primary">
                        {formatPrice(ensemble.recording_price_nok ?? 0)}
                      </span>
                      <Button asChild>
                        <Link href={`/ensemble/${ensemble.slug}`}>Se mer</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Shows */}
        {upcomingShows.length > 0 && (
          <section className="py-16 md:py-24 bg-muted/50">
            <div className="container px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold md:text-4xl">Kommende forestillinger</h2>
                  <p className="mt-2 text-lg text-muted-foreground">Sikre deg billetter nå</p>
                </div>
                <Button asChild variant="ghost" className="hidden sm:flex">
                  <Link href="/forestillinger">
                    Se alle <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {upcomingShows.map((show) => (
                  <Card key={show.id} className="flex flex-col sm:flex-row overflow-hidden">
                    <div className="aspect-video sm:aspect-square sm:w-48 relative bg-muted shrink-0">
                      {show.ensemble?.thumbnail_url ? (
                        <Image
                          src={show.ensemble.thumbnail_url || "/placeholder.svg"}
                          alt={show.title || show.ensemble?.title || "Forestilling"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Ticket className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(show.show_datetime)}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{show.title || show.ensemble?.title}</h3>
                      {show.team && show.ensemble && (
                        <Badge variant="outline" className="w-fit mb-2">
                          {show.team === "yellow" ? show.ensemble.yellow_team_name : show.ensemble.blue_team_name}
                        </Badge>
                      )}
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {show.venue?.name}, {show.venue?.city}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-semibold">Fra {formatPrice(show.base_price_nok)}</span>
                        <Button asChild>
                          <Link href={`/bestill/${show.id}`}>Kjøp billetter</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Ensembles Grid */}
        {allEnsembles.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold md:text-4xl">Alle produksjoner</h2>
                  <p className="mt-2 text-lg text-muted-foreground">Utforsk hele repertoaret vårt</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allEnsembles.map((ensemble) => (
                  <Link key={ensemble.id} href={`/ensemble/${ensemble.slug}`} className="group block">
                    <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
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
                            <Film className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {ensemble.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {ensemble.year && <span>{ensemble.year}</span>}
                          {ensemble.duration_minutes && <span>{ensemble.duration_minutes} min</span>}
                          {ensemble.director && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {ensemble.director}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State - shows when no data available */}
        {allEnsembles.length === 0 && upcomingShows.length === 0 && (
          <section className="py-24">
            <div className="container px-4 text-center">
              <Film className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
              <h2 className="text-2xl font-bold mb-4">Velkommen til Teateret!</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                {dbConnected
                  ? "Vi jobber med å legge til nye produksjoner. Kom tilbake snart for å se vårt repertoar."
                  : "Databasen er ikke satt opp ennå. Kjør SQL-skriptene for å komme i gang."}
              </p>
              {!dbConnected && (
                <div className="bg-muted rounded-lg p-6 max-w-lg mx-auto text-left mb-8">
                  <p className="font-semibold mb-2">Slik setter du opp databasen:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      Åpne <code className="bg-background px-1 rounded">scripts/001-create-tables.sql</code>
                    </li>
                    <li>Kjør skriptet i Supabase</li>
                    <li>
                      Gjenta for <code className="bg-background px-1 rounded">002-rls-policies.sql</code>
                    </li>
                    <li>
                      Kjør <code className="bg-background px-1 rounded">003-seed-data.sql</code> for testdata
                    </li>
                  </ol>
                </div>
              )}
              <Button asChild size="lg">
                <Link href="/admin">Gå til Admin</Link>
              </Button>
            </div>
          </section>
        )}

        {/* Info Cards */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Enkel bestilling</h3>
                <p className="text-muted-foreground">
                  Velg dine seter og betal trygt. QR-billetter sendes direkte til e-posten din.
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Film className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Digitale opptak</h3>
                <p className="text-muted-foreground">
                  Kunne ikke komme? Se forestillingen hjemmefra med våre profesjonelle opptak.
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">To lag</h3>
                <p className="text-muted-foreground">
                  Hver produksjon har to unike besetninger. Opplev begge versjonene!
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
