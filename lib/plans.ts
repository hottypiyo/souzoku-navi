import type { PlanType } from "@/lib/supabase/types";

/**
 * フリーミアム設計
 *
 * Free:
 *  - 状況ヒアリング（5問）
 *  - タスクリスト表示（Phase1-4の一覧・期限表示）
 *  - 直近3件のタスクの詳細閲覧
 *  - 緊急期限アラート（相続放棄3ヶ月等）の閲覧
 *
 * Premium (月額 or 年額):
 *  - 全タスクの詳細閲覧（必要書類・窓口・持参物）
 *  - タスク完了チェック機能
 *  - 期限リマインダー通知（メール）
 *  - 士業マッチング（緊急度別推薦）
 *  - 状況更新（後から遺言書が見つかった等）
 *  - 複数案件管理
 */

export const PLANS = {
  free: {
    name: "無料プラン",
    price: 0,
    maxCases: 1,
    taskDetailLimit: 3,    // 詳細を見られるタスク数
    features: {
      taskList: true,
      deadlineView: true,
      taskDetail: false,   // 制限付き（limitまで）
      taskCheck: false,
      reminderNotification: false,
      professionalMatch: false,
      multiCase: false,
    },
  },
  premium: {
    name: "プレミアムプラン",
    monthlyPrice: 980,
    yearlyPrice: 9800,     // 約2ヶ月分お得
    maxCases: 10,
    taskDetailLimit: Infinity,
    features: {
      taskList: true,
      deadlineView: true,
      taskDetail: true,
      taskCheck: true,
      reminderNotification: true,
      professionalMatch: true,
      multiCase: true,
    },
  },
} as const;

export type PlanFeature = keyof typeof PLANS.premium.features;

export function canAccess(plan: PlanType, feature: PlanFeature): boolean {
  return PLANS[plan].features[feature];
}

export function isPremium(plan: PlanType): boolean {
  return plan === "premium";
}

export function getUpgradeMessage(feature: PlanFeature): string {
  const messages: Record<PlanFeature, string> = {
    taskList: "",
    deadlineView: "",
    taskDetail: "タスクの詳細（必要書類・窓口・注意点）はプレミアムプランで確認できます",
    taskCheck: "タスクの完了チェックはプレミアムプランで利用できます",
    reminderNotification: "期限リマインダーはプレミアムプランで利用できます",
    professionalMatch: "専門家への相談はプレミアムプランで利用できます",
    multiCase: "複数案件の管理はプレミアムプランで利用できます",
  };
  return messages[feature];
}
