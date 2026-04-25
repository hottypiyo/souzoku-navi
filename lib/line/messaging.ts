const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

export async function sendLineMessage(
  lineUserId: string,
  messages: LineMessage[],
): Promise<void> {
  const res = await fetch(LINE_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to: lineUserId, messages }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LINE push failed: ${res.status} ${body}`);
  }
}

export interface LineMessage {
  type: "text";
  text: string;
}

export function buildReminderMessage(
  deceasedName: string | null,
  taskTitle: string,
  daysRemaining: number,
): LineMessage {
  const subject = deceasedName ? `${deceasedName}さんの相続` : "相続手続き";
  const urgency =
    daysRemaining <= 1
      ? "⚠️ 明日が期限です！"
      : daysRemaining <= 3
        ? "🔔 あと3日です"
        : "📋 期限が近づいています";

  return {
    type: "text",
    text: [
      `【相続手続きナビ】${urgency}`,
      "",
      `${subject}のタスクの期限が迫っています。`,
      "",
      `📌 ${taskTitle}`,
      `⏰ 残り${daysRemaining}日`,
      "",
      "ダッシュボードで詳細を確認してください。",
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    ].join("\n"),
  };
}
