import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Mangler booking ID" }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Ikke autorisert" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Ikke autorisert" }, { status: 403 })
    }

    // Update booking
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "used",
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.id,
      })
      .eq("id", bookingId)

    if (error) {
      return NextResponse.json({ success: false, error: "Kunne ikke oppdatere bestilling" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Check-in error:", error)
    return NextResponse.json({ success: false, error: "Intern serverfeil" }, { status: 500 })
  }
}
