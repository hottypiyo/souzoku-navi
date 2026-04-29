import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SpecialistType } from "@/lib/supabase/types";

export const metadata = { title: "専門家を探す" };

const TYPE_LABELS: Record<SpecialistType, string> = {
  tax_accountant: "税理士",
  judicial_scrivener: "司法書士",
  administrative_scrivener: "行政書士",
  lawyer: "弁護士",
  social_insurance_labor_consultant: "社会保険労務士",
  other: "その他",
};

const TYPE_COLORS: Record<SpecialistType, string> = {
  tax_accountant: "bg-blue-50 text-blue-700",
  judicial_scrivener: "bg-green-50 text-green-700",
  administrative_scrivener: "bg-purple-50 text-purple-700",
  lawyer: "bg-orange-50 text-orange-700",
  social_insurance_labor_consultant: "bg-yellow-50 text-yellow-700",
  other: "bg-slate-50 text-slate-700",
};

const EXTERNAL_DIRECTORIES = [
  {
    name: "税理士ドットコム",
    type: "税理士",
    desc: "相続税に強い税理士を都道府県・分野から検索",
    url: "https://www.zeiri4.com/c_1/",
  },
  {
    name: "司法書士ドットコム",
    type: "司法書士",
    desc: "相続登記・遺産整理の司法書士を検索",
    url: "https://www.shiho-shoshi.net/",
  },
  {
    name: "相続弁護士ナビ",
    type: "弁護士",
    desc: "遺産分割・相続トラブルの弁護士を検索",
    url: "https://souzoku-pro.info/",
  },
  {
    name: "行政書士ドットコム",
    type: "行政書士",
    desc: "相続手続き・戸籍収集の行政書士を検索",
    url: "https://www.gyosei.or.jp/",
  },
];

export default async function SpecialistsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, premium_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (profile.premium_expires_at === null ||
      new Date(profile.premium_expires_at) > new Date());

  if (!isPremium) {
    redirect("/upgrade");
  }

  const { data: specialists } = await supabase
    .from("specialists")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <a href="/dashboard" className="text-base font-semibold text-slate-800">相続手続きナビ</a>
          </div>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">ダッシュボードへ</a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-xl font-bold text-slate-800">専門家を探す</h1>
        <p className="mb-8 text-sm text-slate-500">
          相続手続きをサポートする税理士・司法書士・行政書士・弁護士をご紹介します。
        </p>

        {/* 登録済み専門家 */}
        {specialists && specialists.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              登録済み専門家
            </h2>
            <div className="space-y-4">
              {specialists.map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[s.type as SpecialistType]}`}>
                          {TYPE_LABELS[s.type as SpecialistType]}
                        </span>
                        <h3 className="font-semibold text-slate-800">{s.name}</h3>
                        {s.office_name && (
                          <span className="text-sm text-slate-500">{s.office_name}</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {s.prefecture}{s.city ? ` ${s.city}` : ""}
                      </p>
                      {s.bio && (
                        <p className="mt-2 text-sm text-slate-600">{s.bio}</p>
                      )}
                      {s.specialties && s.specialties.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {s.specialties.map((sp: string) => (
                            <span key={sp} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {sp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col gap-2 text-right">
                      {s.phone && (
                        <a href={`tel:${s.phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                          {s.phone}
                        </a>
                      )}
                      {s.website && (
                        <a
                          href={s.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          ウェブサイト →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="mb-10 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">現在、登録済みの専門家はいません。</p>
            <p className="mt-1 text-xs text-slate-400">下記の外部ディレクトリをご活用ください。</p>
          </div>
        )}

        {/* 外部ディレクトリ */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            外部の専門家検索サービス
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {EXTERNAL_DIRECTORIES.map((d) => (
              <a
                key={d.name}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-slate-800">{d.name}</span>
                  <span className="text-xs text-slate-400">{d.type}</span>
                </div>
                <p className="text-sm text-slate-500">{d.desc}</p>
                <span className="mt-3 inline-block text-xs font-medium text-blue-600">
                  サイトへ →
                </span>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-xl bg-blue-50 border border-blue-100 p-5 text-center">
          <p className="text-sm font-medium text-blue-800">専門家の方へ</p>
          <p className="mt-1 text-xs text-blue-600">
            税理士・司法書士・行政書士・弁護士の方は、無料で専門家ディレクトリに掲載できます。
          </p>
          <a
            href="/specialists/register"
            className="mt-3 inline-block rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            掲載を申請する
          </a>
        </div>
      </main>
    </div>
  );
}
