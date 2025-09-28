const { test, expect } = require('@playwright/test');

test.describe('ローカルサイト九星気学テスト', () => {

  test('ログインして九星気学データを取得', async ({ page }) => {
    console.log('=== ローカルサイトテスト開始 ===');

    // 1. ログインページへアクセス
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    console.log('ログインページにアクセス');

    // 2. ログイン処理
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    if (await emailInput.isVisible()) {
      console.log('ログインフォーム発見');

      // 正しい認証情報を使用（CLAUDE.md記載）
      await emailInput.fill('test@example.com');
      await passwordInput.fill('testpass123');
      console.log('認証情報入力完了');

      // ログインボタンをクリック
      const loginButton = page.locator('button').filter({ hasText: /ログイン|Login/ }).first();
      await loginButton.click();
      console.log('ログインボタンクリック');

      // ログイン完了を待つ
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('ログイン完了');
    }

    // 3. createページへ移動
    await page.goto('http://localhost:3001/create', { waitUntil: 'networkidle' });
    console.log('作成ページにアクセス');
    await page.waitForTimeout(2000);

    // スクリーンショット撮影（デバッグ用）
    await page.screenshot({
      path: './tests/screenshots/local-create-page.png',
      fullPage: true
    });

    // 4. 入力フィールドの確認
    const allInputs = await page.locator('input').all();
    console.log(`入力フィールド数: ${allInputs.length}`);

    // 各入力フィールドのタイプを確認
    for (let i = 0; i < allInputs.length; i++) {
      const inputType = await allInputs[i].getAttribute('type');
      const inputName = await allInputs[i].getAttribute('name');
      const placeholder = await allInputs[i].getAttribute('placeholder');
      console.log(`Input ${i}: type="${inputType}" name="${inputName}" placeholder="${placeholder}"`);
    }

    // 5. フィールドを個別に識別して入力
    // 氏名フィールド（type="text"）
    const nameInput = page.locator('input[type="text"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('田中太郎');
      console.log('氏名入力: 田中太郎');
    }

    // 生年月日フィールド（type="date"）
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible()) {
      await dateInput.fill('1990-05-15');
      console.log('生年月日入力: 1990-05-15');
    }

    // メールアドレスフィールド（type="email"）
    const emailField = page.locator('input[type="email"]').first();
    if (await emailField.isVisible()) {
      await emailField.fill('test@example.com');
      console.log('メールアドレス入力: tanaka@example.com');
    }

    // 6. 性別選択（ドロップダウン）
    const genderSelect = page.locator('.MuiSelect-root, select').first();
    if (await genderSelect.isVisible()) {
      await genderSelect.click();
      await page.waitForTimeout(500);

      // ドロップダウンメニューから男性を選択
      const maleOption = page.locator('[role="option"]:has-text("男性"), .MuiMenuItem-root:has-text("男性")').first();
      if (await maleOption.isVisible()) {
        await maleOption.click();
        console.log('性別選択: 男性');
      } else {
        // selectタグの場合
        await genderSelect.selectOption('男性');
        console.log('性別選択: 男性（selectタグ）');
      }
    }

    // 入力後のスクリーンショット
    await page.screenshot({
      path: './tests/screenshots/local-filled-form.png',
      fullPage: true
    });

    // 7. 鑑定計算実行ボタンをクリック（seimei-e2e.spec.jsを参考）
    console.log('🔍 鑑定実行ボタンを探しています...');
    const allButtons = await page.locator('button').all();
    console.log(`ページ上のボタン数: ${allButtons.length}`);

    let buttonFound = false;
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`ボタン ${i+1}: "${buttonText}"`);
      if (buttonText && (buttonText.includes('鑑定') || buttonText.includes('実行') || buttonText.includes('計算') || buttonText.includes('診断'))) {
        console.log(`✅ 鑑定実行ボタンを発見: "${buttonText}"`);
        await allButtons[i].click();
        buttonFound = true;
        break;
      }
    }

    if (!buttonFound) {
      console.log('⚠️ 鑑定実行ボタンが見つかりません');
    }

    // 結果を待つ
    console.log('⏳ 結果を待機中...');
    await page.waitForTimeout(5000);

    // 10. 結果を取得
    const pageText = await page.textContent('body');
    console.log('ページテキスト（最初の500文字）:', pageText.substring(0, 500));

    // 九星を探す
    const kyuseiPattern = /(一白水星|二黒土星|三碧木星|四緑木星|五黄土星|六白金星|七赤金星|八白土星|九紫火星)/;
    const kyuseiMatch = pageText.match(kyuseiPattern);

    if (kyuseiMatch) {
      console.log('✅ 九星を発見:', kyuseiMatch[0]);
    } else {
      console.log('❌ 九星が見つかりません');
    }

    // 結果のスクリーンショット
    await page.screenshot({
      path: './tests/screenshots/local-result.png',
      fullPage: true
    });

    console.log('=== テスト完了 ===');
  });
});