import { redirect, notFound } from "next/navigation"
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

async function verifyAccess(userId: string, recordingId: string) {
  const supabase = await getSupabaseAdminClient()

  // Get recording and its ensemble
  const { data: recording, error: recordingError } = await supabase
    .from("recordings")
    .select("*, ensemble:ensembles(*)")
    .eq("id", recordingId)
    .single()

  if (recordingError || !recording) {
    return { hasAccess: false, recording: null }
  }

  // Check if user has purchased access
  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("ensemble_id", recording.ensemble_id)
    .eq("status", "completed")
    .single()

  if (!purchase) {
    return { hasAccess: false, recording }
  }

  // Check if access has expired
  if (purchase.access_expires_at && new Date(purchase.access_expires_at) < new Date()) {
    return { hasAccess: false, recording }
  }

  return { hasAccess: true, recording }
}

export default async function WatchRecordingPage({
  params,
}: {
  params: Promise<{ recordingId: string }>
}) {
  const { recordingId } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/logg-inn?redirect=/se/${recordingId}`)
  }

  const { hasAccess, recording } = await verifyAccess(user.id, recordingId)

  if (!recording) {
    notFound()
  }

  if (!hasAccess) {
    redirect(`/ensemble/${recording.ensemble?.slug || recording.ensemble_id}?buy=true`)
  }

  // Check if video has a URL
  const videoUrl = (recording as any).jottacloud_embed_url
  if (!videoUrl) {
    notFound()
  }

  // Redirect to external video link
  redirect(videoUrl)
}
