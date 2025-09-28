const { test, expect } = require('@playwright/test');

// テスト設定
const FRONTEND_URL = 'http://localhost:3001';
const TEST_TIMEOUT = 30000;

test.describe('sindankantei E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // デフォルトのタイムアウトを設定
    test.setTimeout(TEST_TIMEOUT);

    // コンソールエラーを監視
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      } else if (msg.type() === 'log') {
        console.log('📝 Console Log:', msg.text());
      }
    });

    // ネットワークレスポンスを監視
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`🚨 HTTP ${response.status()}: ${response.url()}`);
      }
    });
  });

  test('E2E-SEM-001: 基本機能テスト（田中太郎の鑑定）', async ({ page }) => {
    console.log('=== E2E-SEM-001: 基本機能テスト開始 ===');

    // 1. フロントエンドにアクセス
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    console.log('✅ フロントエンドアクセス完了');

    // 2. ログイン処理
    console.log('🔐 ログイン処理開始');

    // ログインページかどうかチェック、違えばログインページに遷移
    if (!page.url().includes('/login')) {
      await page.goto(FRONTEND_URL + '/login');
      await page.waitForLoadState('networkidle');
    }

    // ログイン情報を入力（data-testidを使用）
    await page.locator('[data-testid="email-input"]').fill('test@example.com');
    await page.locator('[data-testid="password-input"]').fill('testpass123');

    // ログインボタンをクリック
    await page.locator('[data-testid="login-button"]').click();

    // ログイン成功とリダイレクトを待機
    await page.waitForFunction(() => {
      return window.location.pathname.includes('/create') ||
             !window.location.pathname.includes('/login');
    }, { timeout: 15000 });

    await page.waitForLoadState('networkidle');
    console.log('✅ ログイン完了');

    // 3. createページに遷移
    console.log('📄 Createページに遷移');
    const currentUrl = page.url();
    if (!currentUrl.includes('/create')) {
      await page.goto(FRONTEND_URL + '/create');
      await page.waitForLoadState('networkidle');
    }

    // ページタイトル確認
    await expect(page).toHaveTitle(/sindankantei|鑑定書/);
    console.log('✅ Createページ遷移完了');

    // 4. フォーム入力
    console.log('📝 フォーム入力開始');

    // 氏名入力（Material-UIのTextField内のinput要素を指定）
    await page.locator('[data-testid="name-input"] input').fill('田中太郎');
    console.log('✅ 氏名入力完了: 田中太郎');

    // 生年月日入力（Material-UIのTextField内のinput要素を指定）
    await page.locator('[data-testid="birthdate-input"] input').fill('1990-05-15');
    console.log('✅ 生年月日入力完了: 1990-05-15');

    // 性別選択（Material-UIのSelectに対応）
    console.log('🔧 性別選択処理開始');

    // data-testidを使ってSelectをクリック
    await page.locator('[data-testid="gender-select"]').click();
    console.log('✅ 性別セレクト開いた');

    // ドロップダウンメニューから「男性」を選択
    await page.locator('[data-testid="gender-male"]').click();
    console.log('✅ 性別選択完了: 男性');

    // メールアドレス入力（Material-UIのTextField内のinput要素を指定）
    await page.locator('[data-testid="email-input"] input').fill('tanaka.taro@example.com');
    console.log('✅ メールアドレス入力完了');

    // 5. 鑑定実行
    console.log('⚡ 鑑定計算実行');
    await page.locator('[data-testid="calculate-button"]').click();
    console.log('✅ 鑑定計算ボタンクリック完了');

    // 6. 結果確認
    console.log('📊 結果確認');

    // プレビューページまたは結果表示を待機（null安全性を向上）
    try {
      await page.waitForFunction(() => {
        const url = window.location?.href || '';
        const hasResultElement = document.querySelector('[class*="result"], [data-testid*="result"]');
        const bodyText = document.body?.textContent || '';
        return url.includes('/preview') ||
               hasResultElement ||
               bodyText.includes('鑑定結果') ||
               bodyText.includes('総格') ||
               bodyText.includes('画数');
      }, { timeout: 30000 });
      console.log('✅ 結果ページまたは結果表示を確認');
    } catch (error) {
      // エラーが発生した場合は現在の状態を詳細ログ出力
      console.log('⚠️ 結果表示の待機がタイムアウトしました。現在の状態を確認中...');
      const currentUrl = await page.url();
      const currentContent = await page.textContent('body');
      const hasCalculatingButton = await page.isVisible('text=計算中');
      console.log(`現在のURL: ${currentUrl}`);
      console.log(`計算中状態: ${hasCalculatingButton}`);
      console.log(`ページ内容サンプル: ${currentContent.substring(0, 500)}...`);
      throw error;
    }

    // 結果表示の確認
    const hasResults = await page.locator('body').textContent();
    const resultIndicators = [
      hasResults.includes('総格'),
      hasResults.includes('天格'),
      hasResults.includes('地格'),
      hasResults.includes('人格'),
      hasResults.includes('画数'),
      hasResults.includes('ランク'),
      hasResults.includes('スコア')
    ];

    const foundResults = resultIndicators.filter(Boolean).length;
    console.log(`✅ 結果確認完了: ${foundResults}/7個の要素を検出`);

    // 7. スクリーンショット撮影
    await page.screenshot({
      path: './tests/screenshots/e2e-sem-001-result.png',
      fullPage: true
    });
    console.log('✅ スクリーンショット保存完了: e2e-sem-001-result.png');

    // 8. テスト成功の確認
    expect(foundResults).toBeGreaterThan(2); // 最低3つの結果要素があることを確認
    console.log('🎉 E2E-SEM-001テスト成功！');
  });
});