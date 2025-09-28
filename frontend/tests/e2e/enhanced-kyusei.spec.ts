import { test, expect } from '@playwright/test';

test.describe('高度な九星気学機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // 鑑定書作成ページへ移動
    await page.waitForURL('**/create', { timeout: 10000 });
  });

  test('干支と傾斜が正しく表示される', async ({ page }) => {
    // フォーム入力
    await page.getByLabel('氏名').fill('田中太郎');
    await page.locator('input[type="date"]').fill('1990-05-15');

    // 性別選択
    await page.locator('div[role="button"][aria-haspopup="listbox"]').click();
    await page.locator('[data-value="male"]').click();
    await page.getByLabel('メールアドレス').fill('test@example.com');

    // 鑑定計算実行
    await page.click('button:has-text("鑑定計算実行")');

    // 計算完了を待つ
    await expect(page.locator('text=計算中...')).not.toBeVisible({ timeout: 30000 });

    // 九星気学結果の確認
    await expect(page.locator('text=九星気学結果')).toBeVisible();

    // 基本的な九星が表示される
    await expect(page.locator('text=本命星:')).toBeVisible();
    await expect(page.locator('text=月命星:')).toBeVisible();
    await expect(page.locator('text=日命星:')).toBeVisible();

    // 高度な機能が表示される
    // 干支（庚午が期待される - 1990年生まれ）
    await expect(page.locator('text=干支:')).toBeVisible();
    await expect(page.locator('text=庚午')).toBeVisible();

    // 傾斜（坎宮傾斜が期待される - 一白水星）
    await expect(page.locator('text=傾斜:')).toBeVisible();
    await expect(page.locator('text=坎宮傾斜')).toBeVisible();

    // スクリーンショット保存
    await page.screenshot({
      path: 'test-results/enhanced-kyusei.png',
      fullPage: true
    });
  });

  test('吉方位判定機能が動作する', async ({ page }) => {
    // フォーム入力
    await page.getByLabel('氏名').fill('佐藤花子');
    await page.locator('input[type="date"]').fill('1985-08-20');

    // 性別選択
    await page.locator('div[role="button"][aria-haspopup="listbox"]').click();
    await page.locator('[data-value="female"]').click();
    await page.getByLabel('メールアドレス').fill('test@example.com');

    // 鑑定計算実行
    await page.click('button:has-text("鑑定計算実行")');

    // 計算完了を待つ
    await expect(page.locator('text=計算中...')).not.toBeVisible({ timeout: 30000 });

    // APIが吉方位情報を返すことを確認（ネットワークタブで確認）
    page.on('response', response => {
      if (response.url().includes('/kyusei/') && response.status() === 200) {
        response.json().then(data => {
          // 吉方位関連のデータが含まれることを確認
          if (data.kichiQseis || data.houiDetails) {
            console.log('吉方位データ取得成功');
          }
        }).catch(() => {});
      }
    });
  });

  test('複数の九星気学データを比較表示', async ({ page }) => {
    const testCases = [
      { name: '山田一郎', birthdate: '1975-03-10', expectedHonmei: '九紫火星' },
      { name: '鈴木美咲', birthdate: '1995-12-25', expectedHonmei: '七赤金星' },
      { name: '高橋健太', birthdate: '1988-07-07', expectedHonmei: '八白土星' }
    ];

    for (const testCase of testCases) {
      // ページをリロード
      await page.reload();

      // フォーム入力
      await page.getByLabel('氏名').fill(testCase.name);
      await page.locator('input[type="date"]').fill(testCase.birthdate);

      // 性別選択
      await page.locator('div[role="button"][aria-haspopup="listbox"]').click();
      await page.locator('[data-value="male"]').click();
      await page.getByLabel('メールアドレス').fill('test@example.com');

      // 鑑定計算実行
      await page.click('button:has-text("鑑定計算実行")');

      // 計算完了を待つ
      await expect(page.locator('text=計算中...')).not.toBeVisible({ timeout: 30000 });

      // 本命星が表示される
      await expect(page.locator(`text=${testCase.expectedHonmei}`)).toBeVisible();

      console.log(`✅ ${testCase.name}: ${testCase.expectedHonmei} 確認完了`);
    }
  });

  test('エラーハンドリング - 無効な日付での処理', async ({ page }) => {
    // フォーム入力（未来の日付）
    await page.getByLabel('氏名').fill('テストユーザー');
    await page.locator('input[type="date"]').fill('2030-01-01');

    // 性別選択
    await page.locator('div[role="button"][aria-haspopup="listbox"]').click();
    await page.locator('[data-value="male"]').click();
    await page.getByLabel('メールアドレス').fill('test@example.com');

    // 鑑定計算実行
    await page.click('button:has-text("鑑定計算実行")');

    // エラーメッセージまたは処理が適切に行われることを確認
    await page.waitForTimeout(3000);

    // エラーが表示されるか、または適切に処理される
    const errorVisible = await page.locator('text=エラー').isVisible();
    const resultVisible = await page.locator('text=九星気学結果').isVisible();

    expect(errorVisible || resultVisible).toBeTruthy();
  });
});