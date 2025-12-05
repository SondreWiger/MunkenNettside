import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RegisterForm } from "@/components/auth/register-form"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Opprett konto | Teateret",
  description: "Opprett en ny konto på Teateret",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="hovedinnhold" className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="animate-pulse h-96 w-full max-w-md bg-muted rounded-lg" />}>
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
