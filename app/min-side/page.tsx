import { redirect } from "next/navigation"
import Link from "next/link"
import { User, Ticket, Film, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Min side | Teateret",
  description: "Administrer din konto og se dine kjøp",
}

async function getUserData() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  const { data: purchases } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "confirmed")

  return {
    profile,
    purchaseCount: purchases?.length || 0,
    bookingCount: bookings?.length || 0,
  }
}

export default async function MyAccountPage() {
  const data = await getUserData()

  if (!data) {
    redirect("/logg-inn?redirect=/min-side")
  }

  const { profile, purchaseCount, bookingCount } = data

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="hovedinnhold" className="flex-1">
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container px-4">
            <h1 className="text-3xl font-bold md:text-4xl">Hei, {profile?.full_name || "bruker"}!</h1>
            <p className="mt-2 text-lg text-primary-foreground/80">Velkommen til din personlige side</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Tickets */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Ticket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Mine billetter</CardTitle>
                      <CardDescription>{bookingCount} aktive billetter</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/billetter">Se billetter</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recordings */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Film className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Mine opptak</CardTitle>
                      <CardDescription>{purchaseCount} kjøpte opptak</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/mine-opptak">Se opptak</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Profile */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Min profil</CardTitle>
                      <CardDescription>Oppdater kontaktinfo</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/min-side/profil">Rediger profil</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Purchase History */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Kjøpshistorikk</CardTitle>
                      <CardDescription>Se alle transaksjoner</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/min-side/kjop">Se historikk</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
