const puppeteer = require('puppeteer');

async function testWithLogin() {
  console.log('🚀 ログイン込み表示テスト開始');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });

  try {
    const page = await browser.newPage();

    console.log('📱 フロントエンドページを開いています...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });

    // ページが読み込まれるまで待つ
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔑 ログイン処理を開始します...');

    // メールアドレス入力
    const emailField = await page.$('input[type="email"], input[name="email"]');
    if (emailField) {
      await emailField.type('test@example.com');
      console.log('📧 メールアドレス入力完了');
    }

    // パスワード入力
    const passwordField = await page.$('input[type="password"], input[name="password"]');
    if (passwordField) {
      await passwordField.type('testpass123');
      console.log('🔐 パスワード入力完了');
    }

    // ログインボタンクリック
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
      console.log('🔑 ログインボタンクリック完了');

      // ログイン後のページ読み込みを待つ
      await new Promise(resolve => setTimeout(resolve, 3000));

      // createページに移動
      await page.goto('http://localhost:3001/create', { waitUntil: 'networkidle2' });
      console.log('📄 createページに移動');

      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('🔍 フォーム要素を確認しています...');

      // 氏名フィールドを探す（MUIのTextField）
      const nameField = await page.$('input[id*="name"], input[type="text"]');
      if (!nameField) {
        console.log('❌ 氏名フィールドが見つかりません');
        // ページの内容を調べる
        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log('ページ内容:', bodyText.slice(0, 500));
        return;
      }

      console.log('✅ 氏名フィールド発見');

      // 氏名を入力
      await nameField.type('松浦 仁');
      console.log('✏️ 氏名入力完了');

      // 生年月日フィールドを探す
      const dateField = await page.$('input[type="date"]');
      if (dateField) {
        await dateField.type('1990-01-01');
        console.log('📅 生年月日入力完了');
      }

      // 性別を選択
      const genderSelect = await page.$('div[role="button"], .MuiSelect-select');
      if (genderSelect) {
        await genderSelect.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        const maleOption = await page.$('li[data-value="male"], li:contains("男性")');
        if (maleOption) {
          await maleOption.click();
          console.log('👤 性別選択完了');
        }
      }

      // メールアドレスを入力
      const emailFieldForm = await page.$('input[type="email"]');
      if (emailFieldForm) {
        await emailFieldForm.type('test@example.com');
        console.log('📧 メールアドレス入力完了');
      }

      // 計算ボタンを探してクリック
      const calculateButton = await page.$('button[type="submit"]');
      if (calculateButton) {
        console.log('🔄 計算ボタンクリック');
        await calculateButton.click();

        // 計算完了を待つ
        console.log('⏳ 計算完了を待っています...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // 結果を確認
        const pageContent = await page.content();
        const hasGogyouBalance = pageContent.includes('五行のバランス');
        const hasYouinPattern = pageContent.includes('陰陽');
        const hasGogyouBad = pageContent.includes('五行のバランス(悪)');
        const hasKuroYori = pageContent.includes('黒の方寄り');

        console.log(`✅ 五行のバランス: ${hasGogyouBalance ? '表示' : '未表示'}`);
        console.log(`✅ 五行のバランス(悪): ${hasGogyouBad ? '表示' : '未表示'}`);
        console.log(`✅ 陰陽関連: ${hasYouinPattern ? '表示' : '未表示'}`);
        console.log(`✅ 黒の方寄り: ${hasKuroYori ? '表示' : '未表示'}`);

        // スクリーンショット撮影
        await page.screenshot({
          path: './tests/screenshots/login-test-result.png',
          fullPage: true
        });
        console.log('📸 スクリーンショット保存完了');

        // 結果まとめ
        const allDisplayed = hasGogyouBad && hasKuroYori;
        console.log(`\n📊 テスト結果: ${allDisplayed ? '✅ 成功' : '❌ 失敗'}`);

        if (!allDisplayed) {
          console.log('⚠️ 一部の要素が表示されていません。');
        }
      } else {
        console.log('❌ 計算ボタンが見つかりません');
      }
    } else {
      console.log('❌ ログインボタンが見つかりません');
    }

  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    console.log('🔄 5秒後にブラウザを閉じます...');
    setTimeout(async () => {
      await browser.close();
      console.log('✅ テスト完了');
    }, 5000);
  }
}

testWithLogin().catch(console.error);