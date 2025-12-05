import { notFound, redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SeatSelector } from "@/components/booking/seat-selector"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ showId: string }>
}

async function getShowData(showId: string) {
  const supabase = await getSupabaseServerClient()

  const { data: show } = await supabase
    .from("shows")
    .select(`
      *,
      ensemble:ensembles(*),
      venue:venues(*)
    `)
    .eq("id", showId)
    .single()

  if (!show) return null

  // Get or create seats for this show
  let { data: seats } = await supabase.from("seats").select("*").eq("show_id", showId)

  if (!seats || seats.length === 0) {
    const seatMapConfig = show.venue?.seat_map_config

    if (seatMapConfig) {
      const seatsToCreate: Array<{
        show_id: string
        section: string
        row: string
        number: number
        price_nok: number
        status: string
      }> = []

      // Check which format the seat_map_config uses
      if (seatMapConfig.sections) {
        // Format: { sections: [{ name, rows: [{ number, seats: [] }] }] }
        for (const section of seatMapConfig.sections) {
          for (const row of section.rows) {
            for (const seatNum of row.seats) {
              seatsToCreate.push({
                show_id: showId,
                section: section.name,
                row: row.number,
                number: seatNum,
                price_nok: show.base_price_nok,
                status: "available",
              })
            }
          }
        }
      } else if (seatMapConfig.rows && seatMapConfig.seatsPerRow) {
        // Format: { rows: number, seatsPerRow: number }
        const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        for (let r = 0; r < seatMapConfig.rows; r++) {
          const rowLabel = rowLabels[r] || `R${r + 1}`
          for (let s = 1; s <= seatMapConfig.seatsPerRow; s++) {
            seatsToCreate.push({
              show_id: showId,
              section: "Hovedsal",
              row: rowLabel,
              number: s,
              price_nok: show.base_price_nok,
              status: "available",
            })
          }
        }
      }

      if (seatsToCreate.length > 0) {
        await supabase.from("seats").insert(seatsToCreate)
        const { data: newSeats } = await supabase.from("seats").select("*").eq("show_id", showId)
        seats = newSeats
      }
    }
  }

  return { show, seats: seats || [] }
}

export async function generateMetadata({ params }: PageProps) {
  const { showId } = await params
  const data = await getShowData(showId)

  if (!data) {
    return { title: "Forestilling ikke funnet | Teateret" }
  }

  const title = data.show.title || data.show.ensemble?.title || "Forestilling"
  return {
    title: `Bestill billetter - ${title} | Teateret`,
    description: `Velg seter og bestill billetter til ${title}`,
  }
}

export default async function BookingPage({ params }: PageProps) {
  const { showId } = await params
  const data = await getShowData(showId)

  if (!data) {
    notFound()
  }

  const { show, seats } = data

  // Check if show is available for booking
  if (show.status === "cancelled") {
    redirect("/forestillinger?message=cancelled")
  }

  if (show.status === "sold_out") {
    redirect("/forestillinger?message=soldout")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main id="hovedinnhold" className="flex-1">
        <SeatSelector show={show} seats={seats} />
      </main>

      <Footer />
    </div>
  )
}
