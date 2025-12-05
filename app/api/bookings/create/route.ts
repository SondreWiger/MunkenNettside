import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server"
import type { Seat } from "@/lib/types"
import { generateBookingReference, createQRCodeData } from "@/lib/utils/booking"
import { sendTicketEmail } from "@/lib/email/send-ticket-email"

export async function POST(request: NextRequest) {
  console.log("[v0] ========== BOOKING CREATE START ==========")

  try {
    const body = await request.json()
    const { showId, seatIds, customerName, customerEmail, customerPhone, specialRequests, totalAmount, discountCode } = body

    console.log("[v0] Booking request received:")
    console.log("[v0]   showId:", showId)
    console.log("[v0]   seatIds:", seatIds)
    console.log("[v0]   customerName:", customerName)
    console.log("[v0]   customerEmail:", customerEmail)
    console.log("[v0]   totalAmount:", totalAmount)
    console.log("[v0]   discountCode:", discountCode)

    if (!showId || !Array.isArray(seatIds) || seatIds.length === 0 || !customerName || !customerEmail || typeof totalAmount !== "number" || totalAmount <= 0) {
      console.error("[v0] Validation failed:")
      console.error("[v0]   showId:", showId, "truthy:", !!showId)
      console.error("[v0]   seatIds is array:", Array.isArray(seatIds), "length:", seatIds?.length)
      console.error("[v0]   customerName:", customerName, "truthy:", !!customerName)
      console.error("[v0]   customerEmail:", customerEmail, "truthy:", !!customerEmail)
      console.error("[v0]   totalAmount:", totalAmount, "is number:", typeof totalAmount === "number", "gt 0:", totalAmount > 0)
      return NextResponse.json({ error: "Manglende påkrevde felt" }, { status: 400 })
    }

    // Get current user from regular server client (has session context)
    const serverClient = await getSupabaseServerClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user?.id) {
      console.log("[v0] Authentication failed - no user")
      return NextResponse.json(
        { error: "Du må være logget inn for å bestille billetter" },
        { status: 401 }
      )
    }

    console.log("[v0] Booking for user:", user.id)

    // Use admin client for database operations (bypasses RLS)
    const supabase = await getSupabaseAdminClient()

    // Get show details
    const { data: show, error: showError } = await supabase
      .from("shows")
      .select(`
        *,
        ensemble:ensembles(*),
        venue:venues(*)
      `)
      .eq("id", showId)
      .single()

    if (showError || !show) {
      console.error("[v0] Show error:", showError)
      return NextResponse.json({ error: "Forestilling ikke funnet" }, { status: 404 })
    }

    console.log("[v0] Show found:", show.id)

  const { data: seats, error: seatsError } = await supabase.from("seats").select("*").in("id", seatIds)

    if (seatsError || !seats) {
      console.error("[v0] Seats fetch error:", seatsError)
      return NextResponse.json({ error: "Kunne ikke hente setedata" }, { status: 500 })
    }

  console.log(
    "[v0] Seats fetched for booking:",
    seats?.map((s: Seat) => ({ id: s.id, status: s.status, reserved_until: s.reserved_until })),
  )

  // Check that we got all requested seats
  if (seats.length !== seatIds.length) {
      return NextResponse.json({ error: "Noen av setene finnes ikke" }, { status: 400 })
    }

  const unavailableSeats = seats.filter((s: Seat) => s.status !== "reserved" && s.status !== "available")
    if (unavailableSeats.length > 0) {
  const soldCount = unavailableSeats.filter((s: Seat) => s.status === "sold").length
  const blockedCount = unavailableSeats.filter((s: Seat) => s.status === "blocked").length

      let errorMsg = "Noen av setene er ikke lenger tilgjengelige"
      if (soldCount > 0) errorMsg = `${soldCount} av setene er allerede solgt`
      if (blockedCount > 0) errorMsg = `${blockedCount} av setene er blokkert`

      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // Generate booking reference
    const bookingReference = generateBookingReference()
    console.log("[v0] Generated booking reference:", bookingReference)

    // Verify and increment discount code usage if provided
    if (discountCode) {
      const { data: code, error: codeError } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", discountCode)
        .single()

      if (!codeError && code) {
        // Increment usage counter
        await supabase
          .from("discount_codes")
          .update({ current_uses: (code.current_uses || 0) + 1 })
          .eq("id", code.id)
      }
    }

    // Create QR code data
    const showTitle = show.title || show.ensemble?.title || "Forestilling"
    const qrData = createQRCodeData(
      "", // Will be updated after insert
      bookingReference,
      showId,
      showTitle,
      show.show_datetime,
      customerName,
      seats.map((s: Seat) => ({ section: s.section, row: s.row, number: s.number })),
    )

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        show_id: showId,
        seat_ids: seatIds,
        total_amount_nok: totalAmount,
        booking_reference: bookingReference,
        qr_code_data: JSON.stringify(qrData),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        special_requests: specialRequests || null,
        status: "confirmed", // Mock payment - directly confirmed
        confirmed_at: new Date().toISOString(),
        ticket_sent: false,
      })
      .select()
      .single()

    if (bookingError) {
      console.error("[v0] Booking error:", bookingError)
      return NextResponse.json({ error: "Kunne ikke opprette bestilling: " + bookingError.message }, { status: 500 })
    }

    console.log("[v0] Booking created:", booking.id, "Reference:", booking.booking_reference, "User ID:", booking.user_id)

    // Update discount code used if provided (try to update, won't fail if column doesn't exist)
    if (discountCode) {
      try {
        await supabase
          .from("bookings")
          .update({ discount_code_used: discountCode })
          .eq("id", booking.id)
      } catch (err) {
        console.log("[v0] Could not update discount_code_used (column may not exist yet):", err)
      }
    }

    // Update QR data with booking ID
    const updatedQrData = { ...qrData, booking_id: booking.id }
    const qrCodeDataString = JSON.stringify(updatedQrData)

    await supabase.from("bookings").update({ qr_code_data: qrCodeDataString }).eq("id", booking.id)

    const { error: updateSeatsError } = await supabase
      .from("seats")
      .update({ status: "sold", reserved_until: null })
      .in("id", seatIds)

    if (updateSeatsError) {
      console.error("[v0] Update seats error:", updateSeatsError)
    }

    // Update available seats count
    await supabase
      .from("shows")
      .update({ available_seats: show.available_seats - seatIds.length })
      .eq("id", showId)

    console.log("[v0] ========== STARTING EMAIL SEND ==========")
    console.log("[v0] Calling sendTicketEmail function...")

  let emailResult: { success: boolean; error?: string } = { success: false }

    try {
      emailResult = await sendTicketEmail({
        customerName,
        customerEmail,
        bookingReference,
        showTitle,
        showDatetime: show.show_datetime,
        venueName: show.venue?.name || "Ukjent lokale",
        venueAddress: show.venue ? `${show.venue.address}, ${show.venue.postal_code} ${show.venue.city}` : "",
        seats: seats.map((s: Seat) => ({
          section: s.section,
          row: s.row,
          number: s.number,
          price_nok: s.price_nok,
        })),
        totalAmount,
        qrCodeData: qrCodeDataString,
      })

      console.log("[v0] sendTicketEmail returned:", emailResult)
    } catch (emailError) {
      console.error("[v0] sendTicketEmail threw an error:", emailError)
      emailResult = {
        success: false,
        error: emailError instanceof Error ? emailError.message : "Ukjent feil i e-postsending",
      }
    }

    // Update ticket_sent status
    await supabase.from("bookings").update({ ticket_sent: emailResult.success }).eq("id", booking.id)

    if (!emailResult.success) {
      console.error("[v0] Email sending failed:", emailResult.error)
    } else {
      console.log("[v0] Email sent successfully!")
    }

    console.log("[v0] ========== BOOKING CREATE COMPLETE ==========")

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingReference,
      emailSent: emailResult.success,
      emailError: emailResult.error,
    })
  } catch (error) {
    console.error("[v0] ========== BOOKING CREATE ERROR ==========")
    console.error("[v0] Booking creation error:", error)
    return NextResponse.json({ error: "Intern serverfeil" }, { status: 500 })
  }
}
