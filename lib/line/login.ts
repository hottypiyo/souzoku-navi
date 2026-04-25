const LINE_AUTHORIZE_URL = "https://access.line.me/oauth2/v2.1/authorize";
const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
const LINE_PROFILE_URL = "https://api.line.me/v2/profile";

export function getLineLoginUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
    redirect_uri: redirectUri,
    state,
    scope: "profile",
  });
  return `${LINE_AUTHORIZE_URL}?${params}`;
}

export async function exchangeCodeForProfile(
  code: string,
  redirectUri: string,
): Promise<{ userId: string; displayName: string }> {
  const tokenRes = await fetch(LINE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
      client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET!,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`LINE token exchange failed: ${tokenRes.status}`);
  }

  const { access_token } = await tokenRes.json() as { access_token: string };

  const profileRes = await fetch(LINE_PROFILE_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) {
    throw new Error(`LINE profile fetch failed: ${profileRes.status}`);
  }

  const { userId, displayName } = await profileRes.json() as {
    userId: string;
    displayName: string;
  };

  return { userId, displayName };
}
