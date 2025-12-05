import { QRScanner } from "@/components/admin/qr-scanner"

export const metadata = {
  title: "Billettskanner | Admin | Teateret",
  description: "Skann QR-billetter ved inngangen",
}

export default function ScanPage() {
  return (
    <main className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billettskanner</h1>
        <p className="text-muted-foreground">Skann QR-koder for å sjekke inn gjester</p>
      </div>
      <QRScanner />
    </main>
  )
}
