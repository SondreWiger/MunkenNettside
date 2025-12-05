import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, Film, Play, Ticket, Users, Star, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatDate, formatPrice } from "@/lib/utils/booking"
import type { Ensemble, Recording, Show, CastMember } from "@/lib/types"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getEnsembleData(slug: string) {
  const supabase = await getSupabaseServerClient()

  const { data: ensemble } = await supabase
    .from("ensembles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!ensemble) return null

  const { data: recordings } = await supabase.from("recordings").select("*").eq("ensemble_id", ensemble.id)

  const { data: shows } = await supabase
    .from("shows")
    .select(`
      *,
      venue:venues(*)
    `)
    .eq("ensemble_id", ensemble.id)
    .in("status", ["scheduled", "on_sale"])
    .gte("show_datetime", new Date().toISOString())
    .order("show_datetime", { ascending: true })

  // Increment view count
  await supabase
    .from("ensembles")
    .update({ view_count: (ensemble.view_count || 0) + 1 })
    .eq("id", ensemble.id)

  return {
    ensemble: ensemble as Ensemble,
    recordings: (recordings || []) as Recording[],
    shows: (shows || []) as Show[],
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const data = await getEnsembleData(slug)

  if (!data) {
    return { title: "Ikke funnet | Teateret" }
  }

  return {
    title: `${data.ensemble.title} | Teateret`,
    description: data.ensemble.synopsis_short || data.ensemble.description,
  }
}

function CastGrid({ cast, title }: { cast: CastMember[]; title: string }) {
  if (!cast || cast.length === 0) return null

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cast.map((member, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className="w-20 h-20 rounded-full bg-muted shrink-0 overflow-hidden">
                {member.photo_url ? (
                  <Image
                    src={member.photo_url || "/placeholder.svg"}
                    alt={member.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default async function EnsemblePage({ params }: PageProps) {
  const { slug } = await params
  const data = await getEnsembleData(slug)

  if (!data) {
    notFound()
  }

  const { ensemble, recordings, shows } = data
  const yellowRecordings = recordings.filter((r) => r.team === "yellow")
  const blueRecordings = recordings.filter((r) => r.team === "blue")
  const hasRecordings = recordings.length > 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="hovedinnhold" className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground">
          <div className="absolute inset-0">
            {ensemble.banner_url ? (
              <Image
                src={ensemble.banner_url || "/placeholder.svg"}
                alt=""
                fill
                className="object-cover opacity-30"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
            )}
          </div>
          <div className="container relative px-4 py-16 md:py-24">
            <div className="max-w-3xl">
              {ensemble.genre && ensemble.genre.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {ensemble.genre.map((g) => (
                    <Badge key={g} variant="secondary" className="text-sm">
                      {g}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl text-balance">{ensemble.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mt-6 text-lg text-primary-foreground/80">
                {ensemble.year && <span>{ensemble.year}</span>}
                {ensemble.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {ensemble.duration_minutes} min
                  </span>
                )}
                {ensemble.age_rating && (
                  <Badge variant="outline" className="border-primary-foreground/30">
                    {ensemble.age_rating}
                  </Badge>
                )}
                {ensemble.director && <span>Regi: {ensemble.director}</span>}
              </div>

              {ensemble.synopsis_short && (
                <p className="mt-6 text-xl text-primary-foreground/90 leading-relaxed">{ensemble.synopsis_short}</p>
              )}
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="border-b bg-card">
          <div className="container px-4 py-8">
            <div className="flex flex-wrap gap-4">
              {hasRecordings && (
                <>
                  {yellowRecordings.length > 0 && (
                    <Button asChild size="lg" className="h-14 px-8 text-lg">
                      <Link href={`/kasse?ensemble=${ensemble.id}&team=yellow`}>
                        <Play className="mr-2 h-5 w-5" />
                        Kjøp opptak - {ensemble.yellow_team_name}
                      </Link>
                    </Button>
                  )}
                  {blueRecordings.length > 0 && (
                    <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent">
                      <Link href={`/kasse?ensemble=${ensemble.id}&team=blue`}>
                        <Play className="mr-2 h-5 w-5" />
                        Kjøp opptak - {ensemble.blue_team_name}
                      </Link>
                    </Button>
                  )}
                  {yellowRecordings.length > 0 && blueRecordings.length > 0 && (
                    <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg">
                      <Link href={`/kasse?ensemble=${ensemble.id}&team=both`}>
                        <Film className="mr-2 h-5 w-5" />
                        Kjøp begge lag (spar 20%)
                      </Link>
                    </Button>
                  )}
                </>
              )}
              {shows.length > 0 && (
                <Button asChild size="lg" variant={hasRecordings ? "outline" : "default"} className="h-14 px-8 text-lg">
                  <Link href="#forestillinger">
                    <Ticket className="mr-2 h-5 w-5" />
                    Se forestillinger ({shows.length})
                  </Link>
                </Button>
              )}
            </div>

            {hasRecordings && (
              <p className="mt-4 text-lg font-semibold text-primary">
                Opptak fra {formatPrice(ensemble.recording_price_nok)} per lag
              </p>
            )}
          </div>
        </section>

        {/* Main Content */}
        <div className="container px-4 py-12">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Synopsis */}
              {ensemble.synopsis_long && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Om forestillingen</h2>
                  <div className="prose prose-lg max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap">{ensemble.synopsis_long}</p>
                  </div>
                </section>
              )}

              {/* Trailer */}
              {ensemble.trailer_url && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Trailer</h2>
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe src={ensemble.trailer_url} title="Trailer" className="w-full h-full" allowFullScreen />
                  </div>
                </section>
              )}

              {/* Cast Tabs */}
              {(ensemble.yellow_cast?.length > 0 || ensemble.blue_cast?.length > 0) && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Rollebesetning</h2>
                  <Tabs defaultValue="yellow" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-14">
                      <TabsTrigger value="yellow" className="text-base h-12">
                        {ensemble.yellow_team_name}
                      </TabsTrigger>
                      <TabsTrigger value="blue" className="text-base h-12">
                        {ensemble.blue_team_name}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="yellow" className="mt-6">
                      <CastGrid cast={ensemble.yellow_cast} title="" />
                    </TabsContent>
                    <TabsContent value="blue" className="mt-6">
                      <CastGrid cast={ensemble.blue_cast} title="" />
                    </TabsContent>
                  </Tabs>
                </section>
              )}

              {/* Crew */}
              {ensemble.crew && ensemble.crew.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Bak scenen</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ensemble.crew.map((member, index) => (
                      <div key={index} className="flex justify-between p-3 rounded-lg bg-muted">
                        <span className="font-medium">{member.role}</span>
                        <span className="text-muted-foreground">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Press Quotes */}
              {ensemble.press_quotes && ensemble.press_quotes.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Presseomtaler</h2>
                  <div className="grid gap-4">
                    {ensemble.press_quotes.map((quote, index) => (
                      <Card key={index} className="p-6">
                        <Quote className="h-8 w-8 text-primary/50 mb-4" />
                        <blockquote className="text-lg italic mb-4">&ldquo;{quote.quote}&rdquo;</blockquote>
                        <cite className="text-muted-foreground not-italic">— {quote.source}</cite>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Awards */}
              {ensemble.awards && ensemble.awards.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Priser og utmerkelser</h2>
                  <div className="flex flex-wrap gap-3">
                    {ensemble.awards.map((award, index) => (
                      <Badge key={index} variant="secondary" className="text-base py-2 px-4">
                        <Star className="h-4 w-4 mr-2" />
                        {award.name} ({award.year})
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Gallery */}
              {ensemble.gallery_images && ensemble.gallery_images.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Galleri</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ensemble.gallery_images.map((image, index) => (
                      <div key={index} className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Bilde ${index + 1} fra ${ensemble.title}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Shows & Info */}
            <div className="space-y-8">
              {/* Upcoming Shows */}
              {shows.length > 0 && (
                <Card id="forestillinger">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Kommende forestillinger</h3>
                    <div className="space-y-4">
                      {shows.map((show) => (
                        <div key={show.id} className="p-4 rounded-lg bg-muted">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(show.show_datetime)}
                          </div>
                          {show.team && (
                            <Badge variant="outline" className="mb-2">
                              {show.team === "yellow" ? ensemble.yellow_team_name : ensemble.blue_team_name}
                            </Badge>
                          )}
                          <p className="text-sm text-muted-foreground mb-3">{show.venue?.name}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Fra {formatPrice(show.base_price_nok)}</span>
                            <Button asChild size="sm">
                              <Link href={`/bestill/${show.id}`}>Kjøp</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recording Info */}
              {hasRecordings && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Digitale opptak</h3>
                    <div className="space-y-4">
                      {yellowRecordings.length > 0 && (
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="font-semibold mb-1">{ensemble.yellow_team_name}</p>
                          <p className="text-sm text-muted-foreground mb-3">
                            {yellowRecordings.length} opptak tilgjengelig
                          </p>
                          <Button asChild size="sm" className="w-full">
                            <Link href={`/kasse?ensemble=${ensemble.id}&team=yellow`}>
                              Kjøp - {formatPrice(ensemble.recording_price_nok)}
                            </Link>
                          </Button>
                        </div>
                      )}
                      {blueRecordings.length > 0 && (
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="font-semibold mb-1">{ensemble.blue_team_name}</p>
                          <p className="text-sm text-muted-foreground mb-3">
                            {blueRecordings.length} opptak tilgjengelig
                          </p>
                          <Button asChild size="sm" variant="outline" className="w-full bg-transparent">
                            <Link href={`/kasse?ensemble=${ensemble.id}&team=blue`}>
                              Kjøp - {formatPrice(ensemble.recording_price_nok)}
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Informasjon</h3>
                  <dl className="space-y-3">
                    {ensemble.language && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Språk</dt>
                        <dd className="font-medium">{ensemble.language}</dd>
                      </div>
                    )}
                    {ensemble.duration_minutes && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Varighet</dt>
                        <dd className="font-medium">{ensemble.duration_minutes} minutter</dd>
                      </div>
                    )}
                    {ensemble.premiere_date && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Premiere</dt>
                        <dd className="font-medium">{formatDate(ensemble.premiere_date)}</dd>
                      </div>
                    )}
                    {ensemble.age_rating && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Aldersgrense</dt>
                        <dd className="font-medium">{ensemble.age_rating}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
