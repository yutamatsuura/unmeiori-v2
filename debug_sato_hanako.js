const { chromium } = require('playwright');

async function debugSatoHanako() {
    console.log('佐藤花子（1985-12-08・女性）のエラー再現デバッグを開始...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // コンソールログをキャプチャ
    page.on('console', msg => {
        console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
    });

    // ネットワークエラーをキャプチャ
    page.on('response', response => {
        if (!response.ok()) {
            console.log(`[NETWORK ERROR] ${response.url()}: ${response.status()} ${response.statusText()}`);
        }
    });

    try {
        // 1. ログインページにアクセス
        console.log('1. ログインページにアクセス...');
        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');

        // 2. ログイン実行
        console.log('2. テストユーザーでログイン...');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'testpass123');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 3. 鑑定作成ページに移動
        console.log('3. 鑑定作成ページに移動...');
        await page.goto('http://localhost:3001/create');
        await page.waitForLoadState('networkidle');

        // 4. 佐藤花子の情報を入力
        console.log('4. 佐藤花子の情報を入力...');

        // 氏名入力
        await page.fill('input[name="name"]', '佐藤花子');
        console.log('   氏名入力完了: 佐藤花子');

        // 生年月日入力（1985-12-08）
        await page.fill('input[name="birthDate"]', '1985-12-08');
        console.log('   生年月日入力完了: 1985-12-08');

        // 性別選択（女性）
        await page.selectOption('select[name="gender"]', 'female');
        console.log('   性別選択完了: 女性');

        // メールアドレス入力
        await page.fill('input[name="email"]', 'sato.hanako@example.com');
        console.log('   メールアドレス入力完了: sato.hanako@example.com');

        // 5. 鑑定計算実行
        console.log('5. 鑑定計算実行ボタンをクリック...');
        await page.click('button:has-text("鑑定計算実行")');

        // 6. レスポンスを待機（最大30秒）
        console.log('6. API レスポンスを待機...');

        // エラーメッセージまたは成功結果を待機
        try {
            await Promise.race([
                // エラーメッセージが表示される場合
                page.waitForSelector('text=計算処理でエラーが発生しました', { timeout: 30000 }),
                // 成功時に遷移するページを待機
                page.waitForURL('**/preview/**', { timeout: 30000 })
            ]);
        } catch (e) {
            console.log('   タイムアウト: 30秒以内にレスポンスがありませんでした');
        }

        // 7. 現在の状態を確認
        const currentUrl = page.url();
        console.log(`7. 現在のURL: ${currentUrl}`);

        const errorMessage = await page.locator('text=計算処理でエラーが発生しました').count();
        if (errorMessage > 0) {
            console.log('❌ エラーメッセージを検出');
        } else {
            console.log('✅ エラーメッセージは検出されませんでした');
        }

        // 8. スクリーンショット保存
        await page.screenshot({ path: './debug_sato_hanako_error.png' });
        console.log('8. スクリーンショット保存: debug_sato_hanako_error.png');

        // 9. ログファイルを読み取り（5秒待機後）
        console.log('9. 5秒後にログファイルを確認...');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('デバッグ中にエラー:', error);
    } finally {
        await browser.close();
        console.log('デバッグ終了');
    }
}

// 実行
debugSatoHanako();