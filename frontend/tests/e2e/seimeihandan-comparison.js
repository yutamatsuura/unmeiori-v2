import { chromium } from 'playwright';
import fs from 'fs/promises';

async function compareWithOriginalSeimeihandan() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext();
  const results = [];

  // テストする5人
  const testPeople = [
    { sei: '田中', mei: '太郎', fullName: '田中太郎' },
    { sei: '佐藤', mei: '花子', fullName: '佐藤花子' },
    { sei: '山田', mei: '一', fullName: '山田一' },
    { sei: '鈴木', mei: '健太', fullName: '鈴木健太' },
    { sei: '高橋', mei: '美咲', fullName: '高橋美咲' }
  ];

  for (const person of testPeople) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`  ${person.fullName} の比較テスト`);
    console.log(`${'='.repeat(50)}\n`);

    const result = {
      name: person.fullName,
      kigakuNavi: {},
      seimeihandan: {},
      localhost: {},
      differences: []
    };

    // 1. オリジナルseimeihandanで鑑定
    console.log('【オリジナルseimeihandan (localhost:8080)で鑑定】');
    const seimeihandanPage = await context.newPage();

    try {
      await seimeihandanPage.goto('http://localhost:8080/src/seimei.html');
      await seimeihandanPage.waitForLoadState('networkidle');

      // 姓と名を入力
      const seiInput = await seimeihandanPage.$('input[placeholder="姓"]');
      const meiInput = await seimeihandanPage.$('input[placeholder="名"]');
      
      if (seiInput && meiInput) {
        await seiInput.fill(person.sei);
        await meiInput.fill(person.mei);
      } else {
        // 代替セレクタ
        const inputs = await seimeihandanPage.$$('input[type="text"]');
        if (inputs.length >= 2) {
          await inputs[0].fill(person.sei);
          await inputs[1].fill(person.mei);
        }
      }

      // 鑑定ボタンをクリック
      const kanteiButton = await seimeihandanPage.$('button:has-text("鑑定")');
      if (kanteiButton) {
        await kanteiButton.click();
      } else {
        // 代替: aタグのボタンかもしれない
        await seimeihandanPage.click('a:has-text("姓名鑑定を行う")');
      }

      await seimeihandanPage.waitForTimeout(3000);

      // 結果を取得
      const bodyText = await seimeihandanPage.textContent('body');

      // 画数を抽出
      const extractValue = (text, kakuName) => {
        const patterns = [
          new RegExp(`${kakuName}[^0-9]*([0-9]+)`),
          new RegExp(`${kakuName}.*?([0-9]+)`),
        ];

        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match) {
            return parseInt(match[1]);
          }
        }
        return null;
      };

      result.seimeihandan['天格'] = extractValue(bodyText, '天格');
      result.seimeihandan['人格'] = extractValue(bodyText, '人格');
      result.seimeihandan['地格'] = extractValue(bodyText, '地格');
      result.seimeihandan['外格'] = extractValue(bodyText, '外格');
      result.seimeihandan['総格'] = extractValue(bodyText, '総格');

      // 取得した値を表示
      for (const [key, value] of Object.entries(result.seimeihandan)) {
        if (value !== null) {
          console.log(`  ${key}: ${value}画`);
        }
      }

      // スクリーンショット
      await seimeihandanPage.screenshot({
        path: `tests/screenshots/${person.fullName}_seimeihandan.png`,
        fullPage: true
      });

    } catch (error) {
      console.error('seimeihandanエラー:', error.message);
    }

    await seimeihandanPage.close();

    // 2. 気学ナビで鑑定
    console.log('\n【気学ナビで鑑定】');
    const kigakuPage = await context.newPage();

    try {
      await kigakuPage.goto('https://kigaku-navi.com/qsei/seimei.php');
      await kigakuPage.waitForLoadState('networkidle');

      const textInputs = await kigakuPage.$$('input[type="text"]');
      if (textInputs.length >= 2) {
        await textInputs[0].fill(person.sei);
        await textInputs[1].fill(person.mei);
      }

      await kigakuPage.click('a:has-text("姓名鑑定を行う")');
      await kigakuPage.waitForTimeout(3000);

      const bodyText = await kigakuPage.textContent('body');

      const extractKigakuValue = (text, kakuName) => {
        const patterns = [
          new RegExp(`${kakuName}[^0-9]*([0-9]+)`),
          new RegExp(`${kakuName}.*?([0-9]+)`),
        ];

        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match) {
            return parseInt(match[1]);
          }
        }
        return null;
      };

      result.kigakuNavi['天格'] = extractKigakuValue(bodyText, '天格');
      result.kigakuNavi['人格'] = extractKigakuValue(bodyText, '人格');
      result.kigakuNavi['地格'] = extractKigakuValue(bodyText, '地格');
      result.kigakuNavi['外格'] = extractKigakuValue(bodyText, '外格');
      result.kigakuNavi['総格'] = extractKigakuValue(bodyText, '総格');

      for (const [key, value] of Object.entries(result.kigakuNavi)) {
        if (value !== null) {
          console.log(`  ${key}: ${value}画`);
        }
      }

    } catch (error) {
      console.error('気学ナビエラー:', error.message);
    }

    await kigakuPage.close();

    // 3. 差分分析
    console.log('\n【差分分析】');
    const kakuTypes = ['天格', '人格', '地格', '外格', '総格'];

    console.log('seimeihandan vs 気学ナビ:');
    for (const kaku of kakuTypes) {
      const seimei = result.seimeihandan[kaku];
      const kigaku = result.kigakuNavi[kaku];

      if (seimei !== null && kigaku !== null) {
        if (seimei === kigaku) {
          console.log(`  ✅ ${kaku}: 一致 (${seimei}画)`);
        } else {
          const diff = seimei - kigaku;
          console.log(`  ❌ ${kaku}: seimeihandan=${seimei}画, 気学ナビ=${kigaku}画 (差=${diff > 0 ? '+' : ''}${diff})`);
        }
      }
    }

    results.push(result);
  }

  // 最終レポート
  console.log('\n\n' + '='.repeat(60));
  console.log('         オリジナル実装 比較検証レポート');
  console.log('='.repeat(60) + '\n');

  const report = {
    timestamp: new Date().toISOString(),
    comparison: 'seimeihandan vs kigaku-navi',
    results: results
  };

  await fs.writeFile(
    'tests/seimeihandan-comparison-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('📄 レポート保存完了: tests/seimeihandan-comparison-report.json');

  await browser.close();
}

// 実行
compareWithOriginalSeimeihandan().catch(console.error);