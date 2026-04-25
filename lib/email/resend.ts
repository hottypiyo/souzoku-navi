import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

interface ReminderEmailParams {
  to: string;
  deceasedName: string | null;
  tasks: Array<{ title: string; daysRemaining: number }>;
  dashboardUrl: string;
}

export async function sendReminderEmail({
  to,
  deceasedName,
  tasks,
  dashboardUrl,
}: ReminderEmailParams): Promise<void> {
  const subject = deceasedName
    ? `${deceasedName}さんの相続手続き期限のお知らせ`
    : "相続手続き期限のお知らせ";

  const taskRows = tasks
    .map((t) => {
      const urgency = t.daysRemaining <= 1 ? "⚠️" : t.daysRemaining <= 3 ? "🔔" : "📋";
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${urgency} ${t.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:${t.daysRemaining <= 3 ? "#dc2626" : "#ea580c"}">残り${t.daysRemaining}日</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <div style="background:#2563eb;padding:24px 32px;">
      <h1 style="margin:0;color:#fff;font-size:18px;font-weight:600;">相続手続きナビ</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 24px;color:#334155;font-size:15px;">期限が近いタスクがあります。確認をお願いします。</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#64748b;">タスク</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;color:#64748b;">期限</th>
          </tr>
        </thead>
        <tbody>${taskRows}</tbody>
      </table>
      <div style="margin-top:28px;text-align:center;">
        <a href="${dashboardUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;">ダッシュボードを開く</a>
      </div>
    </div>
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
        本サービスは情報提供を目的としており、法律相談・税務相談ではありません。<br>
        通知設定の変更は<a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#2563eb;">設定ページ</a>から行えます。
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: "相続手続きナビ <noreply@souzoku-navi.com>",
    to,
    subject,
    html,
  });
}
