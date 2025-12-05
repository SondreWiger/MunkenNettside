import Link from "next/link"
import { Film, Ticket, Users, MapPin, QrCode, Tag, Settings, TrendingUp, Calendar, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClearReservationsButtonWrapper } from "@/components/admin/clear-reservations-wrapper"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils/booking"

async function getAdminData() {
  const supabase = await getSupabaseServerClient()

  try {
    const { count: ensembleCount } = await supabase.from("ensembles").select("*", { count: "exact", head: true })
    const { count: showCount } = await supabase
      .from("shows")
      .select("*", { count: "exact", head: true })
      .in("status", ["scheduled", "on_sale"])
    const { count: bookingCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed")
    const { data: recentBookings } = await supabase
      .from("bookings")
      .select("total_amount_nok")
      .eq("status", "confirmed")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const monthlyRevenue = recentBookings?.reduce((sum, b) => sum + (b.total_amount_nok || 0), 0) || 0

    return {
      ensembleCount: ensembleCount || 0,
      showCount: showCount || 0,
      bookingCount: bookingCount || 0,
      monthlyRevenue,
    }
  } catch {
    return { ensembleCount: 0, showCount: 0, bookingCount: 0, monthlyRevenue: 0 }
  }
}

export default async function AdminDashboard() {
  const { ensembleCount, showCount, bookingCount, monthlyRevenue } = await getAdminData()

  const menuItems = [
    { name: "Ensembler", href: "/admin/ensembler", icon: Film, description: "Administrer produksjoner" },
    { name: "Forestillinger", href: "/admin/forestillinger", icon: Calendar, description: "Administrer show" },
    { name: "Billettskanner", href: "/admin/scan", icon: QrCode, description: "Skann QR-billetter" },
    { name: "Bestillinger", href: "/admin/bestillinger", icon: Ticket, description: "Se alle bestillinger" },
    { name: "Brukere", href: "/admin/brukere", icon: Users, description: "Administrer brukere" },
    { name: "Venues", href: "/admin/venues", icon: MapPin, description: "Administrer lokaler" },
    { name: "Rabattkoder", href: "/admin/rabattkoder", icon: Tag, description: "Administrer rabatter" },
    { name: "Innstillinger", href: "/admin/innstillinger", icon: Settings, description: "Nettstedinnstillinger" },
  ]

  return (
    <main className="container px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <ClearReservationsButtonWrapper />
          <Button asChild>
            <Link href="/admin/ensembler/ny">
              <Plus className="h-4 w-4 mr-2" />
              Nytt ensemble
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ensembler</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ensembleCount}</div>
            <p className="text-xs text-muted-foreground">Totalt antall produksjoner</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktive forestillinger</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{showCount}</div>
            <p className="text-xs text-muted-foreground">Kommende show</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktive billetter</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookingCount}</div>
            <p className="text-xs text-muted-foreground">Bekreftede bestillinger</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Månedlig omsetning</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPrice(monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">Siste 30 dager</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Hurtigmeny</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
