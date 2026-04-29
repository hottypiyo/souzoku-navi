import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getApplicableTasks, getDaysRemaining } from "@/lib/tasks/definitions";
import { sendReminderEmail } from "@/lib/email/resend";
import { sendLineMessage, buildReminderMessage } from "@/lib/line/messaging";
import type { Database } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const REMINDER_DAYS = [7, 3, 1];

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: Request) {
  // Vercel Cron は Authorization: Bearer <CRON_SECRET> を送る
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // プレミアムユーザーを全件取得
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, line_user_id, notify_email, notify_line")
    .eq("plan", "premium");

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  let emailsSent = 0;
  let linesSent = 0;

  for (const profile of profiles ?? []) {
    const shouldEmail = profile.notify_email && !!profile.email;
    const shouldLine = profile.notify_line && !!profile.line_user_id;
    if (!shouldEmail && !shouldLine) continue;

    // ユーザーの案件を取得（通常モードのみ・death_dateがあるもの）
    const { data: cases } = await supabaseAdmin
      .from("cases")
      .select("*")
      .eq("user_id", profile.id)
      .eq("mode", "active")
      .not("death_date", "is", null);

    if (!cases || cases.length === 0) continue;

    // 完了済みタスクを取得
    const caseIds = cases.map((c) => c.id);
    const { data: completedProgress } = await supabaseAdmin
      .from("task_progress")
      .select("case_id, task_id")
      .in("case_id", caseIds)
      .eq("status", "completed");

    const completedSet = new Set(
      (completedProgress ?? []).map((p) => `${p.case_id}:${p.task_id}`),
    );

    // 期限が REMINDER_DAYS のいずれかに該当するタスクを収集
    const reminderTasks: Array<{ title: string; daysRemaining: number }> = [];

    for (const c of cases) {
      const tasks = getApplicableTasks(c);
      for (const task of tasks) {
        if (task.deadlineDays === null) continue;
        if (completedSet.has(`${c.id}:${task.id}`)) continue;

        const remaining = getDaysRemaining(c.death_date!, task.deadlineDays);
        if (REMINDER_DAYS.includes(remaining)) {
          reminderTasks.push({ title: task.title, daysRemaining: remaining });

          // LINEはタスク単位で1件ずつ送信
          if (shouldLine) {
            try {
              await sendLineMessage(profile.line_user_id!, [
                buildReminderMessage(c.deceased_name, task.title, remaining),
              ]);
              linesSent++;
            } catch (e) {
              console.error(`LINE send failed for user ${profile.id}:`, e);
            }
          }
        }
      }
    }

    // メールは1通にまとめて送信
    if (shouldEmail && reminderTasks.length > 0) {
      try {
        await sendReminderEmail({
          to: profile.email!,
          deceasedName: cases[0].deceased_name,
          tasks: reminderTasks,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });
        emailsSent++;
      } catch (e) {
        console.error(`Email send failed for user ${profile.id}:`, e);
      }
    }
  }

  return NextResponse.json({ emailsSent, linesSent });
}
