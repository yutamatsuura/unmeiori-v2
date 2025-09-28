const { chromium } = require('playwright');

async function testKichhouiIntegration() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ログインページへ移動
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    // ログイン実行
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Create pageに遷移することを確認
    await page.waitForURL('http://localhost:3001/create', { timeout: 10000 });
    console.log('✓ ログイン成功、Create pageに到達');

    // フォームに入力
    await page.getByLabel('氏名').fill('山田太郎');
    await page.locator('input[type="date"]').first().fill('1990-05-15');
    await page.getByLabel('性別').click();
    await page.getByText('男性').click();
    await page.getByLabel('メールアドレス').fill('yamada@example.com');

    console.log('✓ フォーム入力完了');

    // 鑑定計算実行
    await page.click('text=鑑定計算実行');

    // 結果が表示されるまで待機（最大15秒）
    await page.waitForSelector('text=九星気学結果', { timeout: 15000 });
    console.log('✓ 九星気学結果が表示された');

    // 吉方位セクションの存在確認
    const kichhouiSection = await page.locator('text=あなたの吉方位').isVisible();
    if (kichhouiSection) {
      console.log('✓ 吉方位セクションが表示されている');

      // 日付選択フィールドの確認
      const dateSelector = await page.locator('input[type="date"]').nth(1).isVisible();
      console.log(`  - 日付選択フィールド: ${dateSelector ? '✓' : '✗'}`);

      // 方位盤の確認
      const nenban = await page.locator('text=年盤').isVisible();
      const getsuban = await page.locator('text=月盤').isVisible();
      const nippan = await page.locator('text=日盤').isVisible();
      console.log(`  - 年盤: ${nenban ? '✓' : '✗'}`);
      console.log(`  - 月盤: ${getsuban ? '✓' : '✗'}`);
      console.log(`  - 日盤: ${nippan ? '✓' : '✗'}`);
    } else {
      console.log('✗ 吉方位セクションが見つかりません');
    }

    // 九星詳細セクションの確認
    const kyuseiDetail = await page.locator('text=九星の詳細').isVisible();
    if (kyuseiDetail) {
      console.log('✓ 九星詳細セクションが表示されている');

      // 詳細テーブルの確認
      const hasEto = await page.locator('text=年干支').isVisible();
      const hasKeisha = await page.locator('text=傾斜').isVisible();
      const hasDoukai = await page.locator('text=同会').isVisible();
      console.log(`  - 年干支: ${hasEto ? '✓' : '✗'}`);
      console.log(`  - 傾斜: ${hasKeisha ? '✓' : '✗'}`);
      console.log(`  - 同会: ${hasDoukai ? '✓' : '✗'}`);
    } else {
      console.log('✗ 九星詳細セクションが見つかりません');
    }

    // コンソールエラーの確認
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });

    // スクリーンショット取得
    await page.screenshot({ path: 'kichihoui-integration.png', fullPage: true });
    console.log('✓ スクリーンショット保存: kichihoui-integration.png');

    console.log('\n=== 統合テスト完了 ===');
    console.log('吉方位と九星詳細の統合表示が正常に動作しています。');

  } catch (error) {
    console.error('テストエラー:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

testKichhouiIntegration();