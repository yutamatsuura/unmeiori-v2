const { chromium } = require('playwright');

async function debugFrontendLogin() {
    console.log('フロントエンドログインデバッグ開始...');

    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext();
    const page = await context.newPage();

    // より詳細なログ収集
    page.on('console', msg => {
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
        console.log(`[PAGE ERROR] ${error.message}`);
    });

    page.on('response', response => {
        console.log(`[RESPONSE] ${response.url()}: ${response.status()}`);
        if (!response.ok()) {
            console.log(`[NETWORK ERROR] ${response.url()}: ${response.status()} ${response.statusText()}`);
        }
    });

    page.on('requestfailed', request => {
        console.log(`[REQUEST FAILED] ${request.url()}: ${request.failure()?.errorText}`);
    });

    try {
        // 1. ログインページにアクセス
        console.log('1. ログインページにアクセス...');
        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log(`現在のURL: ${page.url()}`);

        // 2. フォーム要素の確認
        console.log('2. フォーム要素の確認...');
        const emailInput = await page.locator('input[name="email"]').count();
        const passwordInput = await page.locator('input[name="password"]').count();
        const submitButton = await page.locator('button[type="submit"]').count();

        console.log(`Email input: ${emailInput} 個`);
        console.log(`Password input: ${passwordInput} 個`);
        console.log(`Submit button: ${submitButton} 個`);

        if (emailInput === 0 || passwordInput === 0 || submitButton === 0) {
            console.log('❌ 必要なフォーム要素が見つかりません');
            await page.screenshot({ path: './debug_login_form_missing.png' });
            return;
        }

        // 3. ログイン情報を入力
        console.log('3. ログイン情報を入力...');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.waitForTimeout(500);
        await page.fill('input[name="password"]', 'testpass123');
        await page.waitForTimeout(500);

        console.log('入力完了。ログインボタンをクリック...');

        // 4. ログインボタンをクリック
        await page.click('button[type="submit"]');

        // 5. レスポンスを待機（長めのタイムアウト）
        console.log('4. ログインレスポンスを待機...');
        await page.waitForTimeout(5000);

        const finalUrl = page.url();
        console.log(`最終URL: ${finalUrl}`);

        // ローカルストレージの確認
        const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
        console.log(`Auth Token: ${authToken ? 'あり' : 'なし'}`);

        if (authToken) {
            console.log('✅ 認証トークンが保存されています');
        } else {
            console.log('❌ 認証トークンが保存されていません');
        }

        // エラーメッセージの確認
        const errorMessages = await page.locator('text*=error').allTextContents();
        const alertMessages = await page.locator('[role="alert"]').allTextContents();

        if (errorMessages.length > 0) {
            console.log('エラーメッセージ:', errorMessages);
        }
        if (alertMessages.length > 0) {
            console.log('アラートメッセージ:', alertMessages);
        }

        await page.screenshot({ path: './debug_login_final_state.png' });

        // 手動で createページに移動を試行
        console.log('5. 手動でcreateページに移動...');
        await page.goto('http://localhost:3001/create');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const createUrl = page.url();
        console.log(`Createページ URL: ${createUrl}`);

        if (createUrl.includes('/create')) {
            console.log('✅ Createページにアクセス成功');
        } else {
            console.log('❌ Createページにアクセス失敗、リダイレクトされた可能性');
        }

    } catch (error) {
        console.error('デバッグ中にエラー:', error);
        await page.screenshot({ path: './debug_login_error.png' });
    } finally {
        // ブラウザを開いたままにして手動確認を可能にする
        console.log('ブラウザを開いたままにします。手動で確認してから、Ctrl+Cで終了してください...');
        await page.waitForTimeout(60000); // 60秒待機
        await browser.close();
    }
}

// 実行
debugFrontendLogin();