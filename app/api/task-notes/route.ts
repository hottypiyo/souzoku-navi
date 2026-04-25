import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { caseId, taskId, notes } = await request.json();
  if (!caseId || !taskId) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await supabase.from("task_progress").upsert({
    case_id: caseId,
    task_id: taskId,
    status: "pending",
    notes: notes ?? null,
  }, { onConflict: "case_id,task_id" });

  return NextResponse.json({ ok: true });
}
