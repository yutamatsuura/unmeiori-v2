const { chromium } = require('playwright');

async function simpleTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // ログインページへ移動してログイン
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Create pageに到達
    await page.waitForURL('http://localhost:3001/create', { timeout: 10000 });
    console.log('✓ ログイン成功');

    // フォームに入力（MUIコンポーネント用のセレクタ）
    // 氏名入力（最初のテキストフィールド）
    await page.locator('input[type="text"]').first().fill('山田太郎');

    // 日付入力
    await page.locator('input[type="date"]').first().fill('1990-05-15');

    // 性別選択（MUIのSelect）
    await page.click('[role="combobox"]');
    await page.click('li[data-value="male"]');

    // メール入力
    await page.locator('input[type="email"]').last().fill('yamada@example.com');

    console.log('✓ フォーム入力完了');

    // 鑑定計算実行ボタンをクリック
    await page.click('button:has-text("鑑定計算実行")');
    console.log('✓ 計算実行中...');

    // 結果待機（最大20秒）
    await page.waitForSelector('text=九星気学結果', { timeout: 20000 });
    console.log('✓ 九星気学結果表示');

    // 少し待機して完全にレンダリングさせる
    await page.waitForTimeout(2000);

    // 統合された吉方位セクションの確認
    const hasKichihoui = await page.locator('text=あなたの吉方位').count();
    const hasKyuseiDetail = await page.locator('text=九星の詳細').count();

    console.log('\n=== 統合状態の確認 ===');
    console.log(`吉方位セクション: ${hasKichihoui > 0 ? '✓ 表示されている' : '✗ 表示されていない'}`);
    console.log(`九星詳細セクション: ${hasKyuseiDetail > 0 ? '✓ 表示されている' : '✗ 表示されていない'}`);

    // 方位盤の確認
    const nenbanCount = await page.locator('text=年盤').count();
    const getsubanCount = await page.locator('text=月盤').count();
    const nippanCount = await page.locator('text=日盤').count();

    console.log('\n方位盤の表示:');
    console.log(`  年盤: ${nenbanCount}個`);
    console.log(`  月盤: ${getsubanCount}個`);
    console.log(`  日盤: ${nippanCount}個`);

    // コンソールエラーチェック
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    if (errors.length > 0) {
      console.log('\n⚠️ コンソールエラー:');
      errors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✓ コンソールエラーなし');
    }

    // スクリーンショット保存
    await page.screenshot({ path: 'integration-result.png', fullPage: true });
    console.log('\n✓ スクリーンショット保存: integration-result.png');

    console.log('\n=== テスト完了 ===');

  } catch (error) {
    console.error('エラー発生:', error.message);
    await page.screenshot({ path: 'error.png' });
  } finally {
    await browser.close();
  }
}

simpleTest();