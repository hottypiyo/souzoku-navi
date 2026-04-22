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
