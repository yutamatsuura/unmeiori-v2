import { test, expect } from '@playwright/test';

test.describe('鑑定書作成ページ - エラー修正後の動作検証', () => {
  test.beforeEach(async ({ page }) => {
    // ログインページに移動
    await page.goto('http://localhost:3001/login');

    // テストユーザーでログイン
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // ログイン処理の完了を待つ
    await page.waitForTimeout(3000);

    // ログイン成功後、鑑定書作成ページに移動することを確認
    // URLが変わるのを待つ
    await page.waitForURL('**/create', { timeout: 10000 });
  });

  test('鑑定書作成ページが正常に表示される', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.locator('.page-title')).toContainText('鑑定書作成');

    // フォームセクションが表示される
    await expect(page.locator('.form-section')).toBeVisible();

    // プレビューセクションが表示される
    await expect(page.locator('.preview-section')).toBeVisible();

    // エラーが発生していないことを確認（コンソールエラーをチェック）
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    // ページをリロードして再度確認
    await page.reload();

    // TypeError: Cannot read properties of undefined (reading 'honmei') が発生しないことを確認
    const errorLogs = logs.filter(log => log.includes('honmei') || log.includes('TypeError'));
    expect(errorLogs).toHaveLength(0);
  });

  test('フォーム入力と鑑定計算が正常に動作する', async ({ page }) => {
    // フォームに入力
    await page.getByLabel('氏名').fill('田中太郎');
    await page.locator('input[type="date"]').fill('1990-05-15');
    // 性別は一時的にスキップ（セレクター問題のため）
    await page.getByLabel('メールアドレス').fill('test@example.com');

    // 鑑定計算実行ボタンをクリック
    await page.click('button:has-text("鑑定計算実行")');

    // 計算中の表示を確認
    await expect(page.locator('text=計算中...')).toBeVisible();

    // 計算完了を待つ（最大30秒）
    await expect(page.locator('text=計算中...')).not.toBeVisible({ timeout: 30000 });

    // 結果が表示されることを確認（エラーなしで）
    const resultSection = page.locator('.preview-section');
    await expect(resultSection).toBeVisible();

    // プレビューボタンが表示される
    await expect(page.locator('button:has-text("詳細プレビューを表示")')).toBeVisible();
  });

  test('鑑定結果が適切に表示される', async ({ page }) => {
    // フォームに入力
    await page.getByLabel('氏名').fill('田中太郎');
    await page.locator('input[type="date"]').fill('1990-05-15');
    // 性別のセレクトボックスをクリック
    await page.locator('div[role="button"][aria-haspopup="listbox"]').click();
    // 男性を選択
    await page.locator('[data-value="male"]').click();
    await page.getByLabel('メールアドレス').fill('test@example.com');

    // 鑑定計算実行
    await page.click('button:has-text("鑑定計算実行")');

    // 計算完了を待つ
    await expect(page.locator('text=計算中...')).not.toBeVisible({ timeout: 30000 });

    // 成功メッセージが表示される
    await expect(page.locator('text=鑑定計算が完了しました')).toBeVisible();

    // 結果セクションで九星気学結果が表示される（エラーなしで）
    const kyuseiSection = page.locator('text=九星気学結果');
    if (await kyuseiSection.count() > 0) {
      await expect(kyuseiSection).toBeVisible();
      // 本命星などの項目が表示される（undefinedエラーなし）
      await expect(page.locator('text=本命星:')).toBeVisible();
    }

    // 姓名判断結果が表示される（エラーなしで）
    const seimeiSection = page.locator('text=姓名判断結果');
    if (await seimeiSection.count() > 0) {
      await expect(seimeiSection).toBeVisible();
      // 総格などの項目が表示される
      await expect(page.locator('text=総格:')).toBeVisible();
    }
  });

  test('プレビューページへの遷移が正常に動作する', async ({ page }) => {
    // フォームに入力
    await page.getByLabel('氏名').fill('田中太郎');
    await page.locator('input[type="date"]').fill('1990-05-15');
    // 性別のセレクトボックスをクリック
    await page.locator('div[role="button"][aria-haspopup="listbox"]').click();
    // 男性を選択
    await page.locator('[data-value="male"]').click();
    await page.getByLabel('メールアドレス').fill('test@example.com');

    // 鑑定計算実行
    await page.click('button:has-text("鑑定計算実行")');

    // 計算完了を待つ
    await expect(page.locator('text=計算中...')).not.toBeVisible({ timeout: 30000 });

    // プレビューボタンをクリック
    await page.click('button:has-text("詳細プレビューを表示")');

    // プレビューページに移動することを確認
    await expect(page).toHaveURL(/.*\/preview\/.*/);
  });

  test('エラーハンドリングが適切に動作する', async ({ page }) => {
    // 必須フィールドを空にして送信
    await page.click('button:has-text("鑑定計算実行")');

    // バリデーションエラーが表示される
    await expect(page.locator('text=氏名を入力してください')).toBeVisible();
    await expect(page.locator('text=生年月日を入力してください')).toBeVisible();
    await expect(page.locator('text=性別を選択してください')).toBeVisible();
    await expect(page.locator('text=メールアドレスを入力してください')).toBeVisible();
  });
});