import Stripe from "stripe";
import "server-only";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const PRICES = {
  premiumMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY!,
  premiumYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY!,
} as const;
