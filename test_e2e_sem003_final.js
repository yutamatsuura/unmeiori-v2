const { test, expect } = require('@playwright/test');

test('E2E-SEM-003: 佐藤花子テスト（修正版）', async ({ page }) => {
  console.log('=== E2E-SEM-003: 佐藤花子テスト開始（修正版） ===');

  // フロントエンドにアクセス
  await page.goto('http://localhost:3001');

  // ログインが必要かチェック
  const bodyText = await page.textContent('body');

  if (bodyText.includes('ログイン') || bodyText.includes('メールアドレス')) {
    console.log('🔐 ログインページが表示されました。ログイン処理を実行します...');

    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    const loginButton = page.locator('button').filter({ hasText: /ログイン/ });

    await emailInput.fill('test@example.com');
    await passwordInput.fill('testpass123');
    await loginButton.click();

    await page.waitForURL('**/create');
    console.log('✅ ログイン成功！鑑定書作成ページに移動しました');
  }

  // 現在のURLと利用可能な入力要素をチェック
  console.log('📍 現在のページ:', page.url());

  // Material-UI Text Field を検索
  const textInputs = page.locator('input[type="text"]');
  const inputCount = await textInputs.count();

  if (inputCount > 0) {
    console.log(`テキスト入力可能な要素数: ${inputCount}`);
    if (inputCount >= 1) {
      // 氏名入力（1つのフィールドに「佐藤花子」として入力）
      await textInputs.first().fill('佐藤花子');
      console.log('✅ 氏名入力: 佐藤花子');

      // 生年月日を設定
      const dateInput = page.locator('input[type="date"]');
      await dateInput.fill('1985-12-08');
      console.log('✅ 生年月日設定完了: 1985-12-08');

      // 性別を設定（女性）
      const genderSelect = page.locator('[role="combobox"]');
      await genderSelect.click();
      await page.waitForTimeout(500);
      await page.locator('li').filter({ hasText: '女性' }).click();
      console.log('✅ 性別設定完了: 女性');

      // メールアドレス入力
      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill('test@example.com');
      console.log('✅ メールアドレス入力完了: test@example.com');

      console.log('✅ 佐藤花子入力完了（全フィールド）');
    } else {
      throw new Error('十分なテキスト入力フィールドが見つかりません');
    }
  } else {
    throw new Error('Material-UI入力フィールドが見つかりません');
  }

  // 鑑定実行ボタンを探してクリック
  console.log('🔍 鑑定実行ボタンを探しています...');
  const allButtons = await page.locator('button').all();
  console.log(`ページ上のボタン数: ${allButtons.length}`);

  let buttonFound = false;
  for (let i = 0; i < allButtons.length; i++) {
    const buttonText = await allButtons[i].textContent();
    console.log(`  ボタン ${i + 1}: "${buttonText}"`);

    if (buttonText && (buttonText.includes('鑑定') || buttonText.includes('実行') || buttonText.includes('計算'))) {
      console.log(`✅ 鑑定実行ボタンを発見: "${buttonText}"`);
      await allButtons[i].click();
      buttonFound = true;
      break;
    }
  }

  if (!buttonFound) {
    console.log('⚠️ 鑑定実行ボタンが見つかりませんでした');
    const currentScreenshot = await page.screenshot({ fullPage: true });
    console.log('現在の画面のスクリーンショットを確認してください');
  }

  console.log('🔄 鑑定処理中...');

  // プレビューページへの移動を待機
  await page.waitForURL('**/preview/**');
  console.log('✅ プレビューページに移動しました');

  // ページ読み込み完了を待つ
  await page.waitForTimeout(2000);

  // **修正版セレクタテスト**
  console.log('🔍 佐藤花子のセレクタ問題をテスト中（修正版）...');

  // data-testid="client-name" でのテスト
  try {
    const clientNameElement = page.locator('[data-testid="client-name"]');
    const nameText = await clientNameElement.textContent();
    console.log(`✅ data-testid="client-name" で取得: ${nameText}`);
    if (nameText && nameText.includes('佐藤花子')) {
      console.log('✅ 佐藤花子表示確認完了（data-testid使用）');
    } else {
      console.log('⚠️ data-testidで佐藤花子が見つかりませんでした');
    }

    await expect(clientNameElement).toContainText('佐藤花子');
    console.log('✅ expect(data-testid="client-name").toContainText("佐藤花子") 成功');

  } catch (error) {
    console.log('❌ data-testid取得失敗:', error.message);
    throw error;
  }

  // text=/佐藤花子/ でのストリクトモードテスト（修正確認）
  console.log('🧪 text=/佐藤花子/ ストリクトモードテスト（修正確認）...');
  try {
    const textLocator = page.locator('text=/佐藤花子/');
    const count = await textLocator.count();
    console.log(`📊 text=/佐藤花子/でマッチする要素数: ${count}個`);

    if (count === 1) {
      console.log('✅ ストリクトモード違反解消！（1つの要素のみマッチ）');
      await expect(textLocator).toContainText('佐藤花子');
      console.log('✅ expect(text=/佐藤花子/).toContainText("佐藤花子") 成功');
    } else {
      throw new Error(`ストリクトモード違反: ${count}個の要素がマッチしました。1個であることが期待されます。`);
    }

  } catch (error) {
    console.log('❌ text=/佐藤花子/ ストリクトモードテスト失敗:', error.message);
    throw error;
  }

  // スクリーンショット撮影
  await page.screenshot({
    path: './tests/screenshots/sato-hanako-result-fixed.png',
    fullPage: true
  });
  console.log('✅ スクリーンショット保存完了（修正版）');

  console.log('🎉 E2E-SEM-003テスト完了（修正版） - 成功！');
});