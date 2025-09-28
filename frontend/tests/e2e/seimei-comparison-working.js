import { chromium } from 'playwright';
import fs from 'fs/promises';

async function compareSeimeiWorking() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500  // さらにゆっくり動作
  });

  const context = await browser.newContext();
  const results = [];

  // テストする5人
  const testPeople = [
    { sei: '田中', mei: '太郎', fullName: '田中太郎', birthDate: '1990-01-01', gender: '男性', email: 'tanaka@test.com' },
    { sei: '佐藤', mei: '花子', fullName: '佐藤花子', birthDate: '1992-03-15', gender: '女性', email: 'sato@test.com' },
    { sei: '山田', mei: '一', fullName: '山田一', birthDate: '1985-07-20', gender: '男性', email: 'yamada@test.com' },
    { sei: '鈴木', mei: '健太', fullName: '鈴木健太', birthDate: '1995-11-08', gender: '男性', email: 'suzuki@test.com' },
    { sei: '高橋', mei: '美咲', fullName: '高橋美咲', birthDate: '1988-05-25', gender: '女性', email: 'takahashi@test.com' }
  ];

  // 一度だけログイン
  console.log('初回ログイン処理...');
  const loginPage = await context.newPage();
  await loginPage.goto('http://localhost:3001/login');
  await loginPage.waitForLoadState('networkidle');

  try {
    await loginPage.fill('input[type="email"]', 'test@example.com');
    await loginPage.fill('input[type="password"]', 'testpass123');
    await loginPage.click('button[type="submit"]');
    await loginPage.waitForURL('**/create', { timeout: 10000 });
    console.log('ログイン成功\n');
  } catch (error) {
    console.log('ログイン処理スキップ（既にログイン済みの可能性）\n');
  }
  await loginPage.close();

  for (const person of testPeople) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`  ${person.fullName} の比較テスト`);
    console.log(`${'='.repeat(50)}\n`);

    const result = {
      name: person.fullName,
      kigakuNavi: {},
      localhost: {},
      differences: []
    };

    // 1. 気学ナビで鑑定
    console.log('【気学ナビで鑑定】');
    const kigakuPage = await context.newPage();

    try {
      await kigakuPage.goto('https://kigaku-navi.com/qsei/seimei.php');
      await kigakuPage.waitForLoadState('networkidle');

      // 入力フィールドを取得（姓・名を別々に）
      const textInputs = await kigakuPage.$$('input[type="text"]');
      if (textInputs.length >= 2) {
        await textInputs[0].fill(person.sei);
        await textInputs[1].fill(person.mei);
      }

      // 姓名鑑定ボタンをクリック
      await kigakuPage.click('a:has-text("姓名鑑定を行う")');
      await kigakuPage.waitForTimeout(3000);

      // 結果ページから画数を取得
      const bodyText = await kigakuPage.textContent('body');

      // 画数を抽出
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

      // 取得した値を表示
      for (const [key, value] of Object.entries(result.kigakuNavi)) {
        if (value !== null) {
          console.log(`  ${key}: ${value}画`);
        }
      }

    } catch (error) {
      console.error('気学ナビエラー:', error.message);
    }

    await kigakuPage.close();

    // 2. localhost:3001で鑑定（修正版）
    console.log('\n【localhost:3001で鑑定】');
    const localPage = await context.newPage();

    try {
      await localPage.goto('http://localhost:3001/create');
      await localPage.waitForLoadState('networkidle');

      // 氏名を入力
      const nameInput = await localPage.$('input[type="text"]');
      if (nameInput) {
        await nameInput.fill(person.fullName);
        console.log(`  氏名: ${person.fullName}`);
      }

      // 生年月日を入力
      const dateInput = await localPage.$('input[type="date"]');
      if (dateInput) {
        await dateInput.fill(person.birthDate);
        console.log(`  生年月日: ${person.birthDate}`);
      }

      // 性別を選択 - seimei-e2e.spec.jsから学んだ正しい方法
      const genderSelect = await localPage.$('[role="combobox"]');
      if (genderSelect) {
        await genderSelect.click();
        console.log('  性別ドロップダウンを開く');
        await localPage.waitForTimeout(500);

        // liタグから性別を選択
        const genderOption = await localPage.$(`li:has-text("${person.gender}")`);
        if (genderOption) {
          await genderOption.click();
          console.log(`  性別: ${person.gender}`);
        } else {
          // 別の方法: role="option"を試す
          await localPage.click(`[role="option"]:has-text("${person.gender}")`);
          console.log(`  性別（代替）: ${person.gender}`);
        }
      } else {
        console.log('  ⚠️ 性別選択フィールドが見つかりません');
      }

      // メールアドレスを入力
      const emailInput = await localPage.$('input[type="email"]');
      if (emailInput) {
        await emailInput.fill(person.email);
        console.log(`  メール: ${person.email}`);
      }

      // 鑑定計算実行ボタンをクリック
      await localPage.waitForTimeout(1000);
      const calcButton = await localPage.$('button:has-text("鑑定計算実行")');
      if (calcButton) {
        console.log('  → 鑑定計算実行ボタンをクリック');
        await calcButton.click();

        // 結果が表示されるまで待つ（ページ遷移の可能性も考慮）
        await localPage.waitForTimeout(5000);

        // URLが変更されたか確認
        const currentUrl = localPage.url();
        console.log(`  現在のURL: ${currentUrl}`);
      }

      // 結果を取得（ページ遷移後も対応）
      const bodyText = await localPage.textContent('body');

      // 画数パターンを抽出
      const extractLocalValue = (text, kakuName) => {
        const patterns = [
          new RegExp(`${kakuName}[：:＝=\\s]*([0-9０-９]+)[画]?`),
          new RegExp(`${kakuName}.*?([0-9０-９]+)`),
        ];

        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match) {
            // 全角数字を半角に変換
            const num = match[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            return parseInt(num);
          }
        }
        return null;
      };

      result.localhost['天格'] = extractLocalValue(bodyText, '天格');
      result.localhost['人格'] = extractLocalValue(bodyText, '人格');
      result.localhost['地格'] = extractLocalValue(bodyText, '地格');
      result.localhost['外格'] = extractLocalValue(bodyText, '外格');
      result.localhost['総格'] = extractLocalValue(bodyText, '総格');

      // 取得した値を表示
      let foundAny = false;
      for (const [key, value] of Object.entries(result.localhost)) {
        if (value !== null) {
          console.log(`  ${key}: ${value}画`);
          foundAny = true;
        }
      }

      if (!foundAny) {
        console.log('  ⚠️ 画数データが見つかりませんでした');
        // エラーメッセージがあるか確認
        const errorMsg = await localPage.$('text="入力内容に誤りがあります"');
        if (errorMsg) {
          console.log('  ⚠️ エラー: 入力内容に誤りがあります');
        }
      }

      // スクリーンショット保存
      await localPage.screenshot({
        path: `tests/screenshots/${person.fullName}_local_working.png`,
        fullPage: true
      });

    } catch (error) {
      console.error('localhostエラー:', error.message);
    }

    await localPage.close();

    // 3. 差分分析
    console.log('\n【差分分析】');
    const kakuTypes = ['天格', '人格', '地格', '外格', '総格'];

    for (const kaku of kakuTypes) {
      const kigaku = result.kigakuNavi[kaku];
      const local = result.localhost[kaku];

      if (kigaku !== null && kigaku !== undefined && local !== null && local !== undefined) {
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
          console.log(`  ❌ ${kaku}: 気学=${kigaku}画, localhost=${local}画 (差=${diff > 0 ? '+' : ''}${diff})`);
        }
      } else {
        const kigakuStr = kigaku !== null ? `${kigaku}画` : '取得失敗';
        const localStr = local !== null ? `${local}画` : '取得失敗';
        console.log(`  ⚠️ ${kaku}: 気学=${kigakuStr}, localhost=${localStr}`);
      }
    }

    results.push(result);
  }

  // 最終レポート
  console.log('\n\n' + '='.repeat(60));
  console.log('         姓名判断 比較検証 最終レポート');
  console.log('='.repeat(60) + '\n');

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

      if (kigaku !== null && kigaku !== undefined && local !== null && local !== undefined) {
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
      console.log(`  ❌ 差分あり: ${personDiff}個`);
      result.differences.forEach(diff => {
        console.log(`    ${diff.type}: 気学=${diff.kigakuNavi}画, localhost=${diff.localhost}画 (差=${diff.difference > 0 ? '+' : ''}${diff.difference})`);
      });
    } else if (personMatch === 5) {
      console.log(`  ✅ 完全一致 (5/5項目)`);
    } else if (personMatch > 0) {
      console.log(`  △ 部分一致: ${personMatch}/5項目`);
    } else {
      console.log(`  ⚠️ データ取得失敗`);
    }

    totalMatch += personMatch;
    totalDiff += personDiff;
    totalFailed += personFailed;
  }

  console.log('\n【総計】');
  console.log(`  検証項目数: ${testPeople.length * 5}個`);
  console.log(`  ✅ 一致: ${totalMatch}個 (${(totalMatch / (testPeople.length * 5) * 100).toFixed(1)}%)`);
  console.log(`  ❌ 差分: ${totalDiff}個 (${(totalDiff / (testPeople.length * 5) * 100).toFixed(1)}%)`);
  console.log(`  ⚠️ 取得失敗: ${totalFailed}個 (${(totalFailed / (testPeople.length * 5) * 100).toFixed(1)}%)`);

  // JSONレポート保存
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testPeople.length * 5,
      match: totalMatch,
      diff: totalDiff,
      failed: totalFailed,
      matchRate: (totalMatch / (testPeople.length * 5) * 100).toFixed(1) + '%',
      diffRate: (totalDiff / (testPeople.length * 5) * 100).toFixed(1) + '%'
    },
    details: results
  };

  await fs.writeFile(
    'tests/comparison-report-final.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n📄 詳細レポート保存完了: tests/comparison-report-final.json');

  await browser.close();
}

// 実行
compareSeimeiWorking().catch(console.error);