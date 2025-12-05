import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const showId = url.searchParams.get("showId")
    if (!showId) {
      return NextResponse.json({ error: "Missing showId" }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()
    const { data, error } = await supabase.from("seats").select("*").eq("show_id", showId)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count: data?.length || 0, seats: data })
  } catch (err) {
    console.error("[v0] Debug seats error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
