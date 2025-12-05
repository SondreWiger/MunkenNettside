import Link from "next/link"
import { Plus, Edit, Tag, Percent, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSupabaseServerClient } from "@/lib/supabase/server"

async function getDiscountCodes() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("discount_codes").select("*").order("created_at", { ascending: false })

  if (error) return []
  return data || []
}

export default async function DiscountCodesPage() {
  const codes = await getDiscountCodes()

  return (
    <main className="container px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Rabattkoder</h1>
          <p className="text-muted-foreground">Administrer rabattkoder og tilbud</p>
        </div>
        <Button asChild>
          <Link href="/admin/rabattkoder/ny">
            <Plus className="h-4 w-4 mr-2" />
            Ny rabattkode
          </Link>
        </Button>
      </div>

      {codes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Ingen rabattkoder ennå</p>
            <Button asChild>
              <Link href="/admin/rabattkoder/ny">
                <Plus className="h-4 w-4 mr-2" />
                Opprett første rabattkode
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {codes.map((code) => {
            const isActive =
              (!code.valid_from || new Date(code.valid_from) <= new Date()) &&
              (!code.valid_until || new Date(code.valid_until) >= new Date()) &&
              (!code.max_uses || code.current_uses < code.max_uses)

            return (
              <Card key={code.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-mono">{code.code}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Percent className="h-4 w-4" />
                        {code.type === "percentage" ? `${code.value}% rabatt` : `${code.value} kr rabatt`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Aktiv" : "Inaktiv"}</Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/rabattkoder/${code.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      Brukt: {code.current_uses} / {code.max_uses || "∞"}
                    </span>
                    {code.valid_until && <span>Utløper: {new Date(code.valid_until).toLocaleDateString("nb-NO")}</span>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
