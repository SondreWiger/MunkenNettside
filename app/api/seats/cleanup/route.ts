import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseAdminClient()
    const now = new Date().toISOString()

    // Clear expired reservations
    const { error: expiredError } = await supabase
      .from("seats")
      .update({ status: "available", reserved_until: null })
      .lt("reserved_until", now)
      .eq("status", "reserved")

    // Also clear seats with null reserved_until but status reserved (cleanup)
    const { error: nullReservedError } = await supabase
      .from("seats")
      .update({ status: "available", reserved_until: null })
      .is("reserved_until", null)
      .eq("status", "reserved")

    if (expiredError || nullReservedError) {
      console.error("[v0] Seats cleanup error:", { expiredError, nullReservedError })
      return NextResponse.json({ success: false, error: "Kunne ikke rense setereservasjoner" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Seats cleanup error:", err)
    return NextResponse.json({ success: false, error: "Intern serverfeil" }, { status: 500 })
  }
}
