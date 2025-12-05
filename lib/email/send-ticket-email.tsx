'use server'

import nodemailer from 'nodemailer'
import { formatDate, formatTime, formatPrice } from '@/lib/utils/booking'

interface TicketEmailData {
  customerName: string
  customerEmail: string
  bookingReference: string
  showTitle: string
  showDatetime: string
  venueName: string
  venueAddress: string
  seats: Array<{ section: string; row: string; number: number; price_nok: number }>
  totalAmount: number
  qrCodeData: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_LOGIN,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }
  return transporter
}

export async function sendTicketEmail(data: TicketEmailData): Promise<{ success: boolean; error?: string }> {
  console.log('[v0] ========== EMAIL SEND START ==========')
  console.log('[v0] sendTicketEmail called with:', {
    customerEmail: data.customerEmail,
    bookingReference: data.bookingReference,
    showTitle: data.showTitle,
  })

  const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@teateret.no'
  const fromName = process.env.BREVO_FROM_NAME || 'Teateret'

  console.log('[v0] Email configuration:')
  console.log('[v0] - FROM_EMAIL:', fromEmail)
  console.log('[v0] - FROM_NAME:', fromName)
  console.log('[v0] - SMTP_SERVER:', process.env.SMTP_SERVER)

  if (!process.env.SMTP_SERVER || !process.env.SMTP_LOGIN || !process.env.SMTP_PASSWORD) {
    console.error('[v0] ERROR: SMTP credentials not configured!')
    return { success: false, error: 'E-post er ikke konfigurert (mangler SMTP credentials)' }
  }

  try {
    // Generate QR code as buffer for embedding in email
    console.log('[v0] Generating QR code...')
    const QRCode = await import('qrcode')
    const qrCodeBuffer = await QRCode.toBuffer(data.qrCodeData, {
      width: 200,
      margin: 2,
    })
    console.log('[v0] QR code generated successfully')

    const seatsHtml = data.seats
      .map(
        (seat) => `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 8px; text-align: left;">${seat.section}</td>
          <td style="padding: 8px; text-align: center;">${seat.row}</td>
          <td style="padding: 8px; text-align: center;">${seat.number}</td>
          <td style="padding: 8px; text-align: right;">${formatPrice(seat.price_nok)}</td>
        </tr>
      `,
      )
      .join('')

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎭 Din billett er klar!</h1>
          </div>
          
          <div style="max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <p style="color: #333; margin-bottom: 20px;">Hei ${data.customerName},</p>
            
            <p style="color: #555; margin-bottom: 20px;">
              Takk for at du bestilte billetter til ${data.showTitle}! Her er din billett med QR-kode.
            </p>

            <!-- Booking Reference -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
              <p style="color: #666; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">Bokingsreferanse</p>
              <p style="color: #333; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; margin: 0; letter-spacing: 2px;">
                ${data.bookingReference}
              </p>
            </div>

            <!-- QR Code -->
            <div style="text-align: center; margin: 30px 0;">
              <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px; border-radius: 8px;">
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">Vis denne koden ved inngang</p>
            </div>

            <!-- Show Details -->
            <div style="background: #f0f7ff; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 12px;">Arrangement</h3>
              <table style="width: 100%; color: #555;">
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px 0; padding-right: 10px; font-weight: 500;">Forestilling:</td>
                  <td style="padding: 8px 0; text-align: right;"><strong>${data.showTitle}</strong></td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px 0; padding-right: 10px;">Dato & tid:</td>
                  <td style="padding: 8px 0; text-align: right;">${formatDate(data.showDatetime)} kl. ${formatTime(data.showDatetime)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px 0; padding-right: 10px;">Sted:</td>
                  <td style="padding: 8px 0; text-align: right;"><strong>${data.venueName}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; padding-right: 10px;">Adresse:</td>
                  <td style="padding: 8px 0; text-align: right;">${data.venueAddress}</td>
                </tr>
              </table>
            </div>

            <!-- Seats Table -->
            <div style="margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 12px;">Billetter</h3>
              <table style="width: 100%; border-collapse: collapse; color: #555;">
                <thead>
                  <tr style="background: #f0f7ff; border-bottom: 2px solid #667eea;">
                    <th style="padding: 10px; text-align: left; font-weight: 600; color: #333;">Seksjon</th>
                    <th style="padding: 10px; text-align: center; font-weight: 600; color: #333;">Rad</th>
                    <th style="padding: 10px; text-align: center; font-weight: 600; color: #333;">Sete</th>
                    <th style="padding: 10px; text-align: right; font-weight: 600; color: #333;">Pris</th>
                  </tr>
                </thead>
                <tbody>
                  ${seatsHtml}
                </tbody>
              </table>
            </div>

            <!-- Total -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: right;">
              <p style="color: #666; margin: 0 0 8px 0;">Totalpris:</p>
              <p style="color: #667eea; font-size: 24px; font-weight: bold; margin: 0;">
                ${formatPrice(data.totalAmount)}
              </p>
            </div>

            <!-- Important Note -->
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-weight: 500;">
                ⏰ Vennligst møt 15 minutter før forestillingen starter.
              </p>
            </div>

            <p style="color: #777; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              Lurer du på noe? Besøk våre nettsider eller kontakt vår kundeservice.
            </p>

            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              Med vennlig hilsen,<br>
              <strong>Teateret</strong>
            </p>
          </div>
        </body>
      </html>
    `

    const transporter = getTransporter()

    console.log('[v0] Sending email via SMTP...')
    console.log('[v0] - To:', data.customerEmail)
    console.log('[v0] - From:', `${fromName} <${fromEmail}>`)

    const info = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: data.customerEmail,
      subject: `Din billett til ${data.showTitle} - ${data.bookingReference}`,
      html: emailHtml,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          cid: 'qrcode',
        },
      ],
    })

    console.log('[v0] Email sent successfully!')
    console.log('[v0] Message ID:', info.messageId)
    console.log('[v0] Response:', info.response)
    console.log('[v0] ========== EMAIL SEND COMPLETE ==========')

    return { success: true }
  } catch (error) {
    console.error('[v0] ========== EMAIL SEND ERROR ==========')
    console.error('[v0] Error type:', typeof error)
    console.error('[v0] Error:', error)
    if (error instanceof Error) {
      console.error('[v0] Error message:', error.message)
      console.error('[v0] Error stack:', error.stack)
    }
    return { success: false, error: error instanceof Error ? error.message : 'Ukjent feil ved e-postsending' }
  }
}
