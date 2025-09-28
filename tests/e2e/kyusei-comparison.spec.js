const { test, expect, chromium } = require('@playwright/test');

// テストデータ（5つのサンプル）
const testData = [
  {
    name: 'sample1',
    year: '1990',
    month: '3',
    day: '15',
    gender: '男性'
  },
  {
    name: 'sample2',
    year: '1985',
    month: '7',
    day: '20',
    gender: '女性'
  },
  {
    name: 'sample3',
    year: '2000',
    month: '1',
    day: '1',
    gender: '男性'
  },
  {
    name: 'sample4',
    year: '1975',
    month: '12',
    day: '25',
    gender: '女性'
  },
  {
    name: 'sample5',
    year: '1995',
    month: '9',
    day: '11',
    gender: '男性'
  }
];

test.describe('九星気学計算結果比較テスト', () => {

  test.beforeAll(async () => {
    console.log('九星気学検証テスト開始');
    console.log('対象サイト: 気学なび vs ローカルサイト');
  });

  for (const data of testData) {
    test(`${data.name}: ${data.year}年${data.month}月${data.day}日 ${data.gender} の九星計算結果比較`, async ({ browser }) => {

      // 気学なびサイトでの結果取得
      const kigakuNaviResult = await getKigakuNaviResult(browser, data);
      console.log(`${data.name} - 気学なびサイト結果:`, kigakuNaviResult);

      // ローカルサイトでの結果取得
      const localResult = await getLocalSiteResult(browser, data);
      console.log(`${data.name} - ローカルサイト結果:`, localResult);

      // 結果の比較
      await compareResults(data, kigakuNaviResult, localResult);
    });
  }
});

/**
 * 気学なびサイトから九星計算結果を取得
 */
async function getKigakuNaviResult(browser, data) {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 気学なびサイトを使用
    await page.goto('https://kigaku-navi.com/qsei/ban_birthday.php', { waitUntil: 'networkidle' });

    // ページが読み込まれるまで待機
    await page.waitForTimeout(3000);

    // 気学なびサイトのフォーム処理
    try {
      // セレクトボックスがすべて存在することを確認
      const selects = await page.locator('select').all();
      console.log(`セレクトボックス数: ${selects.length}`);

      if (selects.length >= 4) {
        // 年のセレクトボックス（最初のselect）
        await selects[0].selectOption(data.year);
        await page.waitForTimeout(500);

        // 月のセレクトボックス（2番目のselect）
        await selects[1].selectOption(data.month);
        await page.waitForTimeout(500);

        // 日のセレクトボックス（3番目のselect）
        await selects[2].selectOption(data.day);
        await page.waitForTimeout(500);

        // 性別のセレクトボックス（4番目のselect）
        const genderValue = data.gender === '男性' ? '男' : '女';
        await selects[3].selectOption(genderValue);
        await page.waitForTimeout(500);

        console.log(`入力値: ${data.year}年${data.month}月${data.day}日 ${genderValue}`);
      } else {
        console.error(`十分なセレクトボックスが見つかりません（${selects.length}個）`);
      }

      // 「九星を調べる」ボタンをクリック
      const submitButton = page.locator('button:has-text("九星を調べる")').first();
      if (await submitButton.isVisible()) {
        console.log('九星を調べるボタンをクリック');
        await submitButton.click();
      } else {
        // ボタンが見つからない場合は、別のセレクタも試す
        const alternativeSubmit = page.locator('button').filter({ hasText: /九星/ }).first();
        if (await alternativeSubmit.isVisible()) {
          console.log('代替ボタンをクリック');
          await alternativeSubmit.click();
        } else {
          // フォームが見つからない場合は、スクリーンショットを撮影
          await page.screenshot({
            path: `./tests/screenshots/kigaku-navi-no-button-${data.name}.png`,
            fullPage: true
          });
          throw new Error('九星を調べるボタンが見つかりません');
        }
      }


      // 結果ページの読み込みを待つ
      await page.waitForTimeout(3000);

      // 結果を取得
      const result = await extractKigakuNaviResults(page, data);

      // スクリーンショット撮影
      await page.screenshot({
        path: `./tests/screenshots/keisan-site-result-${data.name}.png`,
        fullPage: true
      });

      return result;

    } catch (error) {
      console.error(`計算サイト処理エラー (${data.name}):`, error.message);

      // エラー時のスクリーンショット
      await page.screenshot({
        path: `./tests/screenshots/keisan-site-error-${data.name}.png`,
        fullPage: true
      });

      return {
        error: error.message,
        honmeisei: null,
        gekkeisei: null,
        kichihoui: null
      };
    }

  } finally {
    await context.close();
  }
}

