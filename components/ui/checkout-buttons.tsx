"use client";

import { useState } from "react";
import { posthog } from "@/lib/posthog";

export default function CheckoutButtons() {
  const [loading, setLoading] = useState<"month" | "year" | null>(null);

  async function startCheckout(interval: "month" | "year") {
    posthog.capture("checkout_started", { interval });
    setLoading(interval);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    const { url, error } = await res.json();
    if (error || !url) {
      setLoading(null);
      alert("決済の開始に失敗しました。もう一度お試しください。");
      return;
    }
    window.location.href = url;
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => startCheckout("year")}
        disabled={loading !== null}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading === "year" ? "処理中..." : "年額¥9,800で始める"}
      </button>
      <button
        onClick={() => startCheckout("month")}
        disabled={loading !== null}
        className="w-full rounded-xl border border-slate-200 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {loading === "month" ? "処理中..." : "月額¥980で始める"}
      </button>
    </div>
  );
}
