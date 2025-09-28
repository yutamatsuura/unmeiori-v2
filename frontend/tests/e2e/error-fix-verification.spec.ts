import { test, expect } from '@playwright/test';

test.describe('エラー修正確認テスト', () => {
  test('HTML ネスティングエラーと process 未定義エラーが解消されている', async ({ page }) => {
    // コンソールエラーを収集
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // ログインページへ移動
    await page.goto('http://localhost:3001/login');

    // タイトルが表示される
    await expect(page).toHaveTitle(/鑑定書楽々作成ツール/);

    // ログイン
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // 鑑定書作成ページへの遷移を待つ（エラーが出てもタイムアウトしない）
    await page.waitForTimeout(3000);

    // 現在のURLを確認
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // フォーム入力
    if (currentUrl.includes('/create')) {
      await page.getByLabel('氏名').fill('田中太郎');
      await page.locator('input[type="date"]').fill('1990-05-15');
      await page.getByLabel('メールアドレス').fill('test@example.com');

      // 性別選択（SelectかButtonかによって異なる）
      try {
        // SelectのInputLabelを探す
        const genderLabel = page.locator('label:has-text("性別")');
        if (await genderLabel.isVisible({ timeout: 2000 })) {
          const selectElement = page.locator('select').first();
          if (await selectElement.isVisible({ timeout: 1000 })) {
            await selectElement.selectOption('male');
          } else {
            // MUI Selectの場合
            const muiSelect = page.locator('[role="button"][aria-haspopup="listbox"]').first();
            if (await muiSelect.isVisible({ timeout: 1000 })) {
              await muiSelect.click();
              await page.locator('[data-value="male"]').click();
            }
          }
        }
      } catch (e) {
        console.log('性別選択をスキップ');
      }

      // 鑑定計算実行ボタンをクリック
      await page.click('button:has-text("鑑定計算実行")');

      // 計算処理を待つ
      await page.waitForTimeout(5000);
    }

    // エラーの検証
    const htmlNestingErrors = consoleErrors.filter(err =>
      err.includes('cannot be a descendant of') ||
      err.includes('cannot contain a nested')
    );
    const processErrors = consoleErrors.filter(err =>
      err.includes('process is not defined')
    );

    // エラーがないことを確認
    expect(htmlNestingErrors.length).toBe(0);
    expect(processErrors.length).toBe(0);

    // 重要なエラーがある場合はログ出力
    if (consoleErrors.length > 0) {
      console.log('検出されたコンソールエラー:');
      consoleErrors.forEach(err => console.log('  -', err));
    }

    // スクリーンショットを保存
    await page.screenshot({
      path: 'test-results/error-fix-verification.png',
      fullPage: true
    });
  });

  test('Create ページで九星気学の方位盤が正しく表示される', async ({ page }) => {
    // ログイン
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // 鑑定書作成ページへの遷移を待つ
    await page.waitForTimeout(3000);

    // フォーム入力
    await page.getByLabel('氏名').fill('田中太郎');
    await page.locator('input[type="date"]').fill('1990-05-15');
    await page.getByLabel('メールアドレス').fill('test@example.com');

    // 性別選択
    try {
      const muiSelect = page.locator('[role="button"][aria-haspopup="listbox"]').first();
      if (await muiSelect.isVisible({ timeout: 1000 })) {
        await muiSelect.click();
        await page.locator('[data-value="male"]').click();
      }
    } catch (e) {
      console.log('性別選択をスキップ');
    }

    // 鑑定計算実行
    await page.click('button:has-text("鑑定計算実行")');

    // 計算完了を待つ
    await page.waitForTimeout(8000);

    // 九星気学結果が表示されることを確認
    await expect(page.locator('text=九星気学結果')).toBeVisible({ timeout: 10000 });

    // 本命星が表示される
    await expect(page.locator('text=本命星')).toBeVisible();

    // 方位盤（SVG）が表示される
    const svgElements = await page.locator('svg').count();
    expect(svgElements).toBeGreaterThan(0);

    // 干支と傾斜の表示を確認
    const eto60Text = await page.locator('text=/干支.*/')
    if (await eto60Text.count() > 0) {
      console.log('干支が表示されています');
    }

    const keishaText = await page.locator('text=/傾斜.*/')
    if (await keishaText.count() > 0) {
      console.log('傾斜が表示されています');
    }

    // スクリーンショット保存
    await page.screenshot({
      path: 'test-results/kyusei-chart-display.png',
      fullPage: true
    });
  });
});