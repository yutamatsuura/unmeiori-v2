import { test } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

// テストデータ（5人分）
const testData = [
  { sei: '田中', mei: '太郎', seiYomi: 'たなか', meiYomi: 'たろう' },
  { sei: '佐藤', mei: '花子', seiYomi: 'さとう', meiYomi: 'はなこ' },
  { sei: '山田', mei: '一', seiYomi: 'やまだ', meiYomi: 'はじめ' },
  { sei: '鈴木', mei: '健太', seiYomi: 'すずき', meiYomi: 'けんた' },
  { sei: '高橋', mei: '美咲', seiYomi: 'たかはし', meiYomi: 'みさき' }
];

// 結果格納用
const comparisonResults = [];

test.describe('姓名判断比較検証テスト', () => {

  for (let i = 0; i < testData.length; i++) {
    const person = testData[i];

    test(`比較検証 ${i + 1}: ${person.sei}${person.mei}`, async ({ page }) => {
      const result = {
        name: `${person.sei}${person.mei}`,
        timestamp: new Date().toISOString(),
        kigakuNavi: {},
        localhost: {},
        differences: []
      };

      console.log(`\n====== ${person.sei}${person.mei} の比較開始 ======`);

      // 1. 気学ナビの結果取得
      console.log('気学ナビにアクセス中...');
      await page.goto('https://kigaku-navi.com/qsei/seimei.php');
      await page.waitForLoadState('networkidle');

      // 姓名入力
      await page.fill('input[name="sei"]', person.sei);
      await page.fill('input[name="mei"]', person.mei);

      // 姓名鑑定を実行
      await page.click('button:has-text("姓名鑑定を行う"), input[type="submit"][value*="姓名鑑定"]');
      await page.waitForTimeout(3000);

      // 結果取得
      try {
        // 天格、人格、地格、外格、総格を取得
        const kigakuSelectors = {
          tenkaku: ['#tenkaku', '.tenkaku', 'td:has-text("天格") + td', '*:has-text("天格")'],
          jinkaku: ['#jinkaku', '.jinkaku', 'td:has-text("人格") + td', '*:has-text("人格")'],
          chikaku: ['#chikaku', '.chikaku', 'td:has-text("地格") + td', '*:has-text("地格")'],
          gaikaku: ['#gaikaku', '.gaikaku', 'td:has-text("外格") + td', '*:has-text("外格")'],
          soukaku: ['#soukaku', '.soukaku', 'td:has-text("総格") + td', '*:has-text("総格")']
        };

        for (const [key, selectors] of Object.entries(kigakuSelectors)) {
          for (const selector of selectors) {
            try {
              const element = await page.$(selector);
              if (element) {
                const text = await element.textContent();
                const match = text.match(/(\d+)/);
                if (match) {
                  result.kigakuNavi[key] = parseInt(match[1]);
                  console.log(`気学ナビ ${key}: ${match[1]}`);
                  break;
                }
              }
            } catch (e) {
              // Continue to next selector
            }
          }
        }

        // ページ全体のテキストから画数を抽出（フォールバック）
        if (Object.keys(result.kigakuNavi).length === 0) {
          const pageContent = await page.content();
          const textContent = await page.textContent('body');

          const patterns = {
            tenkaku: /天格[：:]*\s*(\d+)/,
            jinkaku: /人格[：:]*\s*(\d+)/,
            chikaku: /地格[：:]*\s*(\d+)/,
            gaikaku: /外格[：:]*\s*(\d+)/,
            soukaku: /総格[：:]*\s*(\d+)/
          };

          for (const [key, pattern] of Object.entries(patterns)) {
            const match = textContent.match(pattern);
            if (match) {
              result.kigakuNavi[key] = parseInt(match[1]);
              console.log(`気学ナビ ${key}: ${match[1]} (テキスト抽出)`);
            }
          }
        }

      } catch (error) {
        console.error('気学ナビ結果取得エラー:', error.message);
      }

      // 2. localhost:3001の結果取得
      console.log('\nlocalhost:3001にアクセス中...');
      await page.goto('http://localhost:3001/create');
      await page.waitForLoadState('networkidle');

      // 姓名入力
      await page.fill('input[placeholder*="姓"]', person.sei);
      await page.fill('input[placeholder*="名"]', person.mei);

      // よみがな入力（あれば）
      try {
        await page.fill('input[placeholder*="せい"][type="text"]', person.seiYomi);
        await page.fill('input[placeholder*="めい"][type="text"]', person.meiYomi);
      } catch (e) {
        console.log('よみがな入力フィールドが見つかりません');
      }

      // 少し待機して自動計算を待つ
      await page.waitForTimeout(2000);

      // 結果取得
      try {
        const localhostSelectors = {
          tenkaku: ['[data-testid*="tenkaku"]', '.tenkaku-value', '*:has-text("天格") + *'],
          jinkaku: ['[data-testid*="jinkaku"]', '.jinkaku-value', '*:has-text("人格") + *'],
          chikaku: ['[data-testid*="chikaku"]', '.chikaku-value', '*:has-text("地格") + *'],
          gaikaku: ['[data-testid*="gaikaku"]', '.gaikaku-value', '*:has-text("外格") + *'],
          soukaku: ['[data-testid*="soukaku"]', '.soukaku-value', '*:has-text("総格") + *']
        };

        for (const [key, selectors] of Object.entries(localhostSelectors)) {
          for (const selector of selectors) {
            try {
              const element = await page.$(selector);
              if (element) {
                const text = await element.textContent();
                const match = text.match(/(\d+)/);
                if (match) {
                  result.localhost[key] = parseInt(match[1]);
                  console.log(`localhost ${key}: ${match[1]}`);
                  break;
                }
              }
            } catch (e) {
              // Continue to next selector
            }
          }
        }

        // ページ全体から抽出（フォールバック）
        if (Object.keys(result.localhost).length === 0) {
          const textContent = await page.textContent('body');

          const patterns = {
            tenkaku: /天格[：:]*\s*(\d+)/,
            jinkaku: /人格[：:]*\s*(\d+)/,
            chikaku: /地格[：:]*\s*(\d+)/,
            gaikaku: /外格[：:]*\s*(\d+)/,
            soukaku: /総格[：:]*\s*(\d+)/
          };

          for (const [key, pattern] of Object.entries(patterns)) {
            const match = textContent.match(pattern);
            if (match) {
              result.localhost[key] = parseInt(match[1]);
              console.log(`localhost ${key}: ${match[1]} (テキスト抽出)`);
            }
          }
        }

      } catch (error) {
        console.error('localhost結果取得エラー:', error.message);
      }

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
        } else {
          console.log(`⚠️ ${kaku}: データ不足 (気学ナビ=${kigakuValue}, localhost=${localhostValue})`);
        }
      }

      // 結果を保存
      comparisonResults.push(result);

      // スクリーンショット保存
      await page.screenshot({
        path: `tests/screenshots/comparison_${person.sei}${person.mei}_localhost.png`,
        fullPage: true
      });
    });
  }

  test.afterAll(async () => {
    // 全結果をJSONファイルに保存
    const reportPath = path.join(process.cwd(), 'tests', 'comparison-report.json');
    await fs.writeFile(reportPath, JSON.stringify(comparisonResults, null, 2));

    console.log('\n========== 比較検証サマリー ==========');
    console.log(`結果ファイル: ${reportPath}`);

    // サマリー表示
    let totalDifferences = 0;
    for (const result of comparisonResults) {
      if (result.differences.length > 0) {
        console.log(`\n${result.name}: ${result.differences.length}個の差分`);
        result.differences.forEach(diff => {
          console.log(`  - ${diff.type}: 気学ナビ=${diff.kigakuNavi}, localhost=${diff.localhost} (差=${diff.difference})`);
        });
        totalDifferences += result.differences.length;
      } else {
        console.log(`\n${result.name}: 完全一致 ✅`);
      }
    }

    console.log(`\n総差分数: ${totalDifferences}個`);
  });
});