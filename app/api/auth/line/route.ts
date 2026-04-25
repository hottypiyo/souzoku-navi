import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLineLoginUrl } from "@/lib/line/login";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL!));
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/line/callback`;
  const url = getLineLoginUrl(state, redirectUri);

  const cookieStore = await cookies();
  cookieStore.set("line_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(url);
}
