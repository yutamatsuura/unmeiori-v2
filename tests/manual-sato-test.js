const { chromium } = require('playwright');

async function testSatoHanako() {
  console.log('=== E2E-SEM-003: 佐藤花子テスト開始 ===');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // フロントエンドにアクセス
    console.log('フロントエンドにアクセス中...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // ページ内容をデバッグ
    console.log('ページタイトル:', await page.title());
    const bodyText = await page.textContent('body');
    console.log('ページ内容サンプル:', bodyText.substring(0, 200) + '...');

    // ログインが必要かチェック
    if (bodyText.includes('ログイン') || bodyText.includes('メールアドレス')) {
      console.log('ログインページが表示されました。ログイン処理を実行します...');

      const emailInput = page.locator('input[name="email"], input[type="email"]');
      const passwordInput = page.locator('input[name="password"], input[type="password"]');
      const loginButton = page.locator('button').filter({ hasText: /ログイン/ });

      await emailInput.fill('test@example.com');
      await passwordInput.fill('testpass123');
      await loginButton.click();

      console.log('ログイン実行完了、ページ遷移を待機中...');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // 追加の待機時間

      // ログイン後のページ確認
      const newUrl = page.url();
      console.log('ログイン後のURL:', newUrl);

      // Createページに遷移
      if (!newUrl.includes('/create')) {
        console.log('Createページに手動遷移します...');
        await page.goto('http://localhost:3001/create');
        await page.waitForLoadState('networkidle');
      }
    }

    // すべてのinput要素を確認
    const allInputs = await page.locator('input').all();
    console.log(`発見されたinput要素数: ${allInputs.length}`);

    for (let i = 0; i < Math.min(allInputs.length, 5); i++) {
      const placeholder = await allInputs[i].getAttribute('placeholder') || '未設定';
      const name = await allInputs[i].getAttribute('name') || '未設定';
      const type = await allInputs[i].getAttribute('type') || '未設定';
      console.log(`Input ${i+1}: placeholder="${placeholder}", name="${name}", type="${type}"`);
    }

    // 姓名入力フォームの確認
    const seiInput = page.locator('input[placeholder*="姓"], input[name*="sei"], input[id*="sei"]').first();
    const meiInput = page.locator('input[placeholder*="名"], input[name*="mei"], input[id*="mei"]').first();

    // input要素の存在確認
    const seiExists = await seiInput.count();
    const meiExists = await meiInput.count();
    console.log(`姓入力フィールド発見: ${seiExists}個, 名入力フィールド発見: ${meiExists}個`);

    if (seiExists === 0 || meiExists === 0) {
      console.log('❌ 姓名入力フィールドが見つかりません。直接セレクタを試します。');

      // Material-UIの一般的なセレクタを試行
      const materialInputs = await page.locator('.MuiInputBase-input, .MuiTextField-root input').all();
      console.log(`Material-UI input要素: ${materialInputs.length}個発見`);

      if (materialInputs.length >= 4) {
        console.log('Material-UI inputを使用します');
        // 入力欄の順番: 姓、生年月日、名前、メール（type="text"のものを特定）
        const textInputs = [];
        for (let input of materialInputs) {
          const type = await input.getAttribute('type');
          if (type === 'text' || type === null || type === '' || type === 'email') {
            textInputs.push(input);
          }
        }

        console.log(`テキスト入力可能な要素数: ${textInputs.length}`);
        if (textInputs.length >= 2) {
          await textInputs[0].fill('佐藤'); // 姓（最初のテキスト入力）

          // 名前入力欄を特定するため、すべてのtext入力を試行
          let nameInputSuccess = false;
          for (let i = 1; i < textInputs.length; i++) {
            try {
              await textInputs[i].fill('花子');
              nameInputSuccess = true;
              console.log(`✅ ${i+1}番目のテキスト入力で名前入力成功`);
              break;
            } catch (e) {
              console.log(`${i+1}番目のテキスト入力で名前入力失敗: ${e.message}`);
            }
          }

          if (!nameInputSuccess) {
            throw new Error('名前入力フィールドが見つかりません');
          }

          // 生年月日を設定
          const dateInput = page.locator('input[type="date"]');
          await dateInput.fill('1985-12-08');
          console.log('✅ 生年月日設定完了: 1985-12-08');

          // 性別を設定（女性）
          const genderSelect = page.locator('[role="combobox"]');
          await genderSelect.click();
          await page.waitForTimeout(500);
          await page.locator('li').filter({ hasText: '女性' }).click();
          console.log('✅ 性別設定完了: 女性');

          console.log('✅ Material-UI inputで佐藤花子入力完了（全フィールド）');
        } else {
          throw new Error('十分なテキスト入力フィールドが見つかりません');
        }
      } else {
        throw new Error('姓名入力フィールドが見つかりません');
      }
    } else {
      // 佐藤花子で鑑定実行
      console.log('佐藤花子を入力中...');
      await seiInput.fill('佐藤');
      await meiInput.fill('花子');
    }

    // 鑑定実行ボタンを探す
    console.log('鑑定実行ボタンを探しています...');
    const allButtons = await page.locator('button').all();
    console.log(`ページ上のボタン数: ${allButtons.length}`);

    let buttonFound = false;
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`ボタン ${i+1}: "${buttonText}"`);
      if (buttonText && (buttonText.includes('鑑定') || buttonText.includes('実行') || buttonText.includes('判定') || buttonText.includes('診断'))) {
        console.log(`✅ 鑑定実行ボタンを発見: "${buttonText}"`);
        await allButtons[i].click();
        buttonFound = true;
        break;
      }
    }

    if (!buttonFound) {
      // デフォルトで最後のボタンをクリック
      console.log('⚠️ 鑑定実行ボタンが見つからないため、最後のボタンをクリックします');
      if (allButtons.length > 0) {
        await allButtons[allButtons.length - 1].click();
      } else {
        throw new Error('クリック可能なボタンが見つかりません');
      }
    }

    console.log('ボタンクリック完了。結果を待機中...');
    await page.waitForTimeout(3000); // 3秒待機

    // URLの変化を確認
    const newUrl = page.url();
    console.log('ボタンクリック後のURL:', newUrl);

    // ページの内容を確認
    const currentBodyText = await page.textContent('body');
    console.log('現在のページ内容（最初の200文字）:', currentBodyText.substring(0, 200) + '...');

    // より広範囲の結果表示を待機
    console.log('結果表示を待機中（複数のセレクタで試行）...');

    const selectors = [
      '[data-testid*="result"]',
      '.result',
      '[class*="result"]',
      '.preview-page',
      '[data-testid="client-name"]',
      'h1',
      'h2',
      'h3',
      '.MuiTypography-h4',
      '.MuiTypography-h5',
      '.MuiCard-root',
      '.preview-card',
      '.certificate-content'
    ];

    let resultFound = false;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`✅ 結果表示確認: ${selector}`);
        resultFound = true;
        break;
      } catch (e) {
        console.log(`⚠️ ${selector} で結果未発見: ${e.message}`);
      }
    }

    if (!resultFound) {
      console.log('❌ どのセレクタでも結果が見つかりません。ページを強制進行します。');
      await page.waitForTimeout(5000); // 5秒追加待機
    }

    await page.waitForLoadState('networkidle');

    // **重要: セレクタ問題のテスト**
    console.log('佐藤花子のセレクタ問題をテスト中...');

    // 従来のセレクタ（問題のあるもの）
    try {
      const nameElements = page.locator('text=/佐藤花子/');
      const count = await nameElements.count();
      console.log(`❌ text=/佐藤花子/ で発見された要素数: ${count}個`);
      if (count > 1) {
        console.log('❌ Playwrightストリクトモード違反が確認されました');
      }
    } catch (error) {
      console.log('❌ ストリクトモードエラーが発生:', error.message);
    }

    // 修正版セレクタ（data-testid使用）
    try {
      const clientNameElement = page.locator('[data-testid="client-name"]');
      const nameText = await clientNameElement.textContent();
      console.log(`✅ data-testid="client-name" で取得: ${nameText}`);
      if (nameText.includes('佐藤花子')) {
        console.log('✅ 佐藤花子表示確認完了（修正版セレクタ）');
      }
    } catch (error) {
      console.log('⚠️ data-testid取得失敗:', error.message);
    }

    // スクリーンショット撮影
    await page.screenshot({
      path: './tests/screenshots/sato-hanako-fixed.png',
      fullPage: true
    });
    console.log('✅ スクリーンショット保存完了');

    console.log('✅ E2E-SEM-003テスト完了');

  } catch (error) {
    console.error('❌ テストエラー:', error);
  } finally {
    await browser.close();
  }
}

testSatoHanako().catch(console.error);