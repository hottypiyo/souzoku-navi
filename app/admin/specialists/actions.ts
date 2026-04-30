"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function guardAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard");
  }
}

export async function approveSpecialist(formData: FormData) {
  await guardAdmin();
  const id = formData.get("id") as string;
  const service = await createServiceClient();
  await service.from("specialists").update({ is_approved: true }).eq("id", id);
  revalidatePath("/admin/specialists");
}

export async function rejectSpecialist(formData: FormData) {
  await guardAdmin();
  const id = formData.get("id") as string;
  const service = await createServiceClient();
  await service.from("specialists").update({ is_approved: false }).eq("id", id);
  revalidatePath("/admin/specialists");
}
