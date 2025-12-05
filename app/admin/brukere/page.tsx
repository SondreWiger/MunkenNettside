import { Users, Shield, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getSupabaseServerClient } from "@/lib/supabase/server"

async function getUsers() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false }).limit(100)

  if (error) return []
  return data || []
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <main className="container px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Brukere</h1>
          <p className="text-muted-foreground">{users.length} registrerte brukere</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Søk etter navn eller e-post..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Ingen brukere ennå</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.role === "admin" ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <Users className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.full_name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "Kunde"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Rediger
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Registrert: {new Date(user.created_at).toLocaleDateString("nb-NO")}</span>
                  {user.phone && <span>Telefon: {user.phone}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
