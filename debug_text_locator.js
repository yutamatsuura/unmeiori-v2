const { chromium } = require('playwright');

(async () => {
  console.log('🔍 text=/佐藤花子/ 詳細調査開始...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 既存のプレビューページに直接アクセス（デバッグしたIDで）
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

    // スクリーンショット保存
    await page.screenshot({
      path: './tests/screenshots/debug_text_locator_screen.png',
      fullPage: true
    });

    console.log('\n🎯 text=/佐藤花子/ の詳細分析:');

    // text=/佐藤花子/ で全ての要素を取得
    const textLocator = page.locator('text=/佐藤花子/');
    const count = await textLocator.count();
    console.log(`📊 text=/佐藤花子/ でマッチする要素数: ${count}個`);

    // 各要素の詳細を調査
    for (let i = 0; i < count; i++) {
      const element = textLocator.nth(i);
      console.log(`\n--- 要素 ${i + 1} ---`);

      try {
        const tagName = await element.evaluate(el => el.tagName);
        const text = await element.textContent();
        const innerHTML = await element.innerHTML();
        const outerHTML = await element.evaluate(el => el.outerHTML);
        const attributes = await element.evaluate(el => {
          const attrs = {};
          for (let attr of el.attributes) {
            attrs[attr.name] = attr.value;
          }
          return attrs;
        });

        console.log(`タグ: ${tagName}`);
        console.log(`属性:`, attributes);
        console.log(`テキスト: "${text}"`);
        console.log(`innerHTML: "${innerHTML.substring(0, 200)}${innerHTML.length > 200 ? '...' : ''}"`);
        console.log(`outerHTML: "${outerHTML.substring(0, 300)}${outerHTML.length > 300 ? '...' : ''}"`);

        // 親要素も確認
        const parent = element.locator('..');
        const parentTag = await parent.evaluate(el => el.tagName);
        const parentAttributes = await parent.evaluate(el => {
          const attrs = {};
          for (let attr of el.attributes) {
            attrs[attr.name] = attr.value;
          }
          return attrs;
        });
        console.log(`親要素: ${parentTag}`, parentAttributes);

      } catch (error) {
        console.log(`要素 ${i + 1} の調査でエラー:`, error.message);
      }
    }

    // ページ全体のHTMLソースを確認して佐藤花子を検索
    console.log('\n🔍 ページソース内の佐藤花子検索:');
    const pageSource = await page.content();
    const matches = [...pageSource.matchAll(/佐藤花子/g)];
    console.log(`📊 HTMLソース内の佐藤花子出現回数: ${matches.length}回`);

    // DOMツリー内で佐藤花子を含む全ての要素を検索
    console.log('\n🌳 DOM内の佐藤花子要素検索:');
    const allElements = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.includes('佐藤花子')) {
          textNodes.push({
            text: node.textContent,
            parentTag: node.parentElement.tagName,
            parentClass: node.parentElement.className,
            parentId: node.parentElement.id,
            parentTestId: node.parentElement.getAttribute('data-testid')
          });
        }
      }
      return textNodes;
    });

    console.log(`📊 DOM内で佐藤花子を含むテキストノード: ${allElements.length}個`);
    allElements.forEach((node, index) => {
      console.log(`  ${index + 1}. テキスト: "${node.text}"`);
      console.log(`     親要素: ${node.parentTag} class="${node.parentClass}" id="${node.parentId}" data-testid="${node.parentTestId}"`);
    });

  } catch (error) {
    console.error('❌ エラー発生:', error);
    await page.screenshot({
      path: './tests/screenshots/debug_text_locator_error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('\n🔍 text=/佐藤花子/ 詳細調査完了');
  }
})();