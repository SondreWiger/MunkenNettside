import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import type { Seat } from "@/lib/types"

type PartialSeat = {
  id: string
  status?: string
  reserved_until?: string | null
  row?: string
  number?: number
  section?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { seatIds, showId } = body

    console.log("[v0] Reserve seats request", { showId, seatIds })

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0 || !showId) {
      return NextResponse.json({ error: "Manglende seatIds eller showId" }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()
    const reservedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    // Debug: Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[v0] SUPABASE_SERVICE_ROLE_KEY not set - admin operations will fail")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    // First check current status of all seats
    const { data: currentSeats, error: checkError } = await supabase
      .from("seats")
      .select("id, status, reserved_until, row, number, section")
      .in("id", seatIds)
      .eq("show_id", showId)

    if (checkError) {
      console.error("[v0] Check seats error:", checkError)
      return NextResponse.json({ error: "Kunne ikke sjekke sete-status" }, { status: 500 })
    }

    if (!currentSeats || currentSeats.length !== seatIds.length) {
      console.warn("[v0] Seat count mismatch", { requested: seatIds.length, found: currentSeats?.length, currentSeats })
      return NextResponse.json({ error: "Noen av setene finnes ikke" }, { status: 400 })
    }

    console.log("[v0] Current seat states:", currentSeats.map(s => ({ id: s.id, status: s.status, reserved_until: s.reserved_until })))

    // Normalize and defensive-check seat statuses to avoid casing/null issues
    const now = Date.now()

    const expiredReservedIds: string[] = []

    const unavailableSeats = (currentSeats as PartialSeat[]).filter((s) => {
      // Normalize status values. If status is null/undefined, treat it as available
      const st = ((s.status as string) || "available").toString().toLowerCase()

      if (st === "available") return false

      if (st === "reserved") {
        // If reservation expired, consider it available and mark for cleanup
        const until = s.reserved_until ? new Date(s.reserved_until).getTime() : 0
        if (until && until > now) {
          return true // still reserved
        }

        // expired reservation - collect for cleanup and treat as available
        expiredReservedIds.push(s.id)
        return false
      }

      // sold/blocked or any other status -> unavailable
      return true
    })

    // Cleanup any expired reservations so they don't block users
    if (expiredReservedIds.length > 0) {
      console.log("[v0] Cleaning up expired reservations:", expiredReservedIds)
      try {
        await supabase.from("seats").update({ status: "available", reserved_until: null }).in("id", expiredReservedIds)
      } catch (e) {
        console.warn("[v0] Failed to cleanup expired reservations", { expiredReservedIds, error: e })
      }
    }
    console.log("[v0] Unavailable seats check:", { unavailableSeatIds: unavailableSeats.map(s => s.id), count: unavailableSeats.length })
    if (unavailableSeats.length > 0) {
      const seatList = unavailableSeats.map((s) => `Rad ${s.row}, Sete ${s.number}`).join(", ")
      console.log("[v0] Rejecting due to unavailable seats:", { seatList, ids: unavailableSeats.map(s => s.id) })
      return NextResponse.json(
        {
          error: `Følgende seter er ikke tilgjengelige: ${seatList}`,
          unavailableSeatIds: unavailableSeats.map((s) => s.id),
        },
        { status: 409 },
      )
    }


    // Reserve all seats (only those still available) - include show_id filter for safety
    const { data: updatedSeats, error: updateError } = await supabase
      .from("seats")
      .update({ status: "reserved", reserved_until: reservedUntil })
      .in("id", seatIds)
      .eq("show_id", showId)
      .eq("status", "available")
      .select("id")

    if (updateError) {
      console.error("[v0] Update seats error:", updateError)
      console.error("[v0] Update error details:", { code: updateError.code, message: updateError.message, details: (updateError as any).details })
      return NextResponse.json({ error: "Kunne ikke reservere setene", details: updateError.message }, { status: 500 })
    }

    // Check if all seats were reserved
    if (!updatedSeats || updatedSeats.length !== seatIds.length) {
      // Some seats were taken between check and update - rollback
      const reservedIds = (updatedSeats as { id: string }[])?.map((s) => s.id) || []
      console.log("[v0] Partial update detected", { requested: seatIds.length, updated: updatedSeats?.length, updatedIds: reservedIds })
      if (reservedIds.length > 0) {
        await supabase.from("seats").update({ status: "available", reserved_until: null }).in("id", reservedIds)
      }

      const failedCount = seatIds.length - (updatedSeats?.length || 0)
      return NextResponse.json({ error: `${failedCount} av setene ble nettopp tatt av noen andre` }, { status: 409 })
    }

    return NextResponse.json({
      success: true,
      reservedUntil,
  seatIds: (updatedSeats as { id: string }[]).map((s) => s.id),
    })
  } catch (error) {
    console.error("[v0] Reserve seats error:", error)
    return NextResponse.json({ error: "Intern serverfeil" }, { status: 500 })
  }
}
