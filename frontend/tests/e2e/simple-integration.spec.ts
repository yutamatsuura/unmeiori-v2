import { test, expect } from '@playwright/test';

test.describe('Simple Integration Test', () => {
  test('should access frontend and verify basic functionality', async ({ page }) => {
    // フロントエンドアクセス
    await page.goto('/');

    // ログインページの確認
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page).toHaveTitle(/鑑定書楽々作成ツール/);

    console.log('✅ Frontend accessible');

    // スクリーンショット保存
    await page.screenshot({
      path: `test-results/login-page-${Date.now()}.png`,
      fullPage: true
    });

    // ログイン試行
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="login-button"]');

    // ログイン成功を確認（タイムアウトを長めに設定）
    try {
      await expect(page).toHaveURL(/.*\/create/, { timeout: 15000 });
      console.log('✅ Login successful');

      // 作成ページのスクリーンショット
      await page.screenshot({
        path: `test-results/create-page-${Date.now()}.png`,
        fullPage: true
      });

      // ページタイトルの確認
      const pageTitle = await page.textContent('h2.page-title, h1, .page-title');
      console.log(`✅ Page title: ${pageTitle}`);

      // フォーム要素の存在確認
      const formElements = [
        'input[type="text"]',
        'input[type="date"]',
        'input[type="email"]',
        'button'
      ];

      for (const selector of formElements) {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 2000 });
        console.log(`Form element ${selector}: ${isVisible ? '✅ Found' : '❌ Not found'}`);
      }

      console.log('✅ Basic integration test completed successfully');

    } catch (error) {
      console.log('❌ Login failed or page navigation error:', error);

      // エラー時のスクリーンショット
      await page.screenshot({
        path: `test-results/login-error-${Date.now()}.png`,
        fullPage: true
      });

      throw error;
    }
  });

  test('should test backend API connectivity', async ({ page }) => {
    console.log('🔗 Testing backend API connectivity');

    // ページを開いてJavaScriptコンテキストでAPI呼び出し
    await page.goto('/');

    try {
      // 統合鑑定API直接テスト
      const kanteiTest = await page.evaluate(async () => {
        try {
          const response = await fetch('http://localhost:5004/api/kantei/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: '田中太郎',
              birth_date: '1990-05-15',
              gender: 'male',
              email: 'test@example.com'
            })
          });
          return {
            status: response.status,
            ok: response.ok,
            data: response.ok ? await response.json() : await response.text()
          };
        } catch (error) {
          return { error: error.message };
        }
      });

      console.log('統合鑑定API テスト結果:', kanteiTest);

      // ヘルスチェックエンドポイントのテスト
      const healthTest = await page.evaluate(async () => {
        try {
          const response = await fetch('http://localhost:5004/health');
          return {
            status: response.status,
            ok: response.ok,
            data: response.ok ? await response.json() : await response.text()
          };
        } catch (error) {
          return { error: error.message };
        }
      });

      console.log('ヘルスチェック テスト結果:', healthTest);

      // 結果検証
      if (kanteiTest.ok) {
        console.log('✅ 統合鑑定API動作確認');
      } else {
        console.log('❌ 統合鑑定API接続エラー:', kanteiTest);
      }

      if (healthTest.ok) {
        console.log('✅ ヘルスチェック動作確認');
      } else {
        console.log('❌ ヘルスチェック接続エラー:', healthTest);
      }

      // 少なくとも一つのAPIが動作していることを確認
      expect(kanteiTest.ok || healthTest.ok).toBeTruthy();

    } catch (error) {
      console.log('❌ API connectivity test failed:', error);
      throw error;
    }
  });
});