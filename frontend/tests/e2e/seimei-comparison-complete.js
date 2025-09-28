import { chromium } from 'playwright';
import fs from 'fs/promises';

async function compareSeimeiComplete() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const results = [];

  // テストする5人（生年月日、性別も追加）
  const testPeople = [
    { sei: '田中', mei: '太郎', birthDate: '1990-01-01', gender: '男性', email: 'tanaka@test.com' },
    { sei: '佐藤', mei: '花子', birthDate: '1992-03-15', gender: '女性', email: 'sato@test.com' },
    { sei: '山田', mei: '一', birthDate: '1985-07-20', gender: '男性', email: 'yamada@test.com' },
    { sei: '鈴木', mei: '健太', birthDate: '1995-11-08', gender: '男性', email: 'suzuki@test.com' },
    { sei: '高橋', mei: '美咲', birthDate: '1988-05-25', gender: '女性', email: 'takahashi@test.com' }
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
    console.log('ログイン成功');
  } catch (error) {
    console.log('ログイン処理スキップ（既にログイン済みの可能性）');
  }
  await loginPage.close();

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

      // 結果ページから画数を取得（先ほどの画像から確認した表構造）
      const bodyText = await kigakuPage.textContent('body');

      // 文字の構成テーブルから値を取得
      const extractKigakuValue = (text, kakuName) => {
        // 各格のパターン（表の中の数字を探す）
        if (kakuName === '天格') {
          // 天格の行を探して、その数値を取得
          const match = text.match(/天格[^0-9]*(\d+)/);
          return match ? parseInt(match[1]) : null;
        } else if (kakuName === '人格') {
          const match = text.match(/人格[^0-9]*(\d+)/);
          return match ? parseInt(match[1]) : null;
        } else if (kakuName === '地格') {
          const match = text.match(/地格[^0-9]*(\d+)/);
          return match ? parseInt(match[1]) : null;
        } else if (kakuName === '外格') {
          const match = text.match(/外格[^0-9]*(\d+)/);
          return match ? parseInt(match[1]) : null;
        } else if (kakuName === '総格') {
          const match = text.match(/総格[^0-9]*(\d+)/);
          return match ? parseInt(match[1]) : null;
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
          console.log(`  気学ナビ ${key}: ${value}画`);
        }
      }

      // スクリーンショット保存
      await kigakuPage.screenshot({
        path: `tests/screenshots/${person.sei}${person.mei}_kigaku_complete.png`,
        fullPage: true
      });

    } catch (error) {
      console.error('気学ナビエラー:', error.message);
    }

    await kigakuPage.close();

    // 2. localhost:3001で鑑定（全項目入力）
    console.log('2. localhost:3001で鑑定中...');
    const localPage = await context.newPage();

    try {
      await localPage.goto('http://localhost:3001/create');
      await localPage.waitForLoadState('networkidle');

      // 姓名を入力（TextFieldのnameまたはid属性を使用）
      const nameInput = await localPage.$('input[name="name"], input[placeholder*="氏名"], input[placeholder*="名前"]');
      if (nameInput) {
        await nameInput.fill(`${person.sei}${person.mei}`);
      } else {
        // 分割されている場合
        const seiInput = await localPage.$('input[placeholder*="姓"]');
        const meiInput = await localPage.$('input[placeholder*="名"]');
        if (seiInput && meiInput) {
          await seiInput.fill(person.sei);
          await meiInput.fill(person.mei);
        }
      }

      // 生年月日を入力
      const birthDateInput = await localPage.$('input[type="date"], input[name="birthDate"], input[placeholder*="生年月日"]');
      if (birthDateInput) {
        await birthDateInput.fill(person.birthDate);
      }

      // 性別を選択（Select or RadioButton）
      const genderSelect = await localPage.$('select[name="gender"]');
      if (genderSelect) {
        await genderSelect.selectOption(person.gender);
      } else {
        // ラジオボタンの場合
        const genderRadio = await localPage.$(`input[type="radio"][value="${person.gender}"]`);
        if (genderRadio) {
          await genderRadio.click();
        } else {
          // Material-UIのSelectの場合
          const genderDropdown = await localPage.$('[role="button"]:has-text("性別"), [role="button"]:has-text("選択")');
          if (genderDropdown) {
            await genderDropdown.click();
            await localPage.waitForTimeout(500);
            await localPage.click(`[role="option"]:has-text("${person.gender}")`);
          }
        }
      }

      // メールアドレスを入力
      const emailInput = await localPage.$('input[type="email"], input[name="email"], input[placeholder*="メール"]');
      if (emailInput) {
        await emailInput.fill(person.email);
      }

      // 計算/鑑定ボタンをクリック
      await localPage.waitForTimeout(1000);
      const calcButton = await localPage.$('button:has-text("計算"), button:has-text("鑑定"), button:has-text("実行")');
      if (calcButton) {
        await calcButton.click();
        console.log('  計算ボタンをクリック');
        await localPage.waitForTimeout(3000);
      }

      // 結果を取得（結果が表示されるまで少し待つ）
      await localPage.waitForTimeout(2000);
      const bodyText = await localPage.textContent('body');

      // 画数パターンを抽出
      const extractLocalValue = (text, kakuName) => {
        // 各種パターンを試す
        const patterns = [
          new RegExp(`${kakuName}[：:＝=\\s]*([0-9０-９]+)[画]?`),
          new RegExp(`${kakuName}.*?([0-9０-９]+)`),
          new RegExp(`${kakuName}[^0-9０-９]*([0-9０-９]+)`)
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
      for (const [key, value] of Object.entries(result.localhost)) {
        if (value !== null) {
          console.log(`  localhost ${key}: ${value}画`);
        }
      }

      // スクリーンショット保存
      await localPage.screenshot({
        path: `tests/screenshots/${person.sei}${person.mei}_local_complete.png`,
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
      console.log(`  差分: ${personDiff}個`);
      result.differences.forEach(diff => {
        console.log(`    ${diff.type}: 気学=${diff.kigakuNavi}画, local=${diff.localhost}画 (差=${diff.difference > 0 ? '+' : ''}${diff.difference})`);
      });
    } else if (personMatch === 5) {
      console.log(`  ✅ 完全一致 (5/5項目)`);
    } else {
      console.log(`  ⚠️ データ取得: 成功${personMatch}/5項目`);
      if (personFailed > 0) {
        console.log(`    気学ナビ: ${Object.values(result.kigakuNavi).filter(v => v !== null).length}項目取得`);
        console.log(`    localhost: ${Object.values(result.localhost).filter(v => v !== null).length}項目取得`);
      }
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
    'tests/comparison-report-complete.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n📄 詳細レポート保存: tests/comparison-report-complete.json');

  await browser.close();
}

// 実行
compareSeimeiComplete().catch(console.error);