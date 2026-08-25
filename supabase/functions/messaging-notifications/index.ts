/// <reference lib="deno.ns" />

import { createClient } from "npm:@supabase/supabase-js@2";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NotificationPayload {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  type: string;
  text: string;
}

interface PushSubscription {
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

// ─── CORS ───────────────────────────────────────────────────────────────────

function getAllowedOrigins(): string[] {
  const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "";
  const origins: string[] = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
  ];
  if (appBaseUrl && !appBaseUrl.includes("localhost") && !appBaseUrl.includes("127.0.0.1")) {
    const normalized = appBaseUrl.replace(/\/$/, "");
    if (!origins.includes(normalized)) origins.push(normalized);
  }
  return origins;
}

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  const allowed = getAllowedOrigins();
  return allowed.includes(origin) ? origin : allowed[0];
}

function json(data: Record<string, unknown>, status = 200, req?: Request) {
  const origin = req ? getCorsOrigin(req) : getAllowedOrigins()[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
      "vary": "Origin",
    },
  });
}

// ─── Supabase Admin Client ──────────────────────────────────────────────────

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRole) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured for this function");
  }
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─── Message Type Body Text ─────────────────────────────────────────────────

function getBodyForType(type: string, text: string): string | null {
  switch (type) {
    case "text":
      return text.length > 100 ? text.substring(0, 97) + "..." : text;
    case "habit_card":
      return "Shared a habit completion 🎯";
    case "badge_card":
      return "Shared a badge 🏆";
    case "xp_card":
      return "Shared an XP milestone ⭐";
    case "nudge":
      return "Sent you a nudge 👋";
    case "system":
      // System messages do NOT trigger push notifications
      return null;
    default:
      return text.length > 100 ? text.substring(0, 97) + "..." : text;
  }
}

// ─── Main Handler ───────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    const corsOrigin = getCorsOrigin(req);
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": corsOrigin,
        "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
        "access-control-allow-methods": "POST, OPTIONS",
        "vary": "Origin",
      },
    });
  }

  try {
    if (req.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, req);
    }

    // ── 1. Parse request body ───────────────────────────────────────────
    let payload: NotificationPayload;
    try {
      payload = await req.json();
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400, req);
    }

    const { message_id, conversation_id, sender_id, type, text } = payload;

    if (!message_id || !conversation_id || !sender_id) {
      return json({ ok: false, error: "missing_required_fields" }, 400, req);
    }

    // ── 2. Skip system messages entirely ────────────────────────────────
    const body = getBodyForType(type, text ?? "");
    if (body === null) {
      return json({ ok: true, sent: 0, skipped: "system_message" }, 200, req);
    }

    // ── 3. Create admin Supabase client ─────────────────────────────────
    const admin = getSupabaseAdmin();

    // ── 4. Fetch sender profile ─────────────────────────────────────────
    let senderName = "Someone";
    try {
      const { data: senderData } = await admin
        .from("profiles")
        .select("display_name, username")
        .eq("id", sender_id)
        .single();

      if (senderData) {
        senderName = senderData.display_name || senderData.username || "Someone";
      }
    } catch (err) {
      console.error("Failed to fetch sender profile:", err);
      // Fall back to "Someone" — don't block notification
    }

    // ── 5. Fetch conversation members (excluding sender) ────────────────
    const { data: members, error: membersError } = await admin
      .from("conversation_members")
      .select("user_id, is_muted")
      .eq("conversation_id", conversation_id)
      .neq("user_id", sender_id);

    if (membersError) {
      console.error("Failed to fetch conversation members:", membersError);
      return json({ ok: false, error: "failed_to_fetch_members" }, 500, req);
    }

    if (!members || members.length === 0) {
      return json({ ok: true, sent: 0, reason: "no_recipients" }, 200, req);
    }

    // ── 6. Filter out muted members ─────────────────────────────────────
    const eligibleMembers = members.filter((m) => !m.is_muted);

    if (eligibleMembers.length === 0) {
      return json({ ok: true, sent: 0, reason: "all_muted" }, 200, req);
    }

    // ── 7. Build notification payload ───────────────────────────────────
    const notificationPayload = {
      title: senderName,
      body,
      data: {
        conversationId: conversation_id,
        messageId: message_id,
      },
    };

    // ── 8. Fetch push subscriptions for eligible members ────────────────
    const eligibleUserIds = eligibleMembers.map((m) => m.user_id);

    const { data: subscriptions, error: subsError } = await admin
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh_key, auth_key")
      .in("user_id", eligibleUserIds);

    if (subsError) {
      console.error("Failed to fetch push subscriptions:", subsError);
      // Log the notification intent even if we can't send
      console.log(
        `[messaging-notifications] Intent: notify ${eligibleUserIds.length} users for message ${message_id}`,
        notificationPayload
      );
      return json({ ok: true, sent: 0, reason: "subscription_fetch_failed", intent_logged: true }, 200, req);
    }

    if (!subscriptions || subscriptions.length === 0) {
      // No push subscriptions found — log intent for debugging
      console.log(
        `[messaging-notifications] No push subscriptions found for users: ${eligibleUserIds.join(", ")}`,
        notificationPayload
      );
      return json({ ok: true, sent: 0, reason: "no_push_subscriptions", intent_logged: true }, 200, req);
    }

    // ── 9. Send push notifications ──────────────────────────────────────
    const vapidToken = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    let sent = 0;
    let failed = 0;

    const sendPromises = subscriptions.map(async (sub: PushSubscription) => {
      try {
        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(vapidToken ? { Authorization: `Bearer ${vapidToken}` } : {}),
          },
          body: JSON.stringify(notificationPayload),
        });

        if (!response.ok) {
          console.error(
            `Push failed for user ${sub.user_id}: ${response.status} ${response.statusText}`
          );
          failed++;

          // Remove expired/invalid subscriptions (410 Gone or 404 Not Found)
          if (response.status === 410 || response.status === 404) {
            await admin
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
            console.log(`Removed expired push subscription for user ${sub.user_id}`);
          }
        } else {
          sent++;
        }
      } catch (err) {
        console.error(`Push error for user ${sub.user_id}:`, err);
        failed++;
      }
    });

    await Promise.allSettled(sendPromises);

    // ── 10. Return response ─────────────────────────────────────────────
    return json({ ok: true, sent, failed }, 200, req);
  } catch (e) {
    console.error("[messaging-notifications] Unhandled error:", e);
    return json({ ok: false, error: "server_error", message: String((e as Error)?.message ?? e) }, 500, req);
  }
});
