const { test, expect } = require('@playwright/test');

test('姓名判断結果表示検証', async ({ page }) => {
  console.log('🚀 姓名判断表示テスト開始');

  // まずログインを行う
  console.log('📱 ログインページにアクセスしています...');
  await page.goto('http://localhost:3001/');
  await page.waitForLoadState('networkidle');

  // ログインフォームが表示されるか確認
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 5000 })) {
    console.log('ログインフォームが見つかりました。ログインを実行します...');
    await emailInput.fill('test@example.com');
    await page.locator('input[type="password"]').first().fill('testpass123');
    await page.locator('button').filter({ hasText: 'ログイン' }).first().click();
    await page.waitForLoadState('networkidle');
    console.log('✅ ログイン完了');
  }

  // createページへ移動
  console.log('📱 /createページを開いています...');
  await page.goto('http://localhost:3001/create');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 姓名を入力
  console.log('✏️ 姓名を入力しています...');

  // Material-UIの入力要素を取得
  const materialInputs = await page.locator('.MuiInputBase-input, .MuiTextField-root input').all();

  if (materialInputs.length >= 2) {
    // 最初の2つの入力フィールドが姓名フィールドと仮定
    await materialInputs[0].fill('松浦');
    await materialInputs[1].fill('仁');
    console.log('✅ Material-UI入力フィールドに姓名を入力しました');
  } else {
    console.log('Material-UIフィールドが見つかりません。通常のinput要素を試します...');
    // フォールバック：通常のinput要素を試す
    const inputs = await page.locator('input[type="text"]').all();
    if (inputs.length >= 2) {
      await inputs[0].fill('松浦');
      await inputs[1].fill('仁');
    } else {
      throw new Error(`姓名入力フィールドが見つかりません。見つかった入力要素: ${inputs.length}個`);
    }
  }

  // 生年月日を設定
  console.log('📅 生年月日を設定しています...');
  await page.fill('input[type="date"]', '1990-01-01');

  // 性別を選択
  console.log('👤 性別を選択しています...');
  await page.click('[data-testid="gender-select"]');
  await page.click('li[data-value="male"]');

  // メールアドレスを入力
  console.log('📧 メールアドレスを入力しています...');
  await page.fill('input[type="email"]', 'test@example.com');

  // 計算を開始
  console.log('🔄 計算を開始しています...');
  await page.click('button:has-text("計算開始")');

  // 計算完了を待つ
  console.log('⏳ 計算完了を待っています...');
  await page.waitForSelector('text=姓名判断結果', { timeout: 15000 });

  // 結果が表示されるまで少し待つ
  await page.waitForTimeout(2000);

  // 具体的な内容をチェック
  console.log('🔍 具体的な内容をチェックしています...');
  const pageContent = await page.content();

  const hasGogyouBalance = pageContent.includes('五行のバランス(悪)');
  const hasYouinKuro = pageContent.includes('黒の方寄り');
  const hasYouinPattern = pageContent.includes('●●●');

  console.log(`✅ 五行のバランス(悪): ${hasGogyouBalance ? '表示' : '未表示'}`);
  console.log(`✅ 黒の方寄り: ${hasYouinKuro ? '表示' : '未表示'}`);
  console.log(`✅ 陰陽パターン ●●●: ${hasYouinPattern ? '表示' : '未表示'}`);

  // スクリーンショットを撮影
  console.log('📸 スクリーンショットを撮影しています...');
  await page.screenshot({
    path: './tests/screenshots/seimei-result-verification.png',
    fullPage: true
  });

  console.log('💾 スクリーンショットを保存しました: ./tests/screenshots/seimei-result-verification.png');

  // 結果まとめ
  const allDisplayed = hasGogyouBalance && hasYouinKuro && hasYouinPattern;
  console.log(`\n📊 テスト結果: ${allDisplayed ? '✅ 成功' : '❌ 失敗'}`);

  if (!allDisplayed) {
    console.log('⚠️ 一部の要素が表示されていません。');
  }

  // アサーションで結果を確認
  expect(hasGogyouBalance).toBe(true);
  expect(hasYouinKuro).toBe(true);
  expect(hasYouinPattern).toBe(true);
});