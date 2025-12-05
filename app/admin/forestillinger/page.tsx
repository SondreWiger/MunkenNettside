import Link from "next/link"
import { Plus, Edit, Eye, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils/booking"

async function getShows() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("shows")
    .select(`
      *,
      ensemble:ensemble_id (title, slug),
      venue:venue_id (name)
    `)
    .order("show_datetime", { ascending: true })

  if (error) {
    console.log("[v0] Shows fetch error:", error.message)
    return []
  }
  return data || []
}

const statusLabels: Record<string, string> = {
  draft: "Kladd",
  scheduled: "Planlagt",
  on_sale: "I salg",
  sold_out: "Utsolgt",
  completed: "Fullført",
  cancelled: "Kansellert",
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  scheduled: "outline",
  on_sale: "default",
  sold_out: "destructive",
  completed: "secondary",
  cancelled: "destructive",
}

export default async function ShowsPage() {
  const shows = await getShows()

  return (
    <main className="container px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Forestillinger</h1>
          <p className="text-muted-foreground">Administrer forestillinger og billettsalg</p>
        </div>
        <Button asChild>
          <Link href="/admin/forestillinger/ny">
            <Plus className="h-4 w-4 mr-2" />
            Ny forestilling
          </Link>
        </Button>
      </div>

      {shows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Ingen forestillinger ennå</p>
            <Button asChild>
              <Link href="/admin/forestillinger/ny">
                <Plus className="h-4 w-4 mr-2" />
                Opprett første forestilling
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {shows.map((show) => (
            <Card key={show.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {show.ensemble?.title || show.title || "Ukjent"} -{" "}
                      {show.team === "yellow" ? "Gult lag" : "Blått lag"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(show.show_datetime).toLocaleDateString("nb-NO", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {show.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {show.venue.name}
                        </span>
                      )}
                    </CardDescription>
                    <div className="flex gap-2 mt-3">
                      <Badge variant={statusColors[show.status] || "secondary"}>
                        {statusLabels[show.status] || show.status}
                      </Badge>
                      <Badge variant="outline">{formatPrice(show.base_price_nok)}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/bestill/${show.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/forestillinger/${show.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
