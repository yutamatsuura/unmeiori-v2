const { chromium } = require('playwright');

async function debugNameDisplay() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // ログインページに移動
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    // ログイン実行
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Createページに移動
    await page.goto('http://localhost:3001/create');
    await page.waitForLoadState('networkidle');

    // フォーム入力
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    const inputs = await page.$$('input[type="text"]');
    console.log(`入力フィールド数: ${inputs.length}`);

    if (inputs.length >= 2) {
      await inputs[0].fill('佐藤');
      await inputs[1].fill('花子');
    } else {
      // Material-UIの場合の代替方法
      const allInputs = await page.$$('input');
      console.log(`全入力フィールド数: ${allInputs.length}`);
      await allInputs[0].fill('佐藤');
      await allInputs[1].fill('花子');
    }

    // 生年月日設定
    await page.fill('input[type="date"]', '1985-12-08');

    // 性別選択
    await page.selectOption('select', '女性');

    // 鑑定実行
    await page.click('button:has-text("鑑定計算実行")');
    await page.waitForTimeout(3000);

    // 結果の詳細確認
    console.log('=== 結果表示の詳細確認 ===');

    // data-testid="client-name"の内容
    const clientNameElement = page.locator('[data-testid="client-name"]');
    const clientNameText = await clientNameElement.textContent();
    console.log('data-testid="client-name"の内容:', clientNameText);

    // すべてのpタグの内容を確認
    const allPTags = await page.locator('p').all();
    console.log('=== ページ内のすべてのpタグ ===');
    for (let i = 0; i < allPTags.length; i++) {
      const text = await allPTags[i].textContent();
      const testid = await allPTags[i].getAttribute('data-testid');
      console.log(`p[${i}]: ${text} (data-testid: ${testid})`);
    }

    // 「佐藤花子」を含む要素を検索
    const elements = await page.locator('text=/佐藤.*花子/').all();
    console.log(`=== "佐藤花子"を含む要素数: ${elements.length} ===`);
    for (let i = 0; i < elements.length; i++) {
      const text = await elements[i].textContent();
      console.log(`要素[${i}]: ${text}`);
    }

    // APIレスポンスの確認
    console.log('=== APIレスポンス確認 ===');
    page.on('response', async (response) => {
      if (response.url().includes('/api/calculate')) {
        const responseData = await response.json();
        console.log('APIレスポンス:', JSON.stringify(responseData, null, 2));
      }
    });

    // スクリーンショット保存
    await page.screenshot({ path: 'debug_name_display.png', fullPage: true });
    console.log('スクリーンショットを保存: debug_name_display.png');

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await browser.close();
  }
}

debugNameDisplay();