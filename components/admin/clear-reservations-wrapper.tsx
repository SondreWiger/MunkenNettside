"use client"

import dynamic from "next/dynamic"

const ClearReservationsButton = dynamic(() => import("@/components/admin/clear-reservations").then((m) => m.ClearReservationsButton), { ssr: false })

export function ClearReservationsButtonWrapper() {
  return <ClearReservationsButton />
}
