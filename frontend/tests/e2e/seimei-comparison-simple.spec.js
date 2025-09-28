import { test, chromium } from '@playwright/test';
import fs from 'fs/promises';

// テストデータ（5人分）
const testData = [
  { sei: '田中', mei: '太郎' },
  { sei: '佐藤', mei: '花子' },
  { sei: '山田', mei: '一' },
  { sei: '鈴木', mei: '健太' },
  { sei: '高橋', mei: '美咲' }
];

test('姓名判断比較検証（5人分）', async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  const results = [];

  for (const person of testData) {
    console.log(`\n====== ${person.sei}${person.mei} の比較開始 ======`);

    const result = {
      name: `${person.sei}${person.mei}`,
      kigakuNavi: {},
      localhost: {},
      differences: []
    };

    // 1. 気学ナビの結果取得
    const kigakuPage = await context.newPage();
    console.log('気学ナビにアクセス中...');

    try {
      await kigakuPage.goto('https://kigaku-navi.com/qsei/seimei.php', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 入力フィールドを探す
      const seiInput = await kigakuPage.$('input[name="sei"], input[placeholder*="姓"]');
      const meiInput = await kigakuPage.$('input[name="mei"], input[placeholder*="名"]');

      if (seiInput && meiInput) {
        await seiInput.fill(person.sei);
        await meiInput.fill(person.mei);

        // 鑑定ボタンをクリック
        const submitButton = await kigakuPage.$('input[type="submit"], button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await kigakuPage.waitForTimeout(3000);
        }
      }

      // 結果ページのテキストを取得
      const kigakuText = await kigakuPage.textContent('body');

      // 各格数を抽出
      const patterns = {
        tenkaku: /天格[：:＝=\s]*(\d+)/,
        jinkaku: /人格[：:＝=\s]*(\d+)/,
        chikaku: /地格[：:＝=\s]*(\d+)/,
        gaikaku: /外格[：:＝=\s]*(\d+)/,
        soukaku: /総格[：:＝=\s]*(\d+)/
      };

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = kigakuText.match(pattern);
        if (match) {
          result.kigakuNavi[key] = parseInt(match[1]);
          console.log(`気学ナビ ${key}: ${match[1]}`);
        }
      }

    } catch (error) {
      console.error('気学ナビエラー:', error.message);
    }

    await kigakuPage.close();

    // 2. localhostの結果取得
    const localPage = await context.newPage();
    console.log('localhost:3001にアクセス中...');

    try {
      await localPage.goto('http://localhost:3001/create', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Material-UI TextFieldを考慮したセレクタ
      const seiInputs = await localPage.$$('input[type="text"]');

      if (seiInputs.length >= 2) {
        // 最初の2つが姓・名の入力欄と仮定
        await seiInputs[0].fill(person.sei);
        await seiInputs[1].fill(person.mei);

        // 自動計算を待つ
        await localPage.waitForTimeout(2000);

        // 結果を取得
        const localText = await localPage.textContent('body');

        // 各格数を抽出
        const patterns = {
          tenkaku: /天格[：:＝=\s]*(\d+)/,
          jinkaku: /人格[：:＝=\s]*(\d+)/,
          chikaku: /地格[：:＝=\s]*(\d+)/,
          gaikaku: /外格[：:＝=\s]*(\d+)/,
          soukaku: /総格[：:＝=\s]*(\d+)/
        };

        for (const [key, pattern] of Object.entries(patterns)) {
          const match = localText.match(pattern);
          if (match) {
            result.localhost[key] = parseInt(match[1]);
            console.log(`localhost ${key}: ${match[1]}`);
          }
        }
      }

      // スクリーンショット保存
      await localPage.screenshot({
        path: `tests/screenshots/comparison_${person.sei}${person.mei}_local.png`,
        fullPage: true
      });

    } catch (error) {
      console.error('localhostエラー:', error.message);
    }

    await localPage.close();

    // 3. 差分分析
    console.log('\n差分分析:');
    const kakuTypes = ['tenkaku', 'jinkaku', 'chikaku', 'gaikaku', 'soukaku'];

    for (const kaku of kakuTypes) {
      const kigakuValue = result.kigakuNavi[kaku];
      const localhostValue = result.localhost[kaku];

      if (kigakuValue !== undefined && localhostValue !== undefined) {
        if (kigakuValue !== localhostValue) {
          const diff = {
            type: kaku,
            kigakuNavi: kigakuValue,
            localhost: localhostValue,
            difference: localhostValue - kigakuValue
          };
          result.differences.push(diff);
          console.log(`❌ ${kaku}: 気学ナビ=${kigakuValue}, localhost=${localhostValue}, 差=${diff.difference}`);
        } else {
          console.log(`✅ ${kaku}: 一致 (${kigakuValue})`);
        }
      } else if (kigakuValue !== undefined || localhostValue !== undefined) {
        console.log(`⚠️ ${kaku}: データ不足 (気学ナビ=${kigakuValue || '取得失敗'}, localhost=${localhostValue || '取得失敗'})`);
      }
    }

    results.push(result);
  }

  // 結果をJSONファイルに保存
  await fs.writeFile(
    'tests/comparison-results.json',
    JSON.stringify(results, null, 2)
  );

  // サマリー表示
  console.log('\n========== 比較検証サマリー ==========');

  let totalTests = 0;
  let totalDifferences = 0;

  for (const result of results) {
    console.log(`\n${result.name}:`);

    const kakuTypes = ['tenkaku', 'jinkaku', 'chikaku', 'gaikaku', 'soukaku'];
    for (const kaku of kakuTypes) {
      if (result.kigakuNavi[kaku] !== undefined && result.localhost[kaku] !== undefined) {
        totalTests++;
      }
    }

    if (result.differences.length > 0) {
      console.log(`  差分: ${result.differences.length}個`);
      result.differences.forEach(diff => {
        console.log(`    ${diff.type}: 気学ナビ=${diff.kigakuNavi}, localhost=${diff.localhost} (差=${diff.difference})`);
      });
      totalDifferences += result.differences.length;
    } else {
      const hasData = Object.keys(result.kigakuNavi).length > 0 && Object.keys(result.localhost).length > 0;
      if (hasData) {
        console.log(`  結果: 完全一致 ✅`);
      } else {
        console.log(`  結果: データ取得失敗 ⚠️`);
      }
    }
  }

  console.log(`\n総テスト項目: ${totalTests}個`);
  console.log(`総差分数: ${totalDifferences}個`);
  console.log(`一致率: ${((totalTests - totalDifferences) / totalTests * 100).toFixed(1)}%`);

  await browser.close();
});