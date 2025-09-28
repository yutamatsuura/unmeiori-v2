const { chromium } = require('playwright');

(async () => {
  console.log('🔧 E2E-SEM-003 修正検証開始...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // フロントエンドにアクセス
    await page.goto('http://localhost:3001');
    console.log('✅ フロントエンドアクセス完了');

    // ログイン処理
    const bodyText = await page.textContent('body');
    if (bodyText.includes('ログイン')) {
      console.log('🔐 ログイン実行中...');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'testpass123');
      await page.click('button:has-text("ログイン")');
      await page.waitForURL('**/create', { timeout: 10000 });
      console.log('✅ ログイン完了');
    }

    // フォーム入力して鑑定実行
    console.log('📝 佐藤花子データ入力中...');
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('佐藤花子');
    await page.fill('input[type="date"]', '1985-12-08');
    await page.click('[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('li:has-text("女性")');
    await page.fill('input[type="email"]', 'test@example.com');

    // 鑑定実行
    await page.click('button:has-text("実行")');
    await page.waitForURL('**/preview/**', { timeout: 60000 });
    console.log('✅ プレビューページ到達');

    // ページ読み込み完了を待つ
    await page.waitForTimeout(2000);

    console.log('\n🎯 修正後の佐藤花子表示状況:');

    // 全体での佐藤花子出現回数
    const allText = await page.textContent('body');
    const satoCount = (allText.match(/佐藤花子/g) || []).length;
    console.log(`📊 ページ全体での佐藤花子出現回数: ${satoCount}回`);

    // text=/佐藤花子/ でマッチする要素数をチェック
    const textLocator = page.locator('text=/佐藤花子/');
    const count = await textLocator.count();
    console.log(`📊 text=/佐藤花子/でマッチする要素数: ${count}個`);

    if (count === 1) {
      console.log('✅ ストリクトモード違反解消！');
    } else {
      console.log('❌ まだストリクトモード違反が存在');

      // 詳細調査
      for (let i = 0; i < count; i++) {
        const element = textLocator.nth(i);
        const text = await element.textContent();
        const outerHTML = await element.evaluate(el => el.outerHTML.substring(0, 200));
        console.log(`  要素 ${i + 1}: "${text}"`);
        console.log(`  HTML: ${outerHTML}...`);
      }
    }

    // data-testid="client-name" の動作確認
    console.log('\n🎯 data-testid="client-name"での検証:');
    try {
      const clientNameElement = page.locator('[data-testid="client-name"]');
      const nameText = await clientNameElement.textContent();
      console.log(`✅ data-testid="client-name"で取得: ${nameText}`);

      if (nameText && nameText.includes('佐藤花子')) {
        console.log('✅ 期待通りの表示確認');
      } else {
        console.log('⚠️ 期待と異なる表示');
      }

      // expect代替テスト（ストリクトモード含む）
      await expect(clientNameElement).toContainText('佐藤花子');
      console.log('✅ expect(data-testid="client-name").toContainText("佐藤花子") 成功');

    } catch (error) {
      console.log('❌ data-testid="client-name"テスト失敗:', error.message);
    }

    // text=/佐藤花子/ のストリクトモード確認
    console.log('\n🧪 text=/佐藤花子/ ストリクトモードテスト:');
    try {
      await expect(page.locator('text=/佐藤花子/')).toContainText('佐藤花子');
      console.log('✅ expect(text=/佐藤花子/).toContainText("佐藤花子") 成功');
    } catch (error) {
      console.log('❌ text=/佐藤花子/ ストリクトモードテスト失敗:', error.message);
    }

    // スクリーンショット保存
    await page.screenshot({
      path: './debug_fix_verification.png',
      fullPage: true
    });
    console.log('✅ 検証完了スクリーンショット保存');

    console.log('\n🎉 E2E-SEM-003 修正検証完了');

  } catch (error) {
    console.error('❌ 検証中エラー:', error);
    await page.screenshot({
      path: './debug_fix_verification_error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
})();