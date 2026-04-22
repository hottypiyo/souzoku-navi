import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Webhook はボディを生のまま読む必要があるため Edge / Node どちらでも動作
export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (!userId || !session.customer) break;

      // Stripe顧客IDを保存
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: session.customer as string })
        .eq("id", userId);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (!userId) break;

      const isActive = sub.status === "active" || sub.status === "trialing";
      // cancel_at が設定されている場合はその日時をexpiry、そうでなければnull（自動更新中）
      const expiresAt = isActive && sub.cancel_at
        ? new Date(sub.cancel_at * 1000).toISOString()
        : null;

      await supabaseAdmin
        .from("profiles")
        .update({
          plan: isActive ? "premium" : "free",
          premium_expires_at: expiresAt,
          stripe_subscription_id: sub.id,
        })
        .eq("id", userId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (!userId) break;

      await supabaseAdmin
        .from("profiles")
        .update({ plan: "free", premium_expires_at: null, stripe_subscription_id: null })
        .eq("id", userId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
