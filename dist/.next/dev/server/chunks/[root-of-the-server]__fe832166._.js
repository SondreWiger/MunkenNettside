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
"[project]/app/api/seats/reserve/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { seatIds, showId } = body;
        console.log("[v0] Reserve seats request", {
            showId,
            seatIds
        });
        if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0 || !showId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Manglende seatIds eller showId"
            }, {
                status: 400
            });
        }
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseAdminClient"])();
        const reservedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        ;
        // Debug: Check if service role key is available
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("[v0] SUPABASE_SERVICE_ROLE_KEY not set - admin operations will fail");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Server misconfiguration"
            }, {
                status: 500
            });
        }
        // First check current status of all seats
        const { data: currentSeats, error: checkError } = await supabase.from("seats").select("id, status, reserved_until, row, number, section").in("id", seatIds).eq("show_id", showId);
        if (checkError) {
            console.error("[v0] Check seats error:", checkError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Kunne ikke sjekke sete-status"
            }, {
                status: 500
            });
        }
        if (!currentSeats || currentSeats.length !== seatIds.length) {
            console.warn("[v0] Seat count mismatch", {
                requested: seatIds.length,
                found: currentSeats?.length,
                currentSeats
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Noen av setene finnes ikke"
            }, {
                status: 400
            });
        }
        console.log("[v0] Current seat states:", currentSeats.map((s)=>({
                id: s.id,
                status: s.status,
                reserved_until: s.reserved_until
            })));
        // Normalize and defensive-check seat statuses to avoid casing/null issues
        const now = Date.now();
        const expiredReservedIds = [];
        const unavailableSeats = currentSeats.filter((s)=>{
            // Normalize status values. If status is null/undefined, treat it as available
            const st = (s.status || "available").toString().toLowerCase();
            if (st === "available") return false;
            if (st === "reserved") {
                // If reservation expired, consider it available and mark for cleanup
                const until = s.reserved_until ? new Date(s.reserved_until).getTime() : 0;
                if (until && until > now) {
                    return true // still reserved
                    ;
                }
                // expired reservation - collect for cleanup and treat as available
                expiredReservedIds.push(s.id);
                return false;
            }
            // sold/blocked or any other status -> unavailable
            return true;
        });
        // Cleanup any expired reservations so they don't block users
        if (expiredReservedIds.length > 0) {
            console.log("[v0] Cleaning up expired reservations:", expiredReservedIds);
            try {
                await supabase.from("seats").update({
                    status: "available",
                    reserved_until: null
                }).in("id", expiredReservedIds);
            } catch (e) {
                console.warn("[v0] Failed to cleanup expired reservations", {
                    expiredReservedIds,
                    error: e
                });
            }
        }
        console.log("[v0] Unavailable seats check:", {
            unavailableSeatIds: unavailableSeats.map((s)=>s.id),
            count: unavailableSeats.length
        });
        if (unavailableSeats.length > 0) {
            const seatList = unavailableSeats.map((s)=>`Rad ${s.row}, Sete ${s.number}`).join(", ");
            console.log("[v0] Rejecting due to unavailable seats:", {
                seatList,
                ids: unavailableSeats.map((s)=>s.id)
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Følgende seter er ikke tilgjengelige: ${seatList}`,
                unavailableSeatIds: unavailableSeats.map((s)=>s.id)
            }, {
                status: 409
            });
        }
        // Reserve all seats (only those still available) - include show_id filter for safety
        const { data: updatedSeats, error: updateError } = await supabase.from("seats").update({
            status: "reserved",
            reserved_until: reservedUntil
        }).in("id", seatIds).eq("show_id", showId).eq("status", "available").select("id");
        if (updateError) {
            console.error("[v0] Update seats error:", updateError);
            console.error("[v0] Update error details:", {
                code: updateError.code,
                message: updateError.message,
                details: updateError.details
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Kunne ikke reservere setene",
                details: updateError.message
            }, {
                status: 500
            });
        }
        // Check if all seats were reserved
        if (!updatedSeats || updatedSeats.length !== seatIds.length) {
            // Some seats were taken between check and update - rollback
            const reservedIds = updatedSeats?.map((s)=>s.id) || [];
            console.log("[v0] Partial update detected", {
                requested: seatIds.length,
                updated: updatedSeats?.length,
                updatedIds: reservedIds
            });
            if (reservedIds.length > 0) {
                await supabase.from("seats").update({
                    status: "available",
                    reserved_until: null
                }).in("id", reservedIds);
            }
            const failedCount = seatIds.length - (updatedSeats?.length || 0);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `${failedCount} av setene ble nettopp tatt av noen andre`
            }, {
                status: 409
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            reservedUntil,
            seatIds: updatedSeats.map((s)=>s.id)
        });
    } catch (error) {
        console.error("[v0] Reserve seats error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Intern serverfeil"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fe832166._.js.map