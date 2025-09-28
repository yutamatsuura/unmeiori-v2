import { chromium } from 'playwright';
import fs from 'fs/promises';

async function compareSeimeiWithLogin() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const results = [];

  // テストする5人
  const testPeople = [
    { sei: '田中', mei: '太郎' },
    { sei: '佐藤', mei: '花子' },
    { sei: '山田', mei: '一' },
    { sei: '鈴木', mei: '健太' },
    { sei: '高橋', mei: '美咲' }
  ];

  for (const person of testPeople) {
    console.log(`\n====== ${person.sei}${person.mei} の比較テスト ======`);

    const result = {
      name: `${person.sei}${person.mei}`,
      kigakuNavi: {},
      localhost: {},
      differences: []
    };

    // 1. 気学ナビで鑑定
    console.log('1. 気学ナビで鑑定中...');
    const kigakuPage = await context.newPage();

    try {
      await kigakuPage.goto('https://kigaku-navi.com/qsei/seimei.php');
      await kigakuPage.waitForLoadState('networkidle');

      // 入力フィールドを取得
      const textInputs = await kigakuPage.$$('input[type="text"]');
      if (textInputs.length >= 2) {
        await textInputs[0].fill(person.sei);
        await textInputs[1].fill(person.mei);
      }

      // 姓名鑑定ボタンをクリック
      await kigakuPage.click('a:has-text("姓名鑑定を行う")');

      // 結果を待つ
      await kigakuPage.waitForTimeout(3000);

      // 表から画数を取得
      const table = await kigakuPage.$('table');
      if (table) {
        const rows = await table.$$('tr');
        for (const row of rows) {
          const cells = await row.$$('td');
          if (cells.length >= 2) {
            const labelText = await cells[0].textContent();
            const valueText = await cells[cells.length - 1].textContent();

            if (labelText && valueText) {
              const label = labelText.trim();
              const valueMatch = valueText.match(/(\d+)/);

              if (valueMatch) {
                const value = parseInt(valueMatch[1]);

                if (label.includes('天格')) {
                  result.kigakuNavi['天格'] = value;
                  console.log(`  気学ナビ 天格: ${value}画`);
                } else if (label.includes('人格')) {
                  result.kigakuNavi['人格'] = value;
                  console.log(`  気学ナビ 人格: ${value}画`);
                } else if (label.includes('地格')) {
                  result.kigakuNavi['地格'] = value;
                  console.log(`  気学ナビ 地格: ${value}画`);
                } else if (label.includes('外格')) {
                  result.kigakuNavi['外格'] = value;
                  console.log(`  気学ナビ 外格: ${value}画`);
                } else if (label.includes('総格')) {
                  result.kigakuNavi['総格'] = value;
                  console.log(`  気学ナビ 総格: ${value}画`);
                }
              }
            }
          }
        }
      }

      // スクリーンショット保存
      await kigakuPage.screenshot({
        path: `tests/screenshots/${person.sei}${person.mei}_kigaku_final.png`,
        fullPage: true
      });

    } catch (error) {
      console.error('気学ナビエラー:', error.message);
    }

    await kigakuPage.close();

    // 2. localhost:3001で鑑定（ログインあり）
    console.log('2. localhost:3001で鑑定中...');
    const localPage = await context.newPage();

    try {
      // ログインページへアクセス
      await localPage.goto('http://localhost:3001/login');
      await localPage.waitForLoadState('networkidle');

      // ログイン処理
      await localPage.fill('input[type="email"]', 'test@example.com');
      await localPage.fill('input[type="password"]', 'testpass123');
      await localPage.click('button[type="submit"]');

      // ログイン後のページ遷移を待つ
      await localPage.waitForURL('**/create', { timeout: 10000 });
      await localPage.waitForLoadState('networkidle');

      // 姓名を入力
      // Material-UIのTextFieldを探す
      const inputs = await localPage.$$('input[type="text"]');
      if (inputs.length >= 2) {
        await inputs[0].fill(person.sei);
        await inputs[1].fill(person.mei);
      }

      // 計算ボタンをクリック（もしあれば）
      const calcButton = await localPage.$('button:has-text("鑑定"), button:has-text("計算")');
      if (calcButton) {
        await calcButton.click();
        await localPage.waitForTimeout(2000);
      } else {
        // 自動計算を待つ
        await localPage.waitForTimeout(3000);
      }

      // 結果を取得
      const bodyText = await localPage.textContent('body');

      // 画数パターンを抽出
      const patterns = {
        '天格': /天格[：:＝=\s]*(\d+)[画]?/,
        '人格': /人格[：:＝=\s]*(\d+)[画]?/,
        '地格': /地格[：:＝=\s]*(\d+)[画]?/,
        '外格': /外格[：:＝=\s]*(\d+)[画]?/,
        '総格': /総格[：:＝=\s]*(\d+)[画]?/
      };

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = bodyText.match(pattern);
        if (match) {
          result.localhost[key] = parseInt(match[1]);
          console.log(`  localhost ${key}: ${match[1]}画`);
        }
      }

      // スクリーンショット保存
      await localPage.screenshot({
        path: `tests/screenshots/${person.sei}${person.mei}_local_final.png`,
        fullPage: true
      });

    } catch (error) {
      console.error('localhostエラー:', error.message);
    }

    await localPage.close();

    // 3. 差分分析
    console.log('3. 差分分析:');
    const kakuTypes = ['天格', '人格', '地格', '外格', '総格'];

    for (const kaku of kakuTypes) {
      const kigaku = result.kigakuNavi[kaku];
      const local = result.localhost[kaku];

      if (kigaku !== undefined && local !== undefined) {
        if (kigaku === local) {
          console.log(`  ✅ ${kaku}: 一致 (${kigaku}画)`);
        } else {
          const diff = local - kigaku;
          result.differences.push({
            type: kaku,
            kigakuNavi: kigaku,
            localhost: local,
            difference: diff
          });
          console.log(`  ❌ ${kaku}: 気学ナビ=${kigaku}画, localhost=${local}画 (差=${diff > 0 ? '+' : ''}${diff})`);
        }
      } else {
        console.log(`  ⚠️ ${kaku}: データ不足 (気学ナビ=${kigaku || '取得失敗'}, localhost=${local || '取得失敗'})`);
      }
    }

    results.push(result);
  }

  // 最終レポート作成
  console.log('\n\n========================================');
  console.log('       姓名判断 比較検証レポート');
  console.log('========================================\n');

  let totalMatch = 0;
  let totalDiff = 0;
  let totalFailed = 0;

  for (const result of results) {
    console.log(`【${result.name}】`);

    const kakuTypes = ['天格', '人格', '地格', '外格', '総格'];
    let personMatch = 0;
    let personDiff = 0;
    let personFailed = 0;

    for (const kaku of kakuTypes) {
      const kigaku = result.kigakuNavi[kaku];
      const local = result.localhost[kaku];

      if (kigaku !== undefined && local !== undefined) {
        if (kigaku === local) {
          personMatch++;
        } else {
          personDiff++;
        }
      } else {
        personFailed++;
      }
    }

    if (personDiff > 0) {
      console.log(`  差分: ${personDiff}個`);
      result.differences.forEach(diff => {
        console.log(`    ${diff.type}: 気学=${diff.kigakuNavi}, local=${diff.localhost} (差=${diff.difference > 0 ? '+' : ''}${diff.difference})`);
      });
    } else if (personMatch === 5) {
      console.log(`  ✅ 完全一致 (5/5項目)`);
    } else {
      console.log(`  ⚠️ データ取得: 成功${personMatch}/5項目`);
    }

    totalMatch += personMatch;
    totalDiff += personDiff;
    totalFailed += personFailed;
  }

  console.log('\n【総計】');
  console.log(`  検証項目: ${testPeople.length * 5}個`);
  console.log(`  一致: ${totalMatch}個 (${(totalMatch / (testPeople.length * 5) * 100).toFixed(1)}%)`);
  console.log(`  差分: ${totalDiff}個 (${(totalDiff / (testPeople.length * 5) * 100).toFixed(1)}%)`);
  console.log(`  取得失敗: ${totalFailed}個 (${(totalFailed / (testPeople.length * 5) * 100).toFixed(1)}%)`);

  // JSONレポート保存
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testPeople.length * 5,
      match: totalMatch,
      diff: totalDiff,
      failed: totalFailed,
      matchRate: (totalMatch / (testPeople.length * 5) * 100).toFixed(1) + '%'
    },
    details: results
  };

  await fs.writeFile(
    'tests/comparison-report-final.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n📄 詳細レポート保存: tests/comparison-report-final.json');

  await browser.close();
}

// 実行
compareSeimeiWithLogin().catch(console.error);