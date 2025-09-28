import { chromium } from 'playwright';

async function testSeimeiComparison() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500  // 動作を見やすくするため
  });

  const context = await browser.newContext();
  const results = [];

  // テストデータ
  const testData = [
    { sei: '田中', mei: '太郎' },
    { sei: '佐藤', mei: '花子' },
    { sei: '山田', mei: '一' },
    { sei: '鈴木', mei: '健太' },
    { sei: '高橋', mei: '美咲' }
  ];

  for (const person of testData) {
    console.log(`\n====== ${person.sei}${person.mei} の比較開始 ======`);

    const result = {
      name: `${person.sei}${person.mei}`,
      kigakuNavi: {},
      localhost: {},
      differences: []
    };

    // 1. localhost:3001の結果を先に取得
    console.log('localhost:3001にアクセス中...');
    const localPage = await context.newPage();

    try {
      await localPage.goto('http://localhost:3001/create');
      await localPage.waitForLoadState('networkidle');

      // Material-UI TextFieldの入力（IDを使用）
      await localPage.fill('#sei', person.sei);
      await localPage.fill('#mei', person.mei);

      // 計算が実行されるまで待機
      await localPage.waitForTimeout(2000);

      // 結果を取得（Material-UIコンポーネントから）
      const getLocalValue = async (label) => {
        try {
          // まず、ラベルの次の要素を探す
          const element = await localPage.$(`text="${label}" >> xpath=.. >> xpath=following-sibling::*`);
          if (!element) {
            // 別の方法: テーブル構造を探す
            const td = await localPage.$(`td:has-text("${label}") + td`);
            if (td) return await td.textContent();

            // さらに別の方法: 同じ行内を探す
            const row = await localPage.$(`tr:has-text("${label}")`);
            if (row) {
              const text = await row.textContent();
              const match = text.match(/(\d+)/);
              if (match) return match[1];
            }
          }
          if (element) {
            const text = await element.textContent();
            const match = text.match(/(\d+)/);
            if (match) return match[1];
          }
        } catch (e) {
          console.log(`${label} 取得エラー:`, e.message);
        }
        return null;
      };

      result.localhost.tenkaku = await getLocalValue('天格');
      result.localhost.jinkaku = await getLocalValue('人格');
      result.localhost.chikaku = await getLocalValue('地格');
      result.localhost.gaikaku = await getLocalValue('外格');
      result.localhost.soukaku = await getLocalValue('総格');

      console.log('localhost結果:', result.localhost);

      // スクリーンショット保存
      await localPage.screenshot({
        path: `tests/screenshots/${person.sei}${person.mei}_local.png`,
        fullPage: true
      });

    } catch (error) {
      console.error('localhostエラー:', error);
    }

    await localPage.close();

    // 2. 気学ナビの結果取得
    console.log('気学ナビにアクセス中...');
    const kigakuPage = await context.newPage();

    try {
      await kigakuPage.goto('https://kigaku-navi.com/qsei/seimei.php');
      await kigakuPage.waitForLoadState('networkidle');

      // 入力フォーム
      await kigakuPage.fill('input[name="sei"]', person.sei);
      await kigakuPage.fill('input[name="mei"]', person.mei);

      // 送信ボタン
      const submitButton = await kigakuPage.$('input[type="submit"][value*="姓名鑑定"]');
      if (submitButton) {
        await submitButton.click();
      } else {
        // 別のボタンを探す
        await kigakuPage.click('button:has-text("姓名鑑定")');
      }

      // 結果ページを待つ
      await kigakuPage.waitForTimeout(3000);

      // 結果を取得
      const pageText = await kigakuPage.textContent('body');

      // 画数を抽出
      const extractNumber = (text, label) => {
        // パターン1: "天格：13画" のような形式
        let pattern = new RegExp(`${label}[：:＝=\\s]*(\\d+)[画]?`);
        let match = text.match(pattern);
        if (match) return parseInt(match[1]);

        // パターン2: "天格 13" のような形式
        pattern = new RegExp(`${label}\\s+(\\d+)`);
        match = text.match(pattern);
        if (match) return parseInt(match[1]);

        return null;
      };

      result.kigakuNavi.tenkaku = extractNumber(pageText, '天格');
      result.kigakuNavi.jinkaku = extractNumber(pageText, '人格');
      result.kigakuNavi.chikaku = extractNumber(pageText, '地格');
      result.kigakuNavi.gaikaku = extractNumber(pageText, '外格');
      result.kigakuNavi.soukaku = extractNumber(pageText, '総格');

      console.log('気学ナビ結果:', result.kigakuNavi);

      // スクリーンショット保存
      await kigakuPage.screenshot({
        path: `tests/screenshots/${person.sei}${person.mei}_kigaku.png`,
        fullPage: true
      });

    } catch (error) {
      console.error('気学ナビエラー:', error);
    }

    await kigakuPage.close();

    // 3. 差分分析
    console.log('\n=== 差分分析 ===');
    const kakuTypes = ['tenkaku', 'jinkaku', 'chikaku', 'gaikaku', 'soukaku'];

    for (const kaku of kakuTypes) {
      const localValue = result.localhost[kaku];
      const kigakuValue = result.kigakuNavi[kaku];

      if (localValue && kigakuValue) {
        if (localValue === kigakuValue) {
          console.log(`✅ ${kaku}: 一致 (${localValue})`);
        } else {
          const diff = parseInt(localValue) - parseInt(kigakuValue);
          result.differences.push({
            type: kaku,
            localhost: localValue,
            kigakuNavi: kigakuValue,
            difference: diff
          });
          console.log(`❌ ${kaku}: localhost=${localValue}, 気学ナビ=${kigakuValue}, 差=${diff}`);
        }
      } else {
        console.log(`⚠️ ${kaku}: データ不足 (localhost=${localValue || '取得失敗'}, 気学ナビ=${kigakuValue || '取得失敗'})`);
      }
    }

    results.push(result);
  }

  // 最終レポート
  console.log('\n\n========== 最終比較レポート ==========');

  for (const result of results) {
    console.log(`\n【${result.name}】`);

    if (result.differences.length > 0) {
      console.log('  差分あり:');
      result.differences.forEach(diff => {
        console.log(`    ${diff.type}: localhost=${diff.localhost}, 気学ナビ=${diff.kigakuNavi} (差=${diff.difference})`);
      });
    } else {
      const hasLocalData = Object.keys(result.localhost).length > 0;
      const hasKigakuData = Object.keys(result.kigakuNavi).length > 0;

      if (hasLocalData && hasKigakuData) {
        console.log('  ✅ 完全一致');
      } else {
        console.log('  ⚠️ データ取得失敗');
      }
    }
  }

  await browser.close();
}

// 実行
testSeimeiComparison().catch(console.error);