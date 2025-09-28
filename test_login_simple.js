const { chromium } = require('playwright');

async function testLogin() {
    console.log('=== ログインテスト開始 ===');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // フロントエンドにアクセス
        console.log('フロントエンドにアクセス中...');
        await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });

        // ページが読み込まれるまで待機
        await page.waitForTimeout(2000);

        console.log('ログインフォームに入力中...');

        // メールアドレスを入力
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        await emailInput.fill('test@example.com');

        // パスワードを入力
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
        await passwordInput.fill('testpass123');

        console.log('ログインボタンをクリック中...');

        // ログインボタンをクリック
        const loginButton = page.locator('button[type="submit"], button:has-text("ログイン")').first();
        await loginButton.click();

        // ログイン後のページ遷移を待機
        console.log('ログイン処理を待機中...');
        await page.waitForTimeout(3000);

        // 現在のURLを確認
        const currentUrl = page.url();
        console.log('現在のURL:', currentUrl);

        // ログイン成功の場合、/createページにリダイレクトされるはず
        if (currentUrl.includes('/create')) {
            console.log('✅ ログイン成功！createページにリダイレクトされました');
        } else {
            console.log('❌ ログイン失敗または予期しないページです');

            // エラーメッセージがあるかチェック
            const errorElements = await page.locator('[class*="error"], [class*="alert"], .MuiAlert-root').all();
            if (errorElements.length > 0) {
                for (const element of errorElements) {
                    const text = await element.textContent();
                    console.log('エラーメッセージ:', text);
                }
            }
        }

        // スクリーンショット撮影
        await page.screenshot({ path: 'login_test_result.png', fullPage: true });
        console.log('スクリーンショットを撮影しました: login_test_result.png');

    } catch (error) {
        console.error('テスト中にエラーが発生しました:', error.message);
        await page.screenshot({ path: 'login_test_error.png', fullPage: true });
    } finally {
        await page.waitForTimeout(2000);
        await browser.close();
        console.log('=== ログインテスト完了 ===');
    }
}

testLogin();