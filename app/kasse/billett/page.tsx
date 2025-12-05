import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { TicketCheckout } from "@/components/booking/ticket-checkout"

export const metadata = {
  title: "Fullfør bestilling | Teateret",
  description: "Fullfør din billettbestilling",
}

export const dynamic = "force-dynamic"

export default function TicketCheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="hovedinnhold" className="flex-1">
        <Suspense
          fallback={
            <div className="container px-4 py-8">
              <div className="animate-pulse h-96 bg-muted rounded-lg" />
            </div>
          }
        >
          <TicketCheckout />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
