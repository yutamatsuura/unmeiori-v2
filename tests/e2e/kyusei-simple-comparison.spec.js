const { test, expect } = require('@playwright/test');

test.describe('九星気学 簡易比較テスト', () => {

  test('気学なびとローカルサイトの比較（1990-05-15）', async ({ browser }) => {
    console.log('=== 九星気学比較テスト開始 ===');
    console.log('テストデータ: 1990年5月15日生まれ 男性');

    let kigakuNaviResult = {};
    let localResult = {};

    // ========== 気学なびサイト ==========
    console.log('\n--- 気学なびサイトテスト ---');
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();

    try {
      await page1.goto('https://kigaku-navi.com/qsei/ban_birthday.php', { waitUntil: 'networkidle' });
      console.log('気学なびサイトにアクセス');

      // セレクトボックスで生年月日を入力
      const selects = await page1.locator('select').all();
      console.log(`セレクトボックス数: ${selects.length}`);

      if (selects.length >= 4) {
        await selects[0].selectOption('1990'); // 年
        await selects[1].selectOption('5');     // 月
        await selects[2].selectOption('15');    // 日
        await selects[3].selectOption('男');    // 性別
        console.log('生年月日入力完了: 1990/5/15 男');
      }

      // 九星を調べるボタンをクリック
      const submitButton = page1.locator('button:has-text("九星を調べる")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        console.log('九星を調べるボタンクリック');
      }

      await page1.waitForTimeout(3000);

      // 結果を取得
      const pageText = await page1.textContent('body');

      // 九星を抽出
      const kyuseiPattern = /(一白水星|二黒土星|三碧木星|四緑木星|五黄土星|六白金星|七赤金星|八白土星|九紫火星)/g;
      const matches = pageText.match(kyuseiPattern);

      if (matches && matches.length > 0) {
        kigakuNaviResult.honmeisei = matches[0];
        console.log(`気学なび 本命星: ${matches[0]}`);
        if (matches.length > 1) {
          kigakuNaviResult.gekkeisei = matches[1];
          console.log(`気学なび 月命星: ${matches[1]}`);
        }
      }

      // スクリーンショット
      await page1.screenshot({
        path: './tests/screenshots/kigaku-navi-result.png',
        fullPage: true
      });

    } catch (error) {
      console.error('気学なびサイトエラー:', error.message);
    } finally {
      await context1.close();
    }

    // ========== ローカルサイト ==========
    console.log('\n--- ローカルサイトテスト ---');
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    try {
      // ログイン
      await page2.goto('http://localhost:3001', { waitUntil: 'networkidle' });
      const emailInput = page2.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        const passwordInput = page2.locator('input[type="password"]').first();
        await passwordInput.fill('aikakumei');
        const loginButton = page2.locator('button').filter({ hasText: /ログイン/ }).first();
        await loginButton.click();
        await page2.waitForLoadState('networkidle');
        console.log('ログイン完了');
      }

      // createページへ移動
      await page2.goto('http://localhost:3001/create', { waitUntil: 'networkidle' });
      console.log('作成ページにアクセス');

      // フォーム入力
      const nameInput = page2.locator('input[type="text"]').first();
      await nameInput.fill('テスト太郎');

      const dateInput = page2.locator('input[type="date"]').first();
      await dateInput.fill('1990-05-15');

      const emailField = page2.locator('input[type="email"]').first();
      await emailField.fill('test@example.com');

      // 性別選択
      const genderSelect = page2.locator('.MuiSelect-root, select').first();
      if (await genderSelect.isVisible()) {
        await genderSelect.click();
        const maleOption = page2.locator('[role="option"]:has-text("男性"), .MuiMenuItem-root:has-text("男性")').first();
        if (await maleOption.isVisible()) {
          await maleOption.click();
        }
      }

      console.log('フォーム入力完了: 1990-05-15 男性');

      // 鑑定実行
      const execButton = page2.locator('button').filter({ hasText: /鑑定|計算|実行/ }).first();
      await execButton.click();
      console.log('鑑定実行ボタンクリック');

      await page2.waitForTimeout(5000);

      // 結果を取得
      const localPageText = await page2.textContent('body');

      // 本命星を抽出（「本命星」の後に出てくる九星）
      const honmeiseiIndex = localPageText.indexOf('本命星');
      if (honmeiseiIndex !== -1) {
        const afterHonmeisei = localPageText.substring(honmeiseiIndex, honmeiseiIndex + 50);
        const honmeiseiMatch = afterHonmeisei.match(/(一白水星|二黒土星|三碧木星|四緑木星|五黄土星|六白金星|七赤金星|八白土星|九紫火星)/);
        if (honmeiseiMatch) {
          localResult.honmeisei = honmeiseiMatch[0];
          console.log(`ローカル 本命星: ${honmeiseiMatch[0]}`);
        }
      }

      // 月命星を抽出
      const gekkeiseiIndex = localPageText.indexOf('月命星');
      if (gekkeiseiIndex !== -1) {
        const afterGekkeisei = localPageText.substring(gekkeiseiIndex, gekkeiseiIndex + 50);
        const gekkeiseiMatch = afterGekkeisei.match(/(一白水星|二黒土星|三碧木星|四緑木星|五黄土星|六白金星|七赤金星|八白土星|九紫火星)/);
        if (gekkeiseiMatch) {
          localResult.gekkeisei = gekkeiseiMatch[0];
          console.log(`ローカル 月命星: ${gekkeiseiMatch[0]}`);
        }
      }

      // スクリーンショット
      await page2.screenshot({
        path: './tests/screenshots/local-result-comparison.png',
        fullPage: true
      });

    } catch (error) {
      console.error('ローカルサイトエラー:', error.message);
    } finally {
      await context2.close();
    }

    // ========== 比較結果 ==========
    console.log('\n=== 比較結果（1990年5月15日 男性）===');
    console.log('項目\t\t気学なび\t\tローカルサイト\t\t判定');
    console.log('-----------------------------------------------------------');

    // 本命星比較
    const honmeiseiMatch = kigakuNaviResult.honmeisei === localResult.honmeisei;
    console.log(`本命星\t\t${kigakuNaviResult.honmeisei || '取得失敗'}\t\t${localResult.honmeisei || '取得失敗'}\t\t${honmeiseiMatch ? '✅ 一致' : '❌ 不一致'}`);

    // 月命星比較
    const gekkeiseiMatch = kigakuNaviResult.gekkeisei === localResult.gekkeisei;
    console.log(`月命星\t\t${kigakuNaviResult.gekkeisei || '取得失敗'}\t\t${localResult.gekkeisei || '取得失敗'}\t\t${gekkeiseiMatch ? '✅ 一致' : '❌ 不一致'}`);

    // 総合判定
    console.log('\n=== 総合判定 ===');
    if (!kigakuNaviResult.honmeisei || !localResult.honmeisei) {
      console.log('⚠️ データ取得に失敗しました');
    } else if (honmeiseiMatch && gekkeiseiMatch) {
      console.log('✅ 全項目一致 - 九星気学エンジンは正常に動作しています');
    } else {
      console.log('❌ 不一致あり - エンジンの修正が必要です');

      if (!honmeiseiMatch) {
        console.log(`  - 本命星が不一致: 気学なび=${kigakuNaviResult.honmeisei}, ローカル=${localResult.honmeisei}`);
      }
      if (!gekkeiseiMatch) {
        console.log(`  - 月命星が不一致: 気学なび=${kigakuNaviResult.gekkeisei}, ローカル=${localResult.gekkeisei}`);
      }
    }

    console.log('\n=== テスト完了 ===');
  });
});