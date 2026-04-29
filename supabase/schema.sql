-- 相続手続きナビ — Supabase スキーマ

-- プロフィール（認証ユーザーと1:1）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  premium_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ユーザーが入力した相続案件（1ユーザーにつき複数案件可）
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'active' CHECK (mode IN ('active', 'preparation')),
  user_role TEXT NOT NULL DEFAULT 'child' CHECK (user_role IN ('child', 'spouse', 'parent', 'sibling', 'self', 'other')),
  deceased_name TEXT,
  death_date DATE,
  has_real_estate BOOLEAN NOT NULL DEFAULT false,
  has_will TEXT NOT NULL DEFAULT 'unknown' CHECK (has_will IN ('none', 'notarized', 'handwritten', 'unknown')),
  heir_count INTEGER NOT NULL DEFAULT 1,
  debt_concern BOOLEAN NOT NULL DEFAULT false,
  has_securities BOOLEAN NOT NULL DEFAULT false,
  has_pension BOOLEAN NOT NULL DEFAULT false,
  has_life_insurance BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own cases" ON cases FOR ALL USING (auth.uid() = user_id);

-- タスクの完了状態
CREATE TABLE IF NOT EXISTS task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, task_id)
);

ALTER TABLE task_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own task_progress" ON task_progress
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM cases WHERE id = task_progress.case_id)
  );

-- プロフィール自動作成トリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER touch_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER touch_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER touch_task_progress_updated_at BEFORE UPDATE ON task_progress FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- profiles に通知設定・LINE連携カラムを追加（初期定義に含まれていなかった分）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS line_user_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_email BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_line BOOLEAN NOT NULL DEFAULT false;

-- ケース共有メンバー（招待制）
CREATE TABLE IF NOT EXISTS case_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invite_token UUID NOT NULL DEFAULT gen_random_uuid(),
  invited_at TIMESTAMPTZ,
  invite_expires_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  UNIQUE(case_id, invited_email)
);

ALTER TABLE case_members ENABLE ROW LEVEL SECURITY;
-- ケース所有者はメンバー一覧を全操作できる
CREATE POLICY "Case owners can manage members" ON case_members FOR ALL
  USING (auth.uid() = (SELECT user_id FROM cases WHERE id = case_members.case_id));
-- 招待を受けたユーザーは自分の行を参照できる（招待受諾フローで使用）
CREATE POLICY "Invited users can view own membership" ON case_members FOR SELECT
  USING (auth.uid() = user_id);

-- 財産一覧表（プレミアム機能）
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  name TEXT NOT NULL,
  institution TEXT,
  estimated_value NUMERIC,
  notes TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
-- ケース所有者・参加済みメンバーが参照可能
CREATE POLICY "Case owners and members can view assets" ON assets FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM cases WHERE id = assets.case_id)
    OR EXISTS (
      SELECT 1 FROM case_members
      WHERE case_id = assets.case_id AND user_id = auth.uid() AND joined_at IS NOT NULL
    )
  );
-- 書き込みはケース所有者のみ
CREATE POLICY "Case owners can insert assets" ON assets FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM cases WHERE id = assets.case_id));
CREATE POLICY "Case owners can update assets" ON assets FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM cases WHERE id = assets.case_id));
CREATE POLICY "Case owners can delete assets" ON assets FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM cases WHERE id = assets.case_id));

CREATE TRIGGER touch_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- 専門家ディレクトリ（管理者承認制）
CREATE TABLE IF NOT EXISTS specialists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'lawyer', 'judicial_scrivener', 'tax_accountant',
    'social_insurance_labor_consultant', 'administrative_scrivener', 'other'
  )),
  office_name TEXT,
  prefecture TEXT NOT NULL,
  city TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  website TEXT,
  bio TEXT,
  specialties TEXT[],
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
-- 承認済み専門家のみ一般ユーザーに公開
CREATE POLICY "Anyone can view approved specialists" ON specialists FOR SELECT
  USING (is_approved = true);
