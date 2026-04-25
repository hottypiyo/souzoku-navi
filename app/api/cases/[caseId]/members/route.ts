import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: caseData } = await supabase.from("cases").select("id").eq("id", caseId).eq("user_id", user.id).single();
  if (!caseData) return NextResponse.json({ error: "not found" }, { status: 404 });

  const service = await createServiceClient();
  const { data: members } = await service.from("case_members").select("id, invited_email, joined_at, invited_at").eq("case_id", caseId).order("invited_at");

  return NextResponse.json({ members: members ?? [] });
}
