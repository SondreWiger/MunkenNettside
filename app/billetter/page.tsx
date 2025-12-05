import Link from "next/link"
import { redirect } from "next/navigation"
import { Calendar, MapPin, Ticket, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatDateTime, formatPrice } from "@/lib/utils/booking"
import { QRCodeDisplay } from "@/components/booking/qr-code-display"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Mine billetter | Teateret",
  description: "Se dine billetter og QR-koder",
}

async function getUserBookings() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      show:shows(
        *,
        ensemble:ensembles(*),
        venue:venues(*)
      )
    `)
    .eq("user_id", user.id)
    .order("booked_at", { ascending: false })

  return bookings || []
}

export default async function MyTicketsPage() {
  const bookings = await getUserBookings()

  if (bookings === null) {
    redirect("/logg-inn?redirect=/billetter")
  }

  const now = new Date()
  const upcomingBookings = bookings.filter((b) => new Date(b.show?.show_datetime) >= now && b.status === "confirmed")
  const pastBookings = bookings.filter((b) => new Date(b.show?.show_datetime) < now || b.status !== "confirmed")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Bekreftet</Badge>
      case "used":
        return <Badge variant="secondary">Brukt</Badge>
      case "cancelled":
        return <Badge variant="destructive">Avlyst</Badge>
      case "refunded":
        return <Badge variant="outline">Refundert</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="hovedinnhold" className="flex-1">
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container px-4">
            <h1 className="text-3xl font-bold md:text-4xl">Mine billetter</h1>
            <p className="mt-2 text-lg text-primary-foreground/80">Vis QR-koden ved inngangen</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container px-4">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <Ticket className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Ingen billetter ennå</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                  Du har ikke kjøpt noen billetter ennå. Utforsk våre forestillinger!
                </p>
                <Button asChild size="lg">
                  <Link href="/forestillinger">Se forestillinger</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Upcoming */}
                {upcomingBookings.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Kommende forestillinger</h2>
                    <div className="grid gap-6">
                      {upcomingBookings.map((booking) => {
                        const show = booking.show
                        const showTitle = show?.title || show?.ensemble?.title || "Forestilling"

                        return (
                          <Card key={booking.id} className="overflow-hidden">
                            <CardContent className="p-6">
                              <div className="flex flex-col lg:flex-row gap-6">
                                {/* QR Code */}
                                <div className="flex flex-col items-center lg:items-start">
                                  <QRCodeDisplay data={booking.qr_code_data} size={180} />
                                  <p className="text-sm text-muted-foreground mt-2 text-center">
                                    Ref: {booking.booking_reference}
                                  </p>
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <h3 className="text-xl font-bold">{showTitle}</h3>
                                      {getStatusBadge(booking.status)}
                                    </div>
                                  </div>

                                  <div className="space-y-2 text-muted-foreground mb-4">
                                    <p className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      {formatDateTime(show?.show_datetime)}
                                    </p>
                                    {show?.venue && (
                                      <p className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {show.venue.name}, {show.venue.city}
                                      </p>
                                    )}
                                    {show?.doors_open_time && (
                                      <p className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Dørene åpner: {formatDateTime(show.doors_open_time)}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">
                                      {booking.seat_ids?.length || 0} billett(er) -{" "}
                                      {formatPrice(booking.total_amount_nok)}
                                    </span>
                                    <Button asChild variant="outline">
                                      <Link href={`/bekreftelse/${booking.id}`}>Se detaljer</Link>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Past */}
                {pastBookings.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-muted-foreground">Tidligere forestillinger</h2>
                    <div className="grid gap-4">
                      {pastBookings.map((booking) => {
                        const show = booking.show
                        const showTitle = show?.title || show?.ensemble?.title || "Forestilling"

                        return (
                          <Card key={booking.id} className="opacity-75">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold">{showTitle}</h3>
                                  <p className="text-sm text-muted-foreground">{formatDateTime(show?.show_datetime)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  {getStatusBadge(booking.status)}
                                  <span className="text-sm text-muted-foreground">{booking.booking_reference}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
