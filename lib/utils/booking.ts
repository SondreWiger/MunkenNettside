import crypto from "crypto"

const QR_SECRET = process.env.QR_SIGNING_SECRET || "default-secret-change-in-production"

export function generateBookingReference(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const randomPart = crypto.randomBytes(2).toString("hex").toUpperCase()
  return `THTR-${dateStr}-${randomPart}`
}

export function generateQRSignature(data: object): string {
  const payload = JSON.stringify(data)
  return crypto.createHmac("sha256", QR_SECRET).update(payload).digest("hex")
}

export function verifyQRSignature(data: object, signature: string): boolean {
  const expectedSignature = generateQRSignature(data)
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

export function createQRCodeData(
  bookingId: string,
  reference: string,
  showId: string,
  showTitle: string,
  showDatetime: string,
  customerName: string,
  seats: Array<{ section: string; row: string; number: number }>,
) {
  const dataWithoutSignature = {
    booking_id: bookingId,
    reference,
    show_id: showId,
    show_title: showTitle,
    show_datetime: showDatetime,
    customer_name: customerName,
    seats,
    checked_in: false,
  }

  const signature = generateQRSignature(dataWithoutSignature)

  return {
    ...dataWithoutSignature,
    signature,
  }
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString))
}

export function formatTime(dateString: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} kl. ${formatTime(dateString)}`
}
