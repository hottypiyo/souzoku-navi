import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { SpecialistType } from "@/lib/supabase/types";

const VALID_TYPES: SpecialistType[] = [
  "tax_accountant",
  "judicial_scrivener",
  "administrative_scrivener",
  "lawyer",
];

export async function POST(request: Request) {
  const body = await request.json();
  const { name, type, office_name, prefecture, city, email, phone, website, bio, specialties } = body;

  if (!name || !type || !prefecture || !email) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "資格区分が不正です" }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { error } = await supabase.from("specialists").insert({
    name,
    type,
    office_name: office_name || null,
    prefecture,
    city: city || null,
    email,
    phone: phone || null,
    website: website || null,
    bio: bio || null,
    specialties: specialties?.length > 0 ? specialties : null,
  });

  if (error) {
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
