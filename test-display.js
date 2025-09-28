const puppeteer = require('puppeteer');

async function testSeimeiDisplay() {
  console.log('🚀 姓名判断表示テスト開始');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });

  try {
    const page = await browser.newPage();

    console.log('📱 フロントエンドページを開いています...');
    await page.goto('http://localhost:3001/create');

    console.log('✏️ 姓名を入力しています...');
    // フォームフィールドを待機して入力
    await page.waitForSelector('input[label="氏名"], input[placeholder*="氏名"], label:has-text("氏名") + input', { timeout: 5000 });
    await page.type('input[label="氏名"], input[placeholder*="氏名"], label:has-text("氏名") + input', '松浦 仁');

    console.log('📅 生年月日を設定しています...');
    await page.type('input[type="date"]', '1990-01-01');

    console.log('🔄 計算を開始しています...');
    await page.click('button:has-text("計算開始")');

    console.log('⏳ 計算完了を待っています...');
    await page.waitForSelector('text=姓名判断結果', { timeout: 15000 });

    // 少し待つ
    await page.waitForTimeout(2000);

    console.log('🔍 gogyou_balance の存在を確認しています...');
    const gogyouExists = await page.$('text=gogyou_balance');
    console.log(`gogyou_balance要素: ${gogyouExists ? '存在' : '存在しない'}`);

    console.log('🔍 youin_pattern の存在を確認しています...');
    const youinExists = await page.$('text=youin_pattern');
    console.log(`youin_pattern要素: ${youinExists ? '存在' : '存在しない'}`);

    // 具体的な内容をチェック
    const pageContent = await page.content();

    console.log('🔍 具体的な内容をチェックしています...');
    const hasGogyouBalance = pageContent.includes('五行のバランス(悪)');
    const hasYouinKuro = pageContent.includes('黒の方寄り');
    const hasYouinPattern = pageContent.includes('●●●');
    const hasJinkaku = pageContent.includes('人格: 火-金');

    console.log(`✅ 五行のバランス(悪): ${hasGogyouBalance ? '表示' : '未表示'}`);
    console.log(`✅ 黒の方寄り: ${hasYouinKuro ? '表示' : '未表示'}`);
    console.log(`✅ 陰陽パターン ●●●: ${hasYouinPattern ? '表示' : '未表示'}`);
    console.log(`✅ 人格: 火-金: ${hasJinkaku ? '表示' : '未表示'}`);

    // スクリーンショットを撮影
    console.log('📸 スクリーンショットを撮影しています...');
    if (gogyouExists) {
      await page.evaluate(() => {
        const element = document.querySelector('text=gogyou_balance')?.closest('div');
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      await page.waitForTimeout(1000);
    }

    await page.screenshot({
      path: './tests/screenshots/seimei-result-test.png',
      fullPage: true
    });

    console.log('💾 スクリーンショットを保存しました: ./tests/screenshots/seimei-result-test.png');

    // 結果まとめ
    const allDisplayed = hasGogyouBalance && hasYouinKuro && hasYouinPattern && hasJinkaku;
    console.log(`\n📊 テスト結果: ${allDisplayed ? '✅ 成功' : '❌ 失敗'}`);

    if (!allDisplayed) {
      console.log('⚠️ 一部の要素が表示されていません。フロントエンドの修正が必要です。');
    }

  } catch (error) {
    console.error('❌ テスト実行中にエラーが発生しました:', error);
  } finally {
    console.log('🔄 ブラウザを5秒後に閉じます...');
    setTimeout(async () => {
      await browser.close();
      console.log('✅ テスト完了');
    }, 5000);
  }
}

testSeimeiDisplay().catch(console.error);