/**
 * 気学なびサイトから結果を抽出
 */
async function extractKigakuNaviResults(page, data) {
  try {
    // ページの全テキストを取得
    const pageText = await page.textContent('body');
    console.log('ページテキスト（最初の500文字）:', pageText.substring(0, 500));

    // 九星のパターン
    const kyuseiPattern = /(一白水星|二黒土星|三碧木星|四緑木星|五黄土星|六白金星|七赤金星|八白土星|九紫火星)/g;
    const matches = pageText.match(kyuseiPattern);

    let honmeisei = null;
    let gekkeisei = null;

    if (matches && matches.length > 0) {
      honmeisei = matches[0]; // 最初に見つかった九星を本命星とする
      console.log('抽出した本命星:', honmeisei);

      if (matches.length > 1) {
        gekkeisei = matches[1]; // 2番目に見つかった九星を月命星とする
        console.log('抽出した月命星:', gekkeisei);
      }
    }

    // 吉方位を抽出（方角のパターン）
    const houiPattern = /(北|東北|東|東南|南|西南|西|西北)/g;
    const houiMatches = pageText.match(houiPattern);
    let kichihoui = null;

    if (houiMatches && houiMatches.length > 0) {
      // 「吉方位」という文字の後に出てくる方角を探す
      const kichihiIndex = pageText.indexOf('吉方位');
      if (kichihiIndex !== -1) {
        const afterKichihi = pageText.substring(kichihiIndex, kichihiIndex + 100);
        const houiAfterKichihi = afterKichihi.match(houiPattern);
        if (houiAfterKichihi && houiAfterKichihi.length > 0) {
          kichihoui = houiAfterKichihi.join('、');
          console.log('抽出した吉方位:', kichihoui);
        }
      }
    }

    return {
      honmeisei: cleanText(honmeisei),
      gekkeisei: cleanText(gekkeisei),
      kichihoui: cleanText(kichihoui),
      raw_page_content: pageText.substring(0, 1000) // デバッグ用に最初の1000文字を保存
    };

  } catch (error) {
    console.error('気学なび結果抽出エラー:', error.message);
    return {
      error: error.message,
      honmeisei: null,
      gekkeisei: null,
      kichihoui: null
    };
  }
}

/**
 * ローカルサイトから九星計算結果を取得
 */
