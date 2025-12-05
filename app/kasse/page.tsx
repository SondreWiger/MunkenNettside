import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RecordingCheckout } from "@/components/checkout/recording-checkout"

export const metadata = {
  title: "Kjøp opptak | Teateret",
  description: "Kjøp tilgang til digitale opptak",
}

export const dynamic = "force-dynamic"

export default function RecordingCheckoutPage() {
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
          <RecordingCheckout />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
