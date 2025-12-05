"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Trash } from "lucide-react"

export function ClearReservationsButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    setMessage(null)

    const res = await fetch("/api/seats/cleanup", { method: "POST" })
    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || "Noe gikk galt")
    } else {
      setMessage("Renset setereservasjoner")
    }

    setIsLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Button disabled={isLoading} onClick={handleClick} size="sm" variant="destructive">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
        Rens reserveringer
      </Button>
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  )
}
