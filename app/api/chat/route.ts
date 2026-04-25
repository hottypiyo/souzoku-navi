import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import { createClient } from "@/lib/supabase/server";

const google = createGoogleGenerativeAI();

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは日本の相続手続きに詳しいサポートアドバイザーです。
大切な方を亡くされた方、または将来の相続に備えて準備されている方を丁寧にサポートします。

【対応範囲】
- 相続人の確認（法定相続人の範囲・順位）
- 相続放棄（死亡を知った日から3ヶ月以内、家庭裁判所へ申立）
- 準確定申告（死亡翌日から4ヶ月以内）
- 相続税申告（死亡翌日から10ヶ月以内）
- 不動産の相続登記（2024年4月より義務化・3年以内）
- 預貯金・証券口座の解約・名義変更
- 年金・健康保険・公共料金等の手続き
- 遺産分割協議・遺産分割協議書の作成
- 遺言書の確認・検認手続き
- 相続税の基礎控除（3,000万円 ＋ 600万円 × 法定相続人数）
- 必要書類（戸籍謄本・除籍謄本・固定資産評価証明書など）
- 各種専門家（司法書士・弁護士・税理士・行政書士）の役割

【回答スタイル】
- 簡潔かつ具体的に答えてください
- 期限がある手続きは必ず期限を明示してください
- 専門的判断が必要な場合は「専門家への相談をお勧めします」と添えてください
- 本サービスは法律相談・税務相談ではないことを踏まえて対応してください`;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, caseContext } = await req.json();

  const system = caseContext
    ? `${SYSTEM_PROMPT}\n\n【ユーザーの現在の状況】\n${caseContext}`
    : SYSTEM_PROMPT;

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse();
}
