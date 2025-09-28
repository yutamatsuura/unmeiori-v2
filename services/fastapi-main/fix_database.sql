-- データベース修正用SQL
-- 1. client_nameを client_surname と client_given_name に分離
-- 2. kantei_commentカラムを追加

-- まず新しいカラムを追加
ALTER TABLE kantei_records ADD COLUMN IF NOT EXISTS client_surname VARCHAR;
ALTER TABLE kantei_records ADD COLUMN IF NOT EXISTS client_given_name VARCHAR;
ALTER TABLE kantei_records ADD COLUMN IF NOT EXISTS kantei_comment TEXT;

-- 既存のclient_nameをsurnameとgiven_nameに分割
-- (既存データがある場合は手動で分割が必要)
UPDATE kantei_records
SET
  client_surname = SPLIT_PART(client_name, ' ', 1),
  client_given_name = CASE
    WHEN SPLIT_PART(client_name, ' ', 2) = '' THEN SPLIT_PART(client_name, ' ', 1)
    ELSE SPLIT_PART(client_name, ' ', 2)
  END
WHERE client_surname IS NULL AND client_name IS NOT NULL;

-- 新しいカラムを NOT NULL に設定（既存データがある場合は空文字で埋める）
UPDATE kantei_records SET client_surname = '' WHERE client_surname IS NULL;
UPDATE kantei_records SET client_given_name = '' WHERE client_given_name IS NULL;

-- NOT NULL制約を追加
ALTER TABLE kantei_records ALTER COLUMN client_surname SET NOT NULL;
ALTER TABLE kantei_records ALTER COLUMN client_given_name SET NOT NULL;

-- 古いclient_nameカラムは保持（安全のため）
-- ALTER TABLE kantei_records DROP COLUMN client_name;

-- Alembicのリビジョンテーブルを修正
UPDATE alembic_version SET version_num = 'ba07018db0e3' WHERE version_num = '1d6f1ba1b972';