const { test, expect } = require('@playwright/test');

test.describe('九星気学精度検証', () => {
  test('1985年3月10日の九星計算検証', async ({ page }) => {
    console.log('=== 1985年3月10日 男性の検証 ===');

    // ローカルサイトへアクセス
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    // ログイン
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill('testpass123');
      const loginButton = page.locator('button').filter({ hasText: /ログイン/ }).first();
      await loginButton.click();
      await page.waitForLoadState('networkidle');
    }

    // createページへ移動
    await page.goto('http://localhost:3001/create', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // フォーム入力
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('テスト太郎');

    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill('1985-03-10');

    const emailField = page.locator('input[type="email"]').first();
    await emailField.fill('test@example.com');

    // 性別選択
    const genderSelect = page.locator('.MuiSelect-root, select').first();
    if (await genderSelect.isVisible()) {
      await genderSelect.click();
      const maleOption = page.locator('[role="option"]:has-text("男性"), .MuiMenuItem-root:has-text("男性")').first();
      if (await maleOption.isVisible()) {
        await maleOption.click();
      }
    }

    console.log('入力完了: 1985-03-10 男性');

    // 鑑定実行
    const execButton = page.locator('button').filter({ hasText: /鑑定|計算|実行/ }).first();
    await execButton.click();
    await page.waitForTimeout(5000);

    // 結果を取得
    const pageText = await page.textContent('body');

    // 本命星を抽出
    const honmeiseiMatch = pageText.match(/本命星[：:]\s*(一白水星|二黒土星|三碧木星|四緑木星|五黄土星|六白金星|七赤金星|八白土星|九紫火星)/);
    const gekkeiseiMatch = pageText.match(/月命星[：:]\s*(一白水星|二黒土星|三碧木星|四緑木星|五黄土星|六白金星|七赤金星|八白土星|九紫火星)/);

    if (honmeiseiMatch) {
      console.log(`ローカル 本命星: ${honmeiseiMatch[1]}`);
    }
    if (gekkeiseiMatch) {
      console.log(`ローカル 月命星: ${gekkeiseiMatch[1]}`);
    }

    // スクリーンショット
    await page.screenshot({
      path: './tests/screenshots/local-1985-03-10.png',
      fullPage: true
    });

    console.log('\n=== 比較結果 ===');
    console.log('気学なび: 本命星=六白金星, 月命星=四緑木星');
    console.log(`ローカル: 本命星=${honmeiseiMatch ? honmeiseiMatch[1] : '取得失敗'}, 月命星=${gekkeiseiMatch ? gekkeiseiMatch[1] : '取得失敗'}`);

    // アサーション
    expect(honmeiseiMatch && honmeiseiMatch[1]).toBe('六白金星');
    expect(gekkeiseiMatch && gekkeiseiMatch[1]).toBe('四緑木星');
  });
});