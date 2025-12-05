module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseAdminClient",
    ()=>getSupabaseAdminClient,
    "getSupabaseServerClient",
    ()=>getSupabaseServerClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
;
async function getSupabaseServerClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://ppyxdacfksiaaoxlaivd.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXhkYWNma3NpYWFveGxhaXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MDQzNDQsImV4cCI6MjA4MDQ4MDM0NH0.d9YqkmQiXCM2kgvsMbb0V_PvzfeuD9QoKGlI4Yr1kdo"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // Server Component - ignore
                }
            }
        }
    });
}
async function getSupabaseAdminClient() {
    // Use createClient with service role key to bypass RLS
    // Do NOT use createServerClient with service role key - it still respects RLS
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])(("TURBOPACK compile-time value", "https://ppyxdacfksiaaoxlaivd.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/utils/booking.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createQRCodeData",
    ()=>createQRCodeData,
    "formatDate",
    ()=>formatDate,
    "formatDateTime",
    ()=>formatDateTime,
    "formatPrice",
    ()=>formatPrice,
    "formatTime",
    ()=>formatTime,
    "generateBookingReference",
    ()=>generateBookingReference,
    "generateQRSignature",
    ()=>generateQRSignature,
    "verifyQRSignature",
    ()=>verifyQRSignature
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const QR_SECRET = process.env.QR_SIGNING_SECRET || "default-secret-change-in-production";
function generateBookingReference() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(2).toString("hex").toUpperCase();
    return `THTR-${dateStr}-${randomPart}`;
}
function generateQRSignature(data) {
    const payload = JSON.stringify(data);
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac("sha256", QR_SECRET).update(payload).digest("hex");
}
function verifyQRSignature(data, signature) {
    const expectedSignature = generateQRSignature(data);
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
function createQRCodeData(bookingId, reference, showId, showTitle, showDatetime, customerName, seats) {
    const dataWithoutSignature = {
        booking_id: bookingId,
        reference,
        show_id: showId,
        show_title: showTitle,
        show_datetime: showDatetime,
        customer_name: customerName,
        seats,
        checked_in: false
    };
    const signature = generateQRSignature(dataWithoutSignature);
    return {
        ...dataWithoutSignature,
        signature
    };
}
function formatPrice(amount) {
    return new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}
function formatDate(dateString) {
    return new Intl.DateTimeFormat("nb-NO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(new Date(dateString));
}
function formatTime(dateString) {
    return new Intl.DateTimeFormat("nb-NO", {
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(dateString));
}
function formatDateTime(dateString) {
    return `${formatDate(dateString)} kl. ${formatTime(dateString)}`;
}
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/lib/email/send-ticket-email.tsx [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"401fa2ce48ea47ca7d8601d663d18ec08b3a0be021":"sendTicketEmail"},"",""] */ __turbopack_context__.s([
    "sendTicketEmail",
    ()=>sendTicketEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nodemailer/lib/nodemailer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$booking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/booking.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
;
let transporter = null;
function getTransporter() {
    if (!transporter) {
        transporter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport({
            host: process.env.SMTP_SERVER,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_LOGIN,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    return transporter;
}
async function sendTicketEmail(data) {
    console.log('[v0] ========== EMAIL SEND START ==========');
    console.log('[v0] sendTicketEmail called with:', {
        customerEmail: data.customerEmail,
        bookingReference: data.bookingReference,
        showTitle: data.showTitle
    });
    const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@teateret.no';
    const fromName = process.env.BREVO_FROM_NAME || 'Teateret';
    console.log('[v0] Email configuration:');
    console.log('[v0] - FROM_EMAIL:', fromEmail);
    console.log('[v0] - FROM_NAME:', fromName);
    console.log('[v0] - SMTP_SERVER:', process.env.SMTP_SERVER);
    if (!process.env.SMTP_SERVER || !process.env.SMTP_LOGIN || !process.env.SMTP_PASSWORD) {
        console.error('[v0] ERROR: SMTP credentials not configured!');
        return {
            success: false,
            error: 'E-post er ikke konfigurert (mangler SMTP credentials)'
        };
    }
    try {
        // Generate QR code as buffer for embedding in email
        console.log('[v0] Generating QR code...');
        const QRCode = await __turbopack_context__.A("[project]/node_modules/qrcode/lib/index.js [app-route] (ecmascript, async loader)");
        const qrCodeBuffer = await QRCode.toBuffer(data.qrCodeData, {
            width: 200,
            margin: 2
        });
        console.log('[v0] QR code generated successfully');
        const seatsHtml = data.seats.map((seat)=>`
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 8px; text-align: left;">${seat.section}</td>
          <td style="padding: 8px; text-align: center;">${seat.row}</td>
          <td style="padding: 8px; text-align: center;">${seat.number}</td>
          <td style="padding: 8px; text-align: right;">${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$booking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatPrice"])(seat.price_nok)}</td>
        </tr>
      `).join('');
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
                  <td style="padding: 8px 0; text-align: right;">${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$booking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatDate"])(data.showDatetime)} kl. ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$booking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatTime"])(data.showDatetime)}</td>
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
                ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$booking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatPrice"])(data.totalAmount)}
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
    `;
        const transporter = getTransporter();
        console.log('[v0] Sending email via SMTP...');
        console.log('[v0] - To:', data.customerEmail);
        console.log('[v0] - From:', `${fromName} <${fromEmail}>`);
        const info = await transporter.sendMail({
            from: `${fromName} <${fromEmail}>`,
            to: data.customerEmail,
            subject: `Din billett til ${data.showTitle} - ${data.bookingReference}`,
            html: emailHtml,
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrCodeBuffer,
                    cid: 'qrcode'
                }
            ]
        });
        console.log('[v0] Email sent successfully!');
        console.log('[v0] Message ID:', info.messageId);
        console.log('[v0] Response:', info.response);
        console.log('[v0] ========== EMAIL SEND COMPLETE ==========');
        return {
            success: true
        };
    } catch (error) {
        console.error('[v0] ========== EMAIL SEND ERROR ==========');
        console.error('[v0] Error type:', typeof error);
        console.error('[v0] Error:', error);
        if (error instanceof Error) {
            console.error('[v0] Error message:', error.message);
            console.error('[v0] Error stack:', error.stack);
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ukjent feil ved e-postsending'
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    sendTicketEmail
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(sendTicketEmail, "401fa2ce48ea47ca7d8601d663d18ec08b3a0be021", null);
}),
"[project]/app/api/bookings/create/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$booking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/booking.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$send$2d$ticket$2d$email$2e$tsx__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/email/send-ticket-email.tsx [app-route] (ecmascript)");
;
;
;
;
async function POST(request) {
    console.log("[v0] ========== BOOKING CREATE START ==========");
    try {
        const body = await request.json();
        const { showId, seatIds, customerName, customerEmail, customerPhone, specialRequests, totalAmount } = body;
        console.log("[v0] Booking request:", {
            showId,
            seatIds,
            customerName,
            customerEmail,
            totalAmount
        });
        if (!showId || !seatIds || !customerName || !customerEmail || !totalAmount) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Manglende påkrevde felt"
            }, {
                status: 400
            });
        }
        // Get current user from regular server client (has session context)
        const serverClient = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseServerClient"])();
        const { data: { user } } = await serverClient.auth.getUser();
        if (!user?.id) {
            console.log("[v0] Authentication failed - no user");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Du må være logget inn for å bestille billetter"
            }, {
                status: 401
            });
        }
        console.log("[v0] Booking for user:", user.id);
        // Use admin client for database operations (bypasses RLS)
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdminClient"])();
        // Get show details
        const { data: show, error: showError } = await supabase.from("shows").select(`
        *,
        ensemble:ensembles(*),
        venue:venues(*)
      `).eq("id", showId).single();
        if (showError || !show) {
            console.error("[v0] Show error:", showError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Forestilling ikke funnet"
            }, {
                status: 404
            });
        }
        console.log("[v0] Show found:", show.id);
        const { data: seats, error: seatsError } = await supabase.from("seats").select("*").in("id", seatIds);
        if (seatsError || !seats) {
            console.error("[v0] Seats fetch error:", seatsError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Kunne ikke hente setedata"
            }, {
                status: 500
            });
        }
        console.log("[v0] Seats fetched for booking:", seats?.map((s)=>({
                id: s.id,
                status: s.status,
                reserved_until: s.reserved_until
            })));
        // Check that we got all requested seats
        if (seats.length !== seatIds.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Noen av setene finnes ikke"
            }, {
                status: 400
            });
        }
        const unavailableSeats = seats.filter((s)=>s.status !== "reserved" && s.status !== "available");
        if (unavailableSeats.length > 0) {
            const soldCount = unavailableSeats.filter((s)=>s.status === "sold").length;
            const blockedCount = unavailableSeats.filter((s)=>s.status === "blocked").length;
            let errorMsg = "Noen av setene er ikke lenger tilgjengelige";
            if (soldCount > 0) errorMsg = `${soldCount} av setene er allerede solgt`;
            if (blockedCount > 0) errorMsg = `${blockedCount} av setene er blokkert`;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: errorMsg
            }, {
                status: 400
            });
        }
        // Generate booking reference
        const bookingReference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$booking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateBookingReference"])();
        console.log("[v0] Generated booking reference:", bookingReference);
        // Create QR code data
        const showTitle = show.title || show.ensemble?.title || "Forestilling";
        const qrData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$booking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createQRCodeData"])("", bookingReference, showId, showTitle, show.show_datetime, customerName, seats.map((s)=>({
                section: s.section,
                row: s.row,
                number: s.number
            })));
        // Create booking
        const { data: booking, error: bookingError } = await supabase.from("bookings").insert({
            user_id: user.id,
            show_id: showId,
            seat_ids: seatIds,
            total_amount_nok: totalAmount,
            booking_reference: bookingReference,
            qr_code_data: JSON.stringify(qrData),
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone || null,
            special_requests: specialRequests || null,
            status: "confirmed",
            confirmed_at: new Date().toISOString(),
            ticket_sent: false
        }).select().single();
        if (bookingError) {
            console.error("[v0] Booking error:", bookingError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Kunne ikke opprette bestilling: " + bookingError.message
            }, {
                status: 500
            });
        }
        console.log("[v0] Booking created:", booking.id, "Reference:", booking.booking_reference, "User ID:", booking.user_id);
        // Update QR data with booking ID
        const updatedQrData = {
            ...qrData,
            booking_id: booking.id
        };
        const qrCodeDataString = JSON.stringify(updatedQrData);
        await supabase.from("bookings").update({
            qr_code_data: qrCodeDataString
        }).eq("id", booking.id);
        const { error: updateSeatsError } = await supabase.from("seats").update({
            status: "sold",
            reserved_until: null
        }).in("id", seatIds);
        if (updateSeatsError) {
            console.error("[v0] Update seats error:", updateSeatsError);
        }
        // Update available seats count
        await supabase.from("shows").update({
            available_seats: show.available_seats - seatIds.length
        }).eq("id", showId);
        console.log("[v0] ========== STARTING EMAIL SEND ==========");
        console.log("[v0] Calling sendTicketEmail function...");
        let emailResult = {
            success: false
        };
        try {
            emailResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$send$2d$ticket$2d$email$2e$tsx__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendTicketEmail"])({
                customerName,
                customerEmail,
                bookingReference,
                showTitle,
                showDatetime: show.show_datetime,
                venueName: show.venue?.name || "Ukjent lokale",
                venueAddress: show.venue ? `${show.venue.address}, ${show.venue.postal_code} ${show.venue.city}` : "",
                seats: seats.map((s)=>({
                        section: s.section,
                        row: s.row,
                        number: s.number,
                        price_nok: s.price_nok
                    })),
                totalAmount,
                qrCodeData: qrCodeDataString
            });
            console.log("[v0] sendTicketEmail returned:", emailResult);
        } catch (emailError) {
            console.error("[v0] sendTicketEmail threw an error:", emailError);
            emailResult = {
                success: false,
                error: emailError instanceof Error ? emailError.message : "Ukjent feil i e-postsending"
            };
        }
        // Update ticket_sent status
        await supabase.from("bookings").update({
            ticket_sent: emailResult.success
        }).eq("id", booking.id);
        if (!emailResult.success) {
            console.error("[v0] Email sending failed:", emailResult.error);
        } else {
            console.log("[v0] Email sent successfully!");
        }
        console.log("[v0] ========== BOOKING CREATE COMPLETE ==========");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            bookingId: booking.id,
            bookingReference,
            emailSent: emailResult.success,
            emailError: emailResult.error
        });
    } catch (error) {
        console.error("[v0] ========== BOOKING CREATE ERROR ==========");
        console.error("[v0] Booking creation error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Intern serverfeil"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__abfbb400._.js.map