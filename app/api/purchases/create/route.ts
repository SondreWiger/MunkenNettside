import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ensembleId, recordingIds, team, amount, discountCode } = body

    if (!ensembleId || !recordingIds || !amount) {
      return NextResponse.json({ error: "Manglende påkrevde felt" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Du må være logget inn" }, { status: 401 })
    }

    const adminSupabase = await getSupabaseAdminClient()

    // Check if user already has this purchase
    const { data: existingPurchase } = await adminSupabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("ensemble_id", ensembleId)
      .eq("status", "completed")
      .single()

    if (existingPurchase) {
      return NextResponse.json({ error: "Du har allerede kjøpt dette opptaket" }, { status: 400 })
    }

    // Verify and increment discount code usage if provided
    if (discountCode) {
      const { data: code, error: codeError } = await adminSupabase
        .from("discount_codes")
        .select("*")
        .eq("code", discountCode)
        .single()

      if (!codeError && code) {
        // Increment usage counter
        await adminSupabase
          .from("discount_codes")
          .update({ current_uses: (code.current_uses || 0) + 1 })
          .eq("id", code.id)
      }
    }

    // Create purchase (mock payment - directly completed)
    const { data: purchase, error: purchaseError } = await adminSupabase
      .from("purchases")
      .insert({
        user_id: user.id,
        ensemble_id: ensembleId,
        recording_ids: recordingIds,
        amount_paid_nok: amount,
        status: "completed",
        access_granted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (purchaseError) {
      console.error("[v0] Purchase error:", purchaseError)
      return NextResponse.json({ error: "Kunne ikke opprette kjøp: " + purchaseError.message }, { status: 500 })
    }

    // Update discount code used if provided (try to update, won't fail if column doesn't exist)
    if (discountCode) {
      try {
        await adminSupabase
          .from("purchases")
          .update({ discount_code_used: discountCode })
          .eq("id", purchase.id)
      } catch (err) {
        console.log("[v0] Could not update discount_code_used (column may not exist yet):", err)
      }
    }

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
    })
  } catch (error) {
    console.error("[v0] Purchase creation error:", error)
    return NextResponse.json({ error: "Intern serverfeil" }, { status: 500 })
  }
}
