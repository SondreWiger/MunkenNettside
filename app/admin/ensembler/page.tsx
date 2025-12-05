import Link from "next/link"
import { Plus, Edit, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

async function getEnsembles() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("ensembles")
    .select("*, recordings(count)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Ensembles fetch error:", error.message)
    return []
  }
  return data || []
}

export default async function EnsemblesPage() {
  const ensembles = await getEnsembles()

  return (
    <main className="container px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Ensembler</h1>
          <p className="text-muted-foreground">Administrer teaterensembler og produksjoner</p>
        </div>
        <Button asChild>
          <Link href="/admin/ensembler/ny">
            <Plus className="h-4 w-4 mr-2" />
            Nytt ensemble
          </Link>
        </Button>
      </div>

      {ensembles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Ingen ensembler ennå</p>
            <Button asChild>
              <Link href="/admin/ensembler/ny">
                <Plus className="h-4 w-4 mr-2" />
                Opprett første ensemble
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ensembles.map((ensemble) => (
            <Card key={ensemble.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {ensemble.thumbnail_url && (
                      <img
                        src={ensemble.thumbnail_url || "/placeholder.svg"}
                        alt={ensemble.title}
                        className="w-24 h-36 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <CardTitle className="text-xl">{ensemble.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {ensemble.year} • {Array.isArray(ensemble.genre) ? ensemble.genre.join(", ") : ensemble.genre}
                      </CardDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={ensemble.is_published ? "default" : "secondary"}>
                          {ensemble.is_published ? "Publisert" : "Kladd"}
                        </Badge>
                        <Badge variant="outline">{ensemble.recordings?.[0]?.count || 0} opptak</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/ensemble/${ensemble.slug}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/ensembler/${ensemble.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                      <Trash2 className="h-4 w-4" />
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
