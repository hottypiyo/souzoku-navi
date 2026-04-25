import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForProfile } from "@/lib/line/login";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(`${appUrl}/settings?line=error`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("line_oauth_state")?.value;
  cookieStore.delete("line_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${appUrl}/settings?line=error`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const redirectUri = `${appUrl}/api/auth/line/callback`;

  try {
    const { userId } = await exchangeCodeForProfile(code, redirectUri);

    await supabase
      .from("profiles")
      .update({ line_user_id: userId })
      .eq("id", user.id);

    return NextResponse.redirect(`${appUrl}/settings?line=connected`);
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?line=error`);
  }
}
