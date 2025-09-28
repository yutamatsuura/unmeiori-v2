const { chromium } = require('playwright');

(async () => {
  console.log('🔍 佐藤花子重複表示調査開始...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // コンソールログを監視
  page.on('console', msg => console.log('CONSOLE:', msg.text()));

  try {
    // フロントエンドにアクセス
    await page.goto('http://localhost:3001');
    console.log('✅ フロントエンドアクセス完了');

    // ログインが必要か確認
    const bodyText = await page.textContent('body');

    if (bodyText.includes('ログイン')) {
      console.log('🔐 ログイン実行中...');

      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'testpass123');
      await page.click('button:has-text("ログイン")');

      // ログイン完了を待つ
      await page.waitForURL('**/create', { timeout: 10000 });
      console.log('✅ ログイン完了');
    }

    // フォーム入力
    console.log('📝 佐藤花子データ入力中...');

    // 氏名入力
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('佐藤花子');

    // 生年月日
    await page.fill('input[type="date"]', '1985-12-08');

    // 性別選択
    await page.click('[role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('li:has-text("女性")');

    // メールアドレス
    await page.fill('input[type="email"]', 'test@example.com');

    console.log('✅ フォーム入力完了');

    // 鑑定実行
    await page.click('button:has-text("鑑定実行")');
    console.log('🔄 鑑定実行中...');

    // プレビューページに移動するまで待つ
    await page.waitForURL('**/preview/**', { timeout: 60000 });
    console.log('✅ プレビューページ到達');

    // 「佐藤花子」がページ上に何個あるかチェック
    console.log('🔍 佐藤花子の表示個数調査中...');

    // 全てのテキストコンテンツを取得
    const allText = await page.textContent('body');
    const satoCount = (allText.match(/佐藤花子/g) || []).length;
    console.log(`📊 ページ全体での佐藤花子出現回数: ${satoCount}回`);

    // 各要素での佐藤花子の位置を特定
    const elements = await page.locator(':has-text("佐藤花子")').all();
    console.log(`📊 佐藤花子を含む要素数: ${elements.length}個`);

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const text = await element.textContent();
      const tagName = await element.evaluate(el => el.tagName);
      const attributes = await element.evaluate(el => {
        const attrs = {};
        for (let attr of el.attributes) {
          attrs[attr.name] = attr.value;
        }
        return attrs;
      });

      console.log(`\n要素 ${i + 1}:`);
      console.log(`  タグ: ${tagName}`);
      console.log(`  属性:`, attributes);
      console.log(`  テキスト: ${text.substring(0, 100)}...`);
    }

    // data-testid="client-name" の要素を具体的にチェック
    console.log('\n🎯 data-testid="client-name"の調査:');
    const clientNameElements = await page.locator('[data-testid="client-name"]').all();
    console.log(`📊 data-testid="client-name"の要素数: ${clientNameElements.length}個`);

    for (let i = 0; i < clientNameElements.length; i++) {
      const element = clientNameElements[i];
      const text = await element.textContent();
      console.log(`  要素 ${i + 1}: ${text}`);
    }

    // スクリーンショット保存
    await page.screenshot({
      path: './debug_duplicate_check.png',
      fullPage: true
    });
    console.log('✅ スクリーンショット保存完了');

    // Playwrightのステートをチェック
    console.log('\n🧪 Playwrightでのtext=/佐藤花子/テスト:');
    try {
      const textLocator = page.locator('text=/佐藤花子/');
      const count = await textLocator.count();
      console.log(`📊 text=/佐藤花子/でマッチする要素数: ${count}個`);

      if (count > 1) {
        console.log('❌ ストリクトモード違反確認！');
        console.log('💡 修正が必要です。');
      } else {
        console.log('✅ ストリクトモード違反なし');
      }
    } catch (error) {
      console.log('❌ text=/佐藤花子/テストでエラー:', error.message);
    }

  } catch (error) {
    console.error('❌ エラー発生:', error);
  } finally {
    await browser.close();
    console.log('🔍 調査完了');
  }
})();