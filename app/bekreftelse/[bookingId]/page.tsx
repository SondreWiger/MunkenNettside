import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Calendar, MapPin, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server"
import { formatDateTime, formatPrice } from "@/lib/utils/booking"
import { QRCodeDisplay } from "@/components/booking/qr-code-display"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ bookingId: string }>
}

async function getBooking(bookingId: string) {
  // Use admin client so guests can view their confirmation pages
  const supabase = await getSupabaseAdminClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      show:shows(
        *,
        ensemble:ensembles(*),
        venue:venues(*)
      )
    `)
    .eq("id", bookingId)
    .single()

  if (!booking) return null

  const { data: seats } = await supabase.from("seats").select("*").in("id", booking.seat_ids)

  return { booking, seats: seats || [] }
}

export async function generateMetadata({ params }: PageProps) {
  const { bookingId } = await params
  const data = await getBooking(bookingId)

  if (!data) {
    return { title: "Bestilling ikke funnet | Teateret" }
  }

  return {
    title: `Bekreftelse - ${data.booking.booking_reference} | Teateret`,
    description: "Din billettbestilling er bekreftet",
  }
}

export default async function ConfirmationPage({ params }: PageProps) {
  const { bookingId } = await params
  const data = await getBooking(bookingId)

  if (!data) {
    notFound()
  }

  const { booking, seats } = data

  // Verify user owns this booking using server client (has session context)
  const serverClient = await getSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()

  if (!user || user.id !== booking.user_id) {
    notFound()
  }
  const show = booking.show
  const showTitle = show?.title || show?.ensemble?.title || "Forestilling"

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="hovedinnhold" className="flex-1">
        <div className="container px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Takk for din bestilling!</h1>
              <p className="text-lg text-muted-foreground">Billetten er sendt til {booking.customer_email}</p>
            </div>

            {/* Booking Reference */}
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Bestillingsreferanse</p>
                <p className="text-3xl font-mono font-bold text-primary">{booking.booking_reference}</p>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <QrCode className="h-8 w-8 text-primary mb-4" />
                  <h2 className="text-xl font-semibold mb-4">Din billett</h2>
                  <QRCodeDisplay data={booking.qr_code_data} />
                  <p className="text-sm text-muted-foreground mt-4 text-center">Vis denne QR-koden ved inngangen</p>
                </div>
              </CardContent>
            </Card>

            {/* Show Details */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{showTitle}</h2>

                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {formatDateTime(show?.show_datetime)}
                  </p>
                  {show?.venue && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {show.venue.name}, {show.venue.address}, {show.venue.city}
                    </p>
                  )}
                </div>

                <div className="border-t mt-4 pt-4">
                  <h3 className="font-medium mb-2">Seter</h3>
                  <div className="grid gap-2">
                    {seats.map((seat) => (
                      <div key={seat.id} className="flex justify-between p-2 bg-muted rounded">
                        <span>
                          {seat.section}, Rad {seat.row}, Sete {seat.number}
                        </span>
                        <span className="font-medium">{formatPrice(seat.price_nok)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Totalt betalt</span>
                    <span className="text-primary">{formatPrice(booking.total_amount_nok)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="flex-1 h-12">
                <Link href="/billetter">
                  <QrCode className="mr-2 h-5 w-5" />
                  Mine billetter
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 h-12 bg-transparent">
                <Link href="/">Tilbake til forsiden</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
