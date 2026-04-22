import type { Database } from "@/lib/supabase/types";

export type CaseRow = Database["public"]["Tables"]["cases"]["Row"];

export type TaskPhase = "P1" | "P2" | "P3" | "P4";
export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export interface TaskDefinition {
  id: string;
  phase: TaskPhase;
  title: string;
  deadlineDays: number | null;    // 死亡日からの日数。nullは期限なし
  deadlineLabel: string;
  urgency: UrgencyLevel;
  assignee: string;               // 誰がやるか
  where: string;                  // どこで行うか
  requiredDocs: string[];         // 必要書類（プレミアム）
  commonMistakes: string[];       // よくあるミス（プレミアム）
  needsProfessional: boolean;     // 専門家推奨フラグ
  professionalType?: string;      // 司法書士・税理士など
  /** この条件がtrueの場合のみタスクを表示 */
  condition?: (c: CaseRow) => boolean;
}

export const TASK_DEFINITIONS: TaskDefinition[] = [
  // ─────────────────────────────────────────────
  // Phase 1: 0〜7日 緊急対応
  // ─────────────────────────────────────────────
  {
    id: "P1-01",
    phase: "P1",
    title: "死亡診断書を受け取り・10部コピーする",
    deadlineDays: 0,
    deadlineLabel: "即時",
    urgency: "critical",
    assignee: "喪主",
    where: "病院・医師",
    requiredDocs: [],
    commonMistakes: ["コピーを少なくしか取らない（後で各機関に提出するため10部以上必要）", "再発行ができない場合があるので原本は大切に保管"],
    needsProfessional: false,
  },
  {
    id: "P1-02",
    phase: "P1",
    title: "死亡届を市区町村に提出する",
    deadlineDays: 7,
    deadlineLabel: "7日以内",
    urgency: "critical",
    assignee: "喪主・同居親族",
    where: "死亡地・本籍地・届出人住所地の市区町村窓口",
    requiredDocs: ["死亡診断書（死亡届と一体）", "届出人の印鑑"],
    commonMistakes: ["提出後は死亡届のコピーが取れなくなるため、事前にコピーしておく"],
    needsProfessional: false,
  },
  {
    id: "P1-03",
    phase: "P1",
    title: "火葬許可証・埋葬許可証を保管する",
    deadlineDays: 7,
    deadlineLabel: "死亡届と同時",
    urgency: "critical",
    assignee: "喪主",
    where: "市区町村窓口（死亡届提出時に同時申請）",
    requiredDocs: [],
    commonMistakes: ["火葬後に埋葬許可証になる。墓地への埋葬時に必要なため紛失注意"],
    needsProfessional: false,
  },
  {
    id: "P1-04",
    phase: "P1",
    title: "年金事務所に受給停止の仮連絡をする",
    deadlineDays: 3,
    deadlineLabel: "なるべく早く",
    urgency: "critical",
    assignee: "家族",
    where: "年金事務所（電話可）",
    requiredDocs: [],
    commonMistakes: ["未手続きで振り込みが続くと後日全額返還請求される（2ヶ月分超えると督促）"],
    needsProfessional: false,
    condition: (c) => c.has_pension,
  },
  {
    id: "P1-05",
    phase: "P1",
    title: "勤務先に死亡・退職の連絡をする",
    deadlineDays: 1,
    deadlineLabel: "即時",
    urgency: "high",
    assignee: "家族",
    where: "故人の勤務先",
    requiredDocs: [],
    commonMistakes: ["死亡退職金・弔慰金・健康保険の埋葬料（5万円）の申請を忘れやすい"],
    needsProfessional: false,
  },

  // ─────────────────────────────────────────────
  // Phase 2: 7〜30日 行政手続き
  // ─────────────────────────────────────────────
  {
    id: "P2-01",
    phase: "P2",
    title: "国民健康保険の資格喪失届を出す",
    deadlineDays: 14,
    deadlineLabel: "14日以内",
    urgency: "high",
    assignee: "家族",
    where: "住所地の市区町村窓口",
    requiredDocs: ["死亡診断書コピー", "故人の国民健康保険証", "届出人の印鑑・身分証"],
    commonMistakes: ["死亡後も保険証を使うと不正利用。保険証は返還する"],
    needsProfessional: false,
  },
  {
    id: "P2-02",
    phase: "P2",
    title: "後期高齢者医療保険の資格喪失届を出す",
    deadlineDays: 14,
    deadlineLabel: "14日以内",
    urgency: "high",
    assignee: "家族",
    where: "市区町村窓口（広域連合の窓口）",
    requiredDocs: ["死亡診断書コピー", "後期高齢者医療保険証"],
    commonMistakes: ["資格喪失後の医療費は全額自己負担になる"],
    needsProfessional: false,
    condition: (c) => {
      // 75歳以上なら後期高齢者医療保険に加入しているはず
      // ここでは「年金受給者」フラグで代替
      return c.has_pension;
    },
  },
  {
    id: "P2-03",
    phase: "P2",
    title: "年金受給権者死亡届を提出する",
    deadlineDays: 14,
    deadlineLabel: "14日以内",
    urgency: "critical",
    assignee: "相続人代表",
    where: "年金事務所（郵送可）",
    requiredDocs: ["年金証書", "死亡診断書コピー", "届出人の身分証"],
    commonMistakes: ["配偶者が遺族年金を受けられる場合は別途申請（早めに確認する）"],
    needsProfessional: false,
    condition: (c) => c.has_pension,
  },
  {
    id: "P2-04",
    phase: "P2",
    title: "未支給年金を請求する",
    deadlineDays: null,
    deadlineLabel: "5年以内（早めに）",
    urgency: "medium",
    assignee: "生計同一の遺族",
    where: "年金事務所",
    requiredDocs: ["年金証書", "死亡診断書コピー", "生計同一証明書", "請求者の通帳"],
    commonMistakes: ["平均3〜4ヶ月分が未支給。相続財産でなく遺族固有の請求権のため忘れやすい"],
    needsProfessional: false,
    condition: (c) => c.has_pension,
  },
  {
    id: "P2-05",
    phase: "P2",
    title: "健康保険（社保）の埋葬料5万円を申請する",
    deadlineDays: 30,
    deadlineLabel: "2年以内（1ヶ月以内推奨）",
    urgency: "medium",
    assignee: "被扶養者・喪主",
    where: "加入していた健康保険組合",
    requiredDocs: ["死亡診断書コピー", "埋葬を行ったことがわかる領収書", "請求者の身分証・通帳"],
    commonMistakes: ["期限は2年と長いが忘れやすい。被用者保険加入者なら必ず申請する"],
    needsProfessional: false,
  },
  {
    id: "P2-06",
    phase: "P2",
    title: "世帯主変更届を提出する",
    deadlineDays: 14,
    deadlineLabel: "14日以内",
    urgency: "high",
    assignee: "新世帯主候補",
    where: "住所地の市区町村窓口",
    requiredDocs: ["届出人の身分証", "印鑑"],
    commonMistakes: ["同世帯に成人が1人だけの場合は不要。要否の判断ミスが多い"],
    needsProfessional: false,
    condition: (c) => c.heir_count > 1,
  },

  // ─────────────────────────────────────────────
  // Phase 3: 1〜3ヶ月 相続手続き（コア）
  // ─────────────────────────────────────────────
  {
    id: "P3-01",
    phase: "P3",
    title: "自筆証書遺言の検認を家庭裁判所に申立てる",
    deadlineDays: 30,
    deadlineLabel: "速やかに（開封前に必須）",
    urgency: "critical",
    assignee: "相続人",
    where: "故人の最後の住所地の家庭裁判所",
    requiredDocs: ["遺言書（封印したまま）", "故人の戸籍謄本", "相続人全員の戸籍謄本"],
    commonMistakes: ["検認前に勝手に開封すると5万円以下の過料。公正証書遺言は検認不要"],
    needsProfessional: true,
    professionalType: "司法書士",
    condition: (c) => c.has_will === "handwritten",
  },
  {
    id: "P3-02",
    phase: "P3",
    title: "財産（プラス・マイナス）を全て調査する",
    deadlineDays: 60,
    deadlineLabel: "3ヶ月以内（相続放棄判断前）",
    urgency: "critical",
    assignee: "代表相続人",
    where: "法務局・金融機関・税務署・保険会社など",
    requiredDocs: ["故人の通帳・証書類", "不動産の権利証", "固定資産税納税通知書"],
    commonMistakes: ["借金・連帯保証債務の見落としが相続放棄ミスの最大原因"],
    needsProfessional: false,
  },
  {
    id: "P3-03",
    phase: "P3",
    title: "相続放棄するか判断する（期限3ヶ月）",
    deadlineDays: 90,
    deadlineLabel: "死亡を知った日から3ヶ月",
    urgency: "critical",
    assignee: "各相続人個別",
    where: "家庭裁判所（故人の最後の住所地）",
    requiredDocs: ["相続放棄申述書", "故人の戸籍謄本", "申述人の戸籍謄本", "収入印紙800円"],
    commonMistakes: [
      "期限を1日でも過ぎると原則として相続放棄は不可",
      "相続人全員ではなく個人単位で放棄できる",
      "3ヶ月の伸長を家庭裁判所に申請することも可能（早めに相談を）",
    ],
    needsProfessional: true,
    professionalType: "司法書士・弁護士",
    condition: (c) => c.debt_concern,
  },
  {
    id: "P3-04",
    phase: "P3",
    title: "出生〜死亡の全戸籍謄本を収集する",
    deadlineDays: 90,
    deadlineLabel: "3ヶ月目安",
    urgency: "high",
    assignee: "代表相続人",
    where: "各本籍地の市区町村（郵送請求可）",
    requiredDocs: ["申請書", "手数料（1通450円）", "返信用封筒"],
    commonMistakes: ["転籍が多い場合は10通以上になることも。全ての本籍地を追う必要がある"],
    needsProfessional: false,
  },
  {
    id: "P3-05",
    phase: "P3",
    title: "法定相続情報一覧図を法務局に申請する",
    deadlineDays: null,
    deadlineLabel: "任意（早めに作ると便利）",
    urgency: "medium",
    assignee: "代表相続人",
    where: "法務局（管轄外でも可）",
    requiredDocs: ["故人・相続人全員の戸籍謄本", "住所証明書"],
    commonMistakes: ["一度作ると銀行・税務署・法務局で使い回せるため、先に作ると後の手続きが楽になる"],
    needsProfessional: false,
  },
  {
    id: "P3-06",
    phase: "P3",
    title: "準確定申告を提出する（死亡から4ヶ月以内）",
    deadlineDays: 120,
    deadlineLabel: "死亡翌日から4ヶ月以内",
    urgency: "critical",
    assignee: "相続人全員",
    where: "税務署（e-Tax可）",
    requiredDocs: ["故人の源泉徴収票", "医療費領収書（控除申請する場合）", "相続人全員の印鑑"],
    commonMistakes: [
      "給与所得者でも年度途中の死亡なら準確定申告が必要",
      "医療費控除・還付が発生することもある（見落とし注意）",
    ],
    needsProfessional: true,
    professionalType: "税理士",
  },
  {
    id: "P3-07",
    phase: "P3",
    title: "各金融機関に口座の相続手続きを申請する",
    deadlineDays: 180,
    deadlineLabel: "6ヶ月目安",
    urgency: "high",
    assignee: "相続人（全員の合意が必要）",
    where: "各金融機関の相続窓口",
    requiredDocs: ["戸籍謄本（法定相続情報一覧図で代替可）", "遺産分割協議書", "相続人全員の印鑑証明書"],
    commonMistakes: ["銀行ごとに必要書類が異なる。1行で平均1〜2ヶ月かかる"],
    needsProfessional: false,
  },
  {
    id: "P3-08",
    phase: "P3",
    title: "生命保険金を請求する",
    deadlineDays: 90,
    deadlineLabel: "3年以内（3ヶ月以内推奨）",
    urgency: "high",
    assignee: "受取人",
    where: "各保険会社",
    requiredDocs: ["保険証券", "死亡診断書", "受取人の身分証・通帳"],
    commonMistakes: [
      "生命保険金は遺産ではなく受取人固有の財産（相続手続きと別ルート）",
      "忘れると時効（3年）で権利を失う",
    ],
    needsProfessional: false,
    condition: (c) => c.has_life_insurance,
  },

  // ─────────────────────────────────────────────
  // Phase 4: 3〜12ヶ月 相続税・登記
  // ─────────────────────────────────────────────
  {
    id: "P4-01",
    phase: "P4",
    title: "遺産分割協議書を作成し全員で署名する",
    deadlineDays: null,
    deadlineLabel: "相続税申告前まで（任意）",
    urgency: "high",
    assignee: "相続人全員",
    where: "自作 または 司法書士・行政書士に依頼",
    requiredDocs: ["相続人全員の実印", "印鑑証明書（各1通）"],
    commonMistakes: ["1人でも未参加・拒否だと無効。海外在住者はアポスティーユが必要"],
    needsProfessional: true,
    professionalType: "司法書士・行政書士",
    condition: (c) => c.heir_count > 1,
  },
  {
    id: "P4-02",
    phase: "P4",
    title: "相続登記（不動産名義変更）をする【義務】",
    deadlineDays: 365 * 3,
    deadlineLabel: "3年以内（義務・過料10万円）",
    urgency: "high",
    assignee: "相続する不動産の取得者",
    where: "法務局（不動産所在地の管轄）",
    requiredDocs: ["登記申請書", "遺産分割協議書", "戸籍謄本一式", "固定資産評価証明書", "住民票"],
    commonMistakes: [
      "2024年4月から義務化。過料10万円の罰則あり",
      "複数の不動産は各管轄法務局に別々に申請が必要",
    ],
    needsProfessional: true,
    professionalType: "司法書士",
    condition: (c) => c.has_real_estate,
  },
  {
    id: "P4-03",
    phase: "P4",
    title: "株式・投資信託の名義変更をする",
    deadlineDays: 365,
    deadlineLabel: "6〜12ヶ月目安",
    urgency: "medium",
    assignee: "相続する相続人",
    where: "各証券会社の相続窓口",
    requiredDocs: ["遺産分割協議書", "戸籍謄本", "証券口座の情報"],
    commonMistakes: ["証券会社ごとに手続きが異なる。休眠口座の発見が困難なため通帳・郵便物を要確認"],
    needsProfessional: false,
    condition: (c) => c.has_securities,
  },
  {
    id: "P4-04",
    phase: "P4",
    title: "相続税の申告・納付をする",
    deadlineDays: 300,
    deadlineLabel: "死亡翌日から10ヶ月以内",
    urgency: "critical",
    assignee: "相続人全員",
    where: "税務署（e-Tax可）",
    requiredDocs: ["財産目録", "遺産分割協議書", "各種評価証明書"],
    commonMistakes: [
      "期限1日超えでも延滞税・無申告加算税が発生する",
      "小規模宅地等の特例（最大80%評価減）を申告しないと適用されない",
    ],
    needsProfessional: true,
    professionalType: "相続専門税理士",
  },
];

/** 案件の状況に応じてタスクをフィルタリングする */
export function getApplicableTasks(c: CaseRow): TaskDefinition[] {
  return TASK_DEFINITIONS.filter((t) =>
    t.condition ? t.condition(c) : true
  );
}

/** タスクIDからタスク定義を取得する */
export function getTaskById(id: string): TaskDefinition | undefined {
  return TASK_DEFINITIONS.find((t) => t.id === id);
}

/** 死亡日からの残り日数を計算する */
export function getDaysRemaining(deathDate: string, deadlineDays: number): number {
  const death = new Date(deathDate);
  const deadline = new Date(death);
  deadline.setDate(deadline.getDate() + deadlineDays);
  const today = new Date();
  const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export const PHASE_LABELS: Record<TaskPhase, string> = {
  P1: "第1フェーズ（0〜7日）緊急対応",
  P2: "第2フェーズ（7〜30日）行政手続き",
  P3: "第3フェーズ（1〜3ヶ月）相続手続き",
  P4: "第4フェーズ（3〜12ヶ月）相続税・登記",
};
