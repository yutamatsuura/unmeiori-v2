const { chromium } = require('playwright');

async function testPreviewRouting() {
  console.log('🔍 テスト開始: /preview/18 ルーティング問題の調査');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ステップ1: ログイン状態なしで /preview/18 にアクセス
    console.log('📍 ステップ1: 認証なしで /preview/18 にアクセス');
    await page.goto('http://localhost:3001/preview/18');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log(`現在のURL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('✅ 予想通り: ログインページにリダイレクトされました');
    } else {
      console.log('❌ 予期しない動作: ログインページにリダイレクトされませんでした');
    }

    // ステップ2: ログインを実行
    console.log('📍 ステップ2: ログイン実行');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const afterLoginUrl = page.url();
    console.log(`ログイン後のURL: ${afterLoginUrl}`);

    // ステップ3: ログイン後に /preview/18 にアクセス
    console.log('📍 ステップ3: ログイン後に /preview/18 にアクセス');
    await page.goto('http://localhost:3001/preview/18');
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    console.log(`最終URL: ${finalUrl}`);

    if (finalUrl.includes('/preview/18')) {
      console.log('✅ 成功: プレビューページにアクセスできました');

      // ページ内容を確認
      const pageTitle = await page.textContent('h1, h2, [data-testid="print-preview-container"]');
      console.log(`ページタイトル/要素: ${pageTitle}`);

      // エラーメッセージの有無確認
      const alertElements = await page.$$('[role="alert"], .MuiAlert-root');
      if (alertElements.length > 0) {
        const alertText = await alertElements[0].textContent();
        console.log(`アラート内容: ${alertText}`);
      }

    } else if (finalUrl.includes('/login')) {
      console.log('❌ 問題発見: ログイン後もログインページにリダイレクトされています');
    } else {
      console.log(`❓ 予期しないリダイレクト: ${finalUrl}`);
    }

    // スクリーンショット撮影
    await page.screenshot({ path: './debug_preview_routing.png' });
    console.log('📸 スクリーンショットを保存しました: debug_preview_routing.png');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  } finally {
    await browser.close();
  }
}

testPreviewRouting();