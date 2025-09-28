import { test, expect, Page } from '@playwright/test';

// デバイスサイズ設定
const viewports = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};

// ログイン関数
async function login(page: Page) {
  await page.goto('/login');

  // ページが読み込まれるまで待機
  await page.waitForLoadState('networkidle');

  // 既存の値をクリアして新しい値を入力
  await page.fill('input[type="email"]', '');
  await page.fill('input[type="email"]', 'test@example.com');

  await page.fill('input[type="password"]', '');
  await page.fill('input[type="password"]', 'testpass123');

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  // ログイン完了まで待機（成功した場合のリダイレクト先を確認）
  await page.waitForTimeout(3000);

  // URLの変化を確認
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);
}

// 各デバイスサイズでのビジュアル回帰テスト
Object.entries(viewports).forEach(([deviceName, viewport]) => {
  test.describe(`Visual Regression Tests - ${deviceName}`, () => {
    test.beforeEach(async ({ page }) => {
      // ビューポートを設定
      await page.setViewportSize(viewport);
    });

    test(`Landing page - ${deviceName}`, async ({ page }) => {
      await page.goto('/');

      // ページが完全に読み込まれるまで待機
      await page.waitForLoadState('networkidle');

      // スクリーンショット比較
      await expect(page).toHaveScreenshot(`landing-${deviceName}.png`, {
        threshold: 0.05, // 5%の差異まで許容
        maxDiffPixels: 1000
      });
    });

    test(`Login page - ${deviceName}`, async ({ page }) => {
      await page.goto('/');

      // ログインページに移動
      await page.click('text=ログイン');

      // ページが完全に読み込まれるまで待機
      await page.waitForLoadState('networkidle');

      // スクリーンショット比較
      await expect(page).toHaveScreenshot(`login-${deviceName}.png`, {
        threshold: 0.05,
        maxDiffPixels: 1000
      });
    });

    test(`Create page - ${deviceName}`, async ({ page }) => {
      await login(page);

      // 鑑定書作成ページが完全に読み込まれるまで待機
      await page.waitForLoadState('networkidle');

      // スクリーンショット比較
      await expect(page).toHaveScreenshot(`create-${deviceName}.png`, {
        threshold: 0.05,
        maxDiffPixels: 1000
      });
    });

    test(`Kantei form page - ${deviceName}`, async ({ page }) => {
      await login(page);

      // フォームが完全に読み込まれるまで待機（ログイン後すでにcreateページにいるため）
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // フォーム要素の安定化を待つ

      // スクリーンショット比較
      await expect(page).toHaveScreenshot(`kantei-form-${deviceName}.png`, {
        threshold: 0.05,
        maxDiffPixels: 1000
      });
    });

    test(`Kantei form with data - ${deviceName}`, async ({ page }) => {
      await login(page);
      await page.waitForLoadState('networkidle');

      // フォームに入力
      await page.fill('input[name="name"]', '山田太郎');
      await page.fill('input[name="birthYear"]', '1990');
      await page.selectOption('select[name="birthMonth"]', '6');
      await page.selectOption('select[name="birthDay"]', '15');
      await page.selectOption('select[name="gender"]', 'male');

      // 入力完了後の安定化を待つ
      await page.waitForTimeout(1000);

      // スクリーンショット比較
      await expect(page).toHaveScreenshot(`kantei-form-filled-${deviceName}.png`, {
        threshold: 0.05,
        maxDiffPixels: 1000
      });
    });

    test(`Results page - ${deviceName}`, async ({ page }) => {
      await login(page);
      await page.waitForLoadState('networkidle');

      // フォームに入力
      await page.fill('input[name="name"]', '山田太郎');
      await page.fill('input[name="birthYear"]', '1990');
      await page.selectOption('select[name="birthMonth"]', '6');
      await page.selectOption('select[name="birthDay"]', '15');
      await page.selectOption('select[name="gender"]', 'male');

      // 鑑定実行
      await page.click('button[type="submit"]');

      // 結果ページが完全に読み込まれるまで待機
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // 鑑定結果の表示を待つ

      // スクリーンショット比較
      await expect(page).toHaveScreenshot(`results-${deviceName}.png`, {
        threshold: 0.05,
        maxDiffPixels: 1000
      });
    });

    // レスポンシブ要素の特定部分テスト
    test(`Navigation menu - ${deviceName}`, async ({ page }) => {
      await login(page);

      // ナビゲーションメニューのスクリーンショット
      const navigation = page.locator('nav, .navigation, [role="navigation"]').first();

      if (await navigation.isVisible()) {
        await expect(navigation).toHaveScreenshot(`navigation-${deviceName}.png`, {
          threshold: 0.05,
          maxDiffPixels: 500
        });
      }
    });

    test(`Footer - ${deviceName}`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // フッターのスクリーンショット
      const footer = page.locator('footer, .footer').first();

      if (await footer.isVisible()) {
        await expect(footer).toHaveScreenshot(`footer-${deviceName}.png`, {
          threshold: 0.05,
          maxDiffPixels: 500
        });
      }
    });
  });
});

// クロスブラウザでの比較テスト
test.describe('Cross-browser Visual Comparison', () => {
  test('Landing page consistency across browsers', async ({ page, browserName }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot(`landing-${browserName}.png`, {
      threshold: 0.05,
      maxDiffPixels: 1000
    });
  });

  test('Create page consistency across browsers', async ({ page, browserName }) => {
    await page.setViewportSize(viewports.desktop);
    await login(page);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot(`create-${browserName}.png`, {
      threshold: 0.05,
      maxDiffPixels: 1000
    });
  });
});

// 動的コンテンツのテスト
test.describe('Dynamic Content Visual Tests', () => {
  test('Loading states', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await login(page);
    await page.waitForLoadState('networkidle');

    // フォームに入力
    await page.fill('input[name="name"]', '山田太郎');
    await page.fill('input[name="birthYear"]', '1990');
    await page.selectOption('select[name="birthMonth"]', '6');
    await page.selectOption('select[name="birthDay"]', '15');
    await page.selectOption('select[name="gender"]', 'male');

    // 送信ボタンをクリックし、ローディング状態をキャプチャ
    await page.click('button[type="submit"]');

    // ローディング状態のスクリーンショット
    await page.waitForTimeout(500); // ローディング状態を待つ
    await expect(page).toHaveScreenshot('loading-state.png', {
      threshold: 0.1,
      maxDiffPixels: 2000
    });
  });

  test('Error states', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');

    // ログインページに移動
    await page.click('text=ログイン');

    // 無効な情報でログイン試行
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // エラー状態を待つ
    await page.waitForTimeout(2000);

    // エラー状態のスクリーンショット
    await expect(page).toHaveScreenshot('error-state.png', {
      threshold: 0.05,
      maxDiffPixels: 1000
    });
  });
});