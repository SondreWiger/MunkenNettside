"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, User, Ticket, Film, Home, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navigation = [
  { name: "Hjem", href: "/", icon: Home },
  { name: "Forestillinger", href: "/forestillinger", icon: Ticket },
  { name: "Opptak", href: "/opptak", icon: Film },
]

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase.from("users").select("role").eq("id", user.id).single()
        setIsAdmin(data?.role === "admin")
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <a href="#hovedinnhold" className="skip-link">
        Hopp til hovedinnhold
      </a>
      <nav className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-primary"
          aria-label="Teateret - Gå til forsiden"
        >
          <span className="text-2xl" role="img" aria-hidden="true">
            🎭
          </span>
          <span>Teateret</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground focus:text-foreground"
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                  <User className="h-5 w-5" aria-hidden="true" />
                  <span className="hidden sm:inline">Min konto</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/min-side" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Min side
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billetter" className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Mine billetter
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 font-medium">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Logg ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="lg" className="gap-2">
              <Link href="/logg-inn">
                <LogIn className="h-5 w-5" aria-hidden="true" />
                <span>Logg inn</span>
              </Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Åpne meny">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="text-left">Meny</SheetTitle>
              <nav className="mt-8 flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-colors hover:bg-muted"
                  >
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