async function getLocalSiteResult(browser, data) {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // まずログインページにアクセス
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // ログインが必要か確認
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 })) {
      console.log('ログインが必要です。ログイン処理を実行します。');

      // ログイン情報を入力（CLAUDE.mdの正しい認証情報）
      await emailInput.fill('test@example.com');
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill('aikakumei');

      // ログインボタンをクリック
      const loginButton = page.locator('button').filter({ hasText: /ログイン|Login|サインイン/ }).first();
      await loginButton.click();
      await page.waitForLoadState('networkidle');
      console.log('ログイン完了');
    }

    // createページに移動
    await page.goto('http://localhost:3001/create', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // フォームの入力
    try {
      // 名前フィールドを探す（姓・名）
      const nameInputs = await page.locator('input[type="text"]:not([type="date"]):not([type="email"])').all();
      if (nameInputs.length >= 2) {
        // 姓を入力
        await nameInputs[0].fill(`テスト${data.name}`);
        await page.waitForTimeout(300);
        // 名を入力
        await nameInputs[1].fill('太郎');
        await page.waitForTimeout(300);
        console.log(`名前入力: テスト${data.name} 太郎`);
      }

      // メールアドレス入力（createページにある場合）
      const createEmailInput = page.locator('input[type="email"]').first();
      if (await createEmailInput.isVisible({ timeout: 1000 })) {
        await createEmailInput.fill(`test${data.name}@example.com`);
        await page.waitForTimeout(300);
        console.log(`メールアドレス入力: test${data.name}@example.com`);
      }

      // 生年月日の入力
      const birthDateInput = page.locator('input[type="date"]').first();
      if (await birthDateInput.isVisible()) {
        // YYYY-MM-DD形式で入力
        const dateString = `${data.year}-${String(data.month).padStart(2, '0')}-${String(data.day).padStart(2, '0')}`;
        await birthDateInput.fill(dateString);
        await page.waitForTimeout(500);
        console.log(`生年月日入力: ${dateString}`);
      } else {
        // 個別の年月日入力フィールドを探す
        console.log('個別の年月日フィールドを探します...');
        const yearInput = page.locator('input').filter({ hasText: /年/ }).or(page.locator('select').filter({ hasText: /年/ })).first();
        const monthInput = page.locator('input').filter({ hasText: /月/ }).or(page.locator('select').filter({ hasText: /月/ })).first();
        const dayInput = page.locator('input').filter({ hasText: /日/ }).or(page.locator('select').filter({ hasText: /日/ })).first();

        if (await yearInput.isVisible()) {
          await yearInput.fill(data.year);
          await page.waitForTimeout(300);
        }
        if (await monthInput.isVisible()) {
          await monthInput.fill(data.month);
          await page.waitForTimeout(300);
        }
        if (await dayInput.isVisible()) {
          await dayInput.fill(data.day);
          await page.waitForTimeout(300);
        }
      }

      // 性別選択
      console.log(`性別選択: ${data.gender}`);
      const maleRadio = page.locator('input[type="radio"][value="male"], input[type="radio"][value="男性"], label:has-text("男性") input[type="radio"]').first();
      const femaleRadio = page.locator('input[type="radio"][value="female"], input[type="radio"][value="女性"], label:has-text("女性") input[type="radio"]').first();

      if (data.gender === '男性' && await maleRadio.isVisible()) {
        await maleRadio.click();
      } else if (data.gender === '女性' && await femaleRadio.isVisible()) {
        await femaleRadio.click();
      }
      await page.waitForTimeout(300);

      // 生成/計算ボタンをクリック
      const submitButton = page.locator('button').filter({ hasText: /生成|計算|診断|鑑定|作成/ }).first();
      if (await submitButton.isVisible()) {
        console.log('生成ボタンをクリックします');
        await submitButton.click();
        await page.waitForTimeout(3000);
      }

    } catch (formError) {
      console.error('フォーム入力エラー:', formError.message);
    }

    // 結果を抽出
    const result = await extractLocalSiteResults(page, data);

    // スクリーンショット撮影
    await page.screenshot({
      path: `./tests/screenshots/local-site-result-${data.name}.png`,
      fullPage: true
    });

    return result;

  } catch (error) {
    console.error(`ローカルサイト処理エラー (${data.name}):`, error.message);

    // エラー時のスクリーンショット
    await page.screenshot({
      path: `./tests/screenshots/local-site-error-${data.name}.png`,
      fullPage: true
    });

    return {
      error: error.message,
      honmeisei: null,
      gekkeisei: null,
      kichihoui: null
    };
  } finally {
    await context.close();
  }
}

/**
 * ローカルサイトから結果を抽出
 */
