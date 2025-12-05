import Link from "next/link"
import { Eye, Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils/booking"

async function getBookings() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      show:show_id (
        show_datetime,
        team,
        ensemble:ensemble_id (title)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.log("[v0] Bookings fetch error:", error.message)
    return []
  }
  return data || []
}

const statusLabels: Record<string, string> = {
  pending: "Venter",
  confirmed: "Bekreftet",
  checked_in: "Innsjekket",
  cancelled: "Kansellert",
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  checked_in: "secondary",
  cancelled: "destructive",
}

export default async function BookingsPage() {
  const bookings = await getBookings()

  return (
    <main className="container px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Bestillinger</h1>
          <p className="text-muted-foreground">{bookings.length} bestillinger totalt</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Eksporter
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Søk etter navn, e-post eller bestillingsnummer..." className="pl-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Ingen bestillinger ennå</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{booking.customer_name || "Ukjent kunde"}</CardTitle>
                    <CardDescription>
                      {booking.customer_email} • {booking.customer_phone || "Ingen telefon"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColors[booking.status] || "secondary"}>
                      {statusLabels[booking.status] || booking.status}
                    </Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/bestillinger/${booking.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Show: </span>
                    {booking.show?.ensemble?.title || "Ukjent"} ({booking.show?.team === "yellow" ? "Gult" : "Blått"})
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dato: </span>
                    {booking.show?.show_datetime
                      ? new Date(booking.show.show_datetime).toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Ukjent"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seter: </span>
                    {booking.seat_ids?.length || 0}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Totalt: </span>
                    <strong>{formatPrice(booking.total_amount_nok)}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
