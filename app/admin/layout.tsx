import type React from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Film,
  Ticket,
  Users,
  MapPin,
  QrCode,
  Tag,
  Settings,
  Calendar,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseServerClient } from "@/lib/supabase/server"

async function checkAdmin() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { isAdmin: false, isLoggedIn: false }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  return { isAdmin: profile?.role === "admin", isLoggedIn: true }
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Ensembler", href: "/admin/ensembler", icon: Film },
  { name: "Forestillinger", href: "/admin/forestillinger", icon: Calendar },
  { name: "Bestillinger", href: "/admin/bestillinger", icon: Ticket },
  { name: "Brukere", href: "/admin/brukere", icon: Users },
  { name: "Venues", href: "/admin/venues", icon: MapPin },
  { name: "Rabattkoder", href: "/admin/rabattkoder", icon: Tag },
  { name: "Billettskanner", href: "/admin/scan", icon: QrCode },
  { name: "Innstillinger", href: "/admin/innstillinger", icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoggedIn } = await checkAdmin()

  if (!isLoggedIn) {
    redirect("/logg-inn?redirect=/admin")
  }

  if (!isAdmin) {
    redirect("/?error=unauthorized")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
              <LayoutDashboard className="h-5 w-5" />
              Admin
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.slice(1, 5).map((item) => (
                <Button key={item.href} asChild variant="ghost" size="sm">
                  <Link href={item.href} className="flex items-center gap-1.5">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Tilbake
            </Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  )
}
