import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/lib/supabase/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const update: TablesUpdate<"cases"> = {};

  if ("deceased_name" in body) update.deceased_name = body.deceased_name;
  if ("death_date" in body) update.death_date = body.death_date;
  if ("has_real_estate" in body) update.has_real_estate = body.has_real_estate;
  if ("has_will" in body) update.has_will = body.has_will;
  if ("heir_count" in body) update.heir_count = body.heir_count;
  if ("debt_concern" in body) update.debt_concern = body.debt_concern;
  if ("has_securities" in body) update.has_securities = body.has_securities;
  if ("has_pension" in body) update.has_pension = body.has_pension;
  if ("has_life_insurance" in body) update.has_life_insurance = body.has_life_insurance;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no valid fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("cases")
    .update(update)
    .eq("id", caseId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
