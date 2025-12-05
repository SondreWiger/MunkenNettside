import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { verifyQRSignature } from "@/lib/utils/booking"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrData, bookingReference } = body

    // Get user from server client (has session context)
    const serverSupabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ status: "error", message: "Ikke autorisert" }, { status: 401 })
    }

    // Check if user is admin
    const adminSupabase = await getSupabaseAdminClient()
    const { data: profile } = await adminSupabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ status: "error", message: "Ikke autorisert" }, { status: 403 })
    }

    // Use admin client for database operations
    const supabase = await getSupabaseAdminClient()

    // Declare booking variable
    interface BookingData {
      id: string
      booking_reference: string
      customer_name: string
      status: string
      checked_in_at?: string
      seat_ids: string[]
      special_requests?: string
      show?: {
        title?: string
        show_datetime: string
        ensemble?: {
          title: string
        }
      }
    }

    let booking: BookingData | null = null

    if (qrData) {
      // Parse QR data
      try {
        const parsed = JSON.parse(qrData)

        // Verify signature
        const { signature, ...dataWithoutSignature } = parsed
        if (!verifyQRSignature(dataWithoutSignature, signature)) {
          return NextResponse.json({
            status: "error",
            message: "Ugyldig QR-kode - signaturen stemmer ikke",
          })
        }

        // Get booking
        const { data, error } = await supabase
          .from("bookings")
          .select(
            `
            *,
            show:shows(
              *,
              ensemble:ensembles(*)
            )
          `,
          )
          .eq("id", parsed.booking_id)
          .single()

        if (error || !data) {
          return NextResponse.json(
            {
              status: "error",
              message: "Bestilling ikke funnet",
            },
            { status: 404 },
          )
        }

        booking = data as BookingData
      } catch (qrError) {
        console.error("QR parsing error:", qrError)
        return NextResponse.json(
          {
            status: "error",
            message: "Kunne ikke lese QR-koden",
          },
          { status: 400 },
        )
      }
    } else if (bookingReference) {
      // Look up by reference
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          show:shows(
            *,
            ensemble:ensembles(*)
          )
        `,
        )
        .eq("booking_reference", bookingReference)
        .single()

      if (error || !data) {
        return NextResponse.json(
          {
            status: "error",
            message: "Bestilling ikke funnet",
          },
          { status: 404 },
        )
      }

      booking = data as BookingData
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: "QR-data eller referanse kreves",
        },
        { status: 400 },
      )
    }

    if (!booking) {
      return NextResponse.json(
        {
          status: "error",
          message: "Bestilling ikke funnet",
        },
        { status: 404 },
      )
    }

    // Check booking status
    if (booking.status === "cancelled") {
      return NextResponse.json(
        {
          status: "error",
          message: "Denne billetten er avlyst",
        },
        { status: 400 },
      )
    }

    if (booking.status === "refunded") {
      return NextResponse.json(
        {
          status: "error",
          message: "Denne billetten er refundert",
        },
        { status: 400 },
      )
    }

    // Check if already checked in
    const alreadyCheckedIn = booking.status === "used" || !!booking.checked_in_at

    // Get seats
    const { data: seats } = await supabase
      .from("seats")
      .select("section, row, number")
      .in("id", booking.seat_ids || [])

    // Check show date
    const showDate = new Date(booking.show?.show_datetime || new Date())
    const now = new Date()
    const daysDiff = Math.floor((showDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let statusResponse: "success" | "warning" | "error" = "success"
    let message = "Gyldig billett"

    if (alreadyCheckedIn) {
      statusResponse = "warning"
      message = "Denne billetten er allerede sjekket inn"
    } else if (daysDiff > 0) {
      statusResponse = "warning"
      message = `Forestillingen er om ${daysDiff} dag(er)`
    } else if (daysDiff < 0) {
      statusResponse = "warning"
      message = "Forestillingen har allerede vært"
    }

    const showTitle =
      booking.show?.title || booking.show?.ensemble?.title || "Forestilling"

    return NextResponse.json({
      status: statusResponse,
      message,
      booking: {
        id: booking.id,
        reference: booking.booking_reference,
        customerName: booking.customer_name,
        showTitle,
        showDatetime: booking.show?.show_datetime,
        seats:
          seats?.map((s) => ({
            section: s.section,
            row: s.row,
            number: s.number,
          })) || [],
        specialRequests: booking.special_requests,
        alreadyCheckedIn,
      },
    })
  } catch (error) {
    console.error("Verify ticket error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Intern serverfeil",
      },
      { status: 500 },
    )
  }
}
