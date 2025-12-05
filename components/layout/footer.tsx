import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Om Teateret</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vi er et lokalt teater med fokus på kvalitetsforestillinger for hele familien. Opplev magien på scenen
              eller hjemmefra med våre digitale opptak.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Snarveier</h2>
            <nav className="flex flex-col gap-2">
              <Link href="/forestillinger" className="text-muted-foreground hover:text-foreground transition-colors">
                Forestillinger
              </Link>
              <Link href="/opptak" className="text-muted-foreground hover:text-foreground transition-colors">
                Digitale opptak
              </Link>
              <Link href="/om-oss" className="text-muted-foreground hover:text-foreground transition-colors">
                Om oss
              </Link>
              <Link href="/kontakt" className="text-muted-foreground hover:text-foreground transition-colors">
                Kontakt
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Kontakt</h2>
            <address className="flex flex-col gap-3 not-italic text-muted-foreground">
              <a
                href="mailto:kontakt@teateret.no"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
                kontakt@teateret.no
              </a>
              <a href="tel:+4712345678" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="h-5 w-5" aria-hidden="true" />
                +47 123 45 678
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5" aria-hidden="true" />
                Teaterveien 1, 0123 Oslo
              </span>
            </address>
          </div>

          {/* Accessibility */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Tilgjengelighet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vi jobber for at alle skal kunne nyte teater. Kontakt oss for informasjon om tilrettelegging,
              rullestoltilgang og tegnspråktolking.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Teateret. Alle rettigheter reservert.</p>
        </div>
      </div>
    </footer>
  )
}
