import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const recordingId = searchParams.get("recordingId")
  const token = searchParams.get("token")

  if (!recordingId || !token) {
    return NextResponse.json({ error: "Mangler parametere" }, { status: 400 })
  }

  const supabase = await getSupabaseAdminClient()

  // Verify the access token
  const { data: tokenData, error: tokenError } = await supabase
    .from("video_access_tokens")
    .select("*")
    .eq("token", token)
    .eq("recording_id", recordingId)
    .eq("revoked", false)
    .single()

  if (tokenError || !tokenData) {
    console.error("[v0] Invalid token:", tokenError?.message)
    return NextResponse.json({ error: "Ugyldig eller utløpt tilgangstoken" }, { status: 403 })
  }

  // Check if token has expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return NextResponse.json({ error: "Tilgangstoken har utløpt" }, { status: 403 })
  }

  // Get the recording's Jottacloud URL
  const { data: recording, error: recordingError } = await supabase
    .from("recordings")
    .select("jottacloud_embed_url")
    .eq("id", recordingId)
    .single()

  if (recordingError || !recording) {
    return NextResponse.json({ error: "Opptak ikke funnet" }, { status: 404 })
  }

  if (!recording.jottacloud_embed_url) {
    return NextResponse.json({ error: "Ingen video tilgjengelig for dette opptaket" }, { status: 404 })
  }

  // Return the embed URL
  // In production, you might want to proxy the video or use signed URLs
  return NextResponse.json({
    url: recording.jottacloud_embed_url,
    expiresAt: tokenData.expires_at,
  })
}
