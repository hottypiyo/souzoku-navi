import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { approveSpecialist, rejectSpecialist } from "./actions";
import type { SpecialistType } from "@/lib/supabase/types";

export const metadata = { title: "専門家審査 — 管理者" };

const TYPE_LABELS: Record<SpecialistType, string> = {
  tax_accountant: "税理士",
  judicial_scrivener: "司法書士",
  administrative_scrivener: "行政書士",
  lawyer: "弁護士",
  social_insurance_labor_consultant: "社労士",
  other: "その他",
};

export default async function AdminSpecialistsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const service = await createServiceClient();
  const { data: specialists } = await service
    .from("specialists")
    .select("*")
    .order("created_at", { ascending: false });

  const pending = specialists?.filter((s) => !s.is_approved) ?? [];
  const approved = specialists?.filter((s) => s.is_approved) ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="font-semibold text-slate-800">管理者 / 専門家審査</span>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">ダッシュボードへ</a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-10">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            審査待ち ({pending.length}件)
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-400">審査待ちはありません</p>
          ) : (
            <div className="space-y-3">
              {pending.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">
                          {TYPE_LABELS[s.type as SpecialistType]}
                        </span>
                        <span className="font-semibold text-slate-800">{s.name}</span>
                        {s.office_name && (
                          <span className="text-sm text-slate-500">{s.office_name}</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {s.prefecture}{s.city ? ` ${s.city}` : ""} | {s.email}
                      </p>
                      {s.phone && <p className="text-xs text-slate-500">TEL: {s.phone}</p>}
                      {s.website && (
                        <a
                          href={s.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {s.website}
                        </a>
                      )}
                      {s.bio && (
                        <p className="mt-2 text-sm text-slate-600">{s.bio}</p>
                      )}
                      {s.specialties && s.specialties.length > 0 && (
                        <p className="mt-1 text-xs text-slate-400">{s.specialties.join("、")}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-300">
                        申請日: {new Date(s.created_at!).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <form action={approveSpecialist}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                        承認
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            掲載中 ({approved.length}件)
          </h2>
          {approved.length === 0 ? (
            <p className="text-sm text-slate-400">掲載中の専門家はいません</p>
          ) : (
            <div className="space-y-3">
              {approved.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">
                          {TYPE_LABELS[s.type as SpecialistType]}
                        </span>
                        <span className="font-semibold text-slate-800">{s.name}</span>
                        {s.office_name && (
                          <span className="text-sm text-slate-500">{s.office_name}</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {s.prefecture}{s.city ? ` ${s.city}` : ""} | {s.email}
                      </p>
                    </div>
                    <form action={rejectSpecialist}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:border-red-200 hover:text-red-600">
                        掲載停止
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
