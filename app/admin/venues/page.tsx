import Link from "next/link"
import { Plus, Edit, MapPin, Armchair } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseServerClient } from "@/lib/supabase/server"

async function getVenues() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("venues").select("*").order("name")

  if (error) return []
  return data || []
}

export default async function VenuesPage() {
  const venues = await getVenues()

  return (
    <main className="container px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Venues</h1>
          <p className="text-muted-foreground">Administrer lokaler og setekartet</p>
        </div>
        <Button asChild>
          <Link href="/admin/venues/ny">
            <Plus className="h-4 w-4 mr-2" />
            Nytt lokale
          </Link>
        </Button>
      </div>

      {venues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Ingen lokaler ennå</p>
            <Button asChild>
              <Link href="/admin/venues/ny">
                <Plus className="h-4 w-4 mr-2" />
                Opprett første lokale
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Card key={venue.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {venue.name}
                </CardTitle>
                {venue.address && <CardDescription>{venue.address}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Armchair className="h-4 w-4" />
                    <span>{venue.capacity} seter</span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/venues/${venue.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Rediger
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