async function extractLocalSiteResults(page, data) {
  try {
    // ページの全テキストを取得
    const pageText = await page.textContent('body');
    console.log('ローカルページテキスト（最初の500文字）:', pageText.substring(0, 500));

    // 九星のパターン
    const kyuseiPattern = /(一白水星|二黒土星|三碧木星|四緑木星|五黄土星|六白金星|七赤金星|八白土星|九紫火星)/g;
    const matches = pageText.match(kyuseiPattern);

    let honmeisei = null;
    let gekkeisei = null;

    if (matches && matches.length > 0) {
      honmeisei = matches[0]; // 最初に見つかった九星を本命星とする
      console.log('ローカル抽出した本命星:', honmeisei);

      if (matches.length > 1) {
        gekkeisei = matches[1]; // 2番目に見つかった九星を月命星とする
        console.log('ローカル抽出した月命星:', gekkeisei);
      }
    }

    // 吉方位を抽出（方角のパターン）
    const houiPattern = /(北|東北|東|東南|南|西南|西|西北)/g;
    let kichihoui = null;

    // 「吉方位」という文字の後に出てくる方角を探す
    const kichihiIndex = pageText.indexOf('吉方位');
    if (kichihiIndex !== -1) {
      const afterKichihi = pageText.substring(kichihiIndex, kichihiIndex + 100);
      const houiAfterKichihi = afterKichihi.match(houiPattern);
      if (houiAfterKichihi && houiAfterKichihi.length > 0) {
        kichihoui = houiAfterKichihi.join('、');
        console.log('ローカル抽出した吉方位:', kichihoui);
      }
    }

    return {
      honmeisei: cleanText(honmeisei),
      gekkeisei: cleanText(gekkeisei),
      kichihoui: cleanText(kichihoui),
      raw_page_content: pageText.substring(0, 1000) // デバッグ用に最初の1000文字を保存
    };

  } catch (error) {
    console.error('ローカルサイト結果抽出エラー:', error.message);
    return {
      error: error.message,
      honmeisei: null,
      gekkeisei: null,
      kichihoui: null
    };
  }
}

/**
 * ログイン処理（必要に応じて実装）
 */
async function performLogin(page) {
  try {
    // テスト用のログイン情報
    const loginEmail = 'test@example.com';
    const loginPassword = 'testpass123';

    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();
    const loginButton = await page.locator('button:has-text("ログイン"), button[type="submit"]').first();

    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill(loginEmail);
      await passwordInput.fill(loginPassword);
      await loginButton.click();
      await page.waitForTimeout(2000);
    }
  } catch (error) {
    console.error('ログイン処理エラー:', error.message);
  }
}

/**
 * 結果の比較
 */
async function compareResults(data, kigakuNaviResult, localResult) {
  console.log(`\n=== ${data.name} (${data.year}/${data.month}/${data.day} ${data.gender}) 比較結果 ===`);

  // 本命星の比較
  if (kigakuNaviResult.honmeisei && localResult.honmeisei) {
    const match = kigakuNaviResult.honmeisei === localResult.honmeisei;
    console.log(`本命星: ${match ? '一致' : '不一致'}`);
    console.log(`  気学なび: ${kigakuNaviResult.honmeisei}`);
    console.log(`  ローカル: ${localResult.honmeisei}`);

    if (!match) {
      console.error(`❌ 本命星が一致しません！`);
    }
  } else {
    console.log('本命星: 比較不可（データ不足）');
    console.log(`  気学なび: ${kigakuNaviResult.honmeisei || 'データなし'}`);
    console.log(`  ローカル: ${localResult.honmeisei || 'データなし'}`);
  }

  // 月命星の比較
  if (kigakuNaviResult.gekkeisei && localResult.gekkeisei) {
    const match = kigakuNaviResult.gekkeisei === localResult.gekkeisei;
    console.log(`月命星: ${match ? '一致' : '不一致'}`);
    console.log(`  気学なび: ${kigakuNaviResult.gekkeisei}`);
    console.log(`  ローカル: ${localResult.gekkeisei}`);

    if (!match) {
      console.error(`❌ 月命星が一致しません！`);
    }
  } else {
    console.log('月命星: 比較不可（データ不足）');
  }

  // 吉方位の比較
  if (kigakuNaviResult.kichihoui && localResult.kichihoui) {
    const match = kigakuNaviResult.kichihoui === localResult.kichihoui;
    console.log(`吉方位: ${match ? '一致' : '不一致'}`);
    console.log(`  気学なび: ${kigakuNaviResult.kichihoui}`);
    console.log(`  ローカル: ${localResult.kichihoui}`);
  } else {
    console.log('吉方位: 比較不可（データ不足）');
  }

  // エラーがある場合の報告
  if (kigakuNaviResult.error) {
    console.error(`気学なびエラー: ${kigakuNaviResult.error}`);
  }

  if (localResult.error) {
    console.error(`ローカルサイトエラー: ${localResult.error}`);
  }

  console.log('='.repeat(60));
}

/**
 * テキストをクリーンアップ
 */
function cleanText(text) {
  if (!text) return null;
  return text.trim().replace(/\s+/g, ' ');
}