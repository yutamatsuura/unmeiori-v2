import { test, expect } from '@playwright/test';

// 実名データ10パターン
const testCases = [
  { name: '田中太郎', birthdate: '1990-05-15', email: 'tanaka@test.com' },
  { name: '佐藤花子', birthdate: '1985-08-20', email: 'sato@test.com' },
  { name: '山田一郎', birthdate: '1975-03-10', email: 'yamada@test.com' },
  { name: '鈴木美咲', birthdate: '1995-12-25', email: 'suzuki@test.com' },
  { name: '高橋健太', birthdate: '1988-07-07', email: 'takahashi@test.com' },
  { name: '伊藤恵子', birthdate: '1992-01-30', email: 'ito@test.com' },
  { name: '渡辺翔太', birthdate: '1980-11-11', email: 'watanabe@test.com' },
  { name: '中村由美', birthdate: '1993-04-15', email: 'nakamura@test.com' },
  { name: '小林大輔', birthdate: '1986-09-22', email: 'kobayashi@test.com' },
  { name: '加藤真奈', birthdate: '1991-06-18', email: 'kato@test.com' }
];

test.describe('Real Data Integration Tests', () => {
  let testResults: Array<{
    name: string;
    birthdate: string;
    success: boolean;
    kyuseiResult?: any;
    seimeiResult?: any;
    error?: string;
    duration: number;
  }> = [];

  test.beforeAll(async () => {
    console.log('🚀 Starting Real Data Integration Tests');
    console.log(`📋 Testing ${testCases.length} real-name patterns`);
  });

  test.afterAll(async () => {
    console.log('\n📊 Test Results Summary:');
    console.log('=' * 50);

    const successCount = testResults.filter(r => r.success).length;
    const failureCount = testResults.filter(r => !r.success).length;

    console.log(`✅ Successful tests: ${successCount}/${testCases.length}`);
    console.log(`❌ Failed tests: ${failureCount}/${testCases.length}`);
    console.log(`⏱️ Average duration: ${(testResults.reduce((acc, r) => acc + r.duration, 0) / testResults.length).toFixed(2)}ms`);

    console.log('\n📝 Detailed Results:');
    testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${result.name} (${result.birthdate}) - ${result.duration}ms`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.kyuseiResult) {
        console.log(`   九星気学: ${JSON.stringify(result.kyuseiResult).substring(0, 100)}...`);
      }
      if (result.seimeiResult) {
        console.log(`   姓名判断: ${JSON.stringify(result.seimeiResult).substring(0, 100)}...`);
      }
    });
  });

  // データ駆動テスト - 各パターンを個別にテスト
  for (const testCase of testCases) {
    test(`should complete full integration for ${testCase.name} (${testCase.birthdate})`, async ({ page }) => {
      const startTime = Date.now();
      let currentResult = {
        name: testCase.name,
        birthdate: testCase.birthdate,
        success: false,
        duration: 0
      };

      try {
        console.log(`\n🧪 Testing: ${testCase.name} (${testCase.birthdate})`);

        // ステップ1: ログイン
        await page.goto('/');
        await expect(page).toHaveURL(/.*\/login/);

        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'testpass123');
        await page.click('[data-testid="login-button"]');

        // ログイン成功を確認
        await expect(page).toHaveURL(/.*\/create/, { timeout: 10000 });
        console.log('✅ Login successful');

        // ステップ2: クライアント情報入力
        const nameInput = page.locator('input[value=""]').first();
        await nameInput.fill(testCase.name);

        // 生年月日入力 (type="date" フィールド、YYYY-MM-DD形式)
        const birthdateInput = page.locator('input[type="date"]');
        await birthdateInput.fill(testCase.birthdate);

        // 性別選択
        const genderSelect = page.locator('[data-testid="gender-select"]').or(page.locator('input[name="gender"]')).or(page.locator('select')).first();
        try {
          await genderSelect.click();
          await page.locator('li[data-value="male"]').or(page.locator('option[value="male"]')).click();
        } catch (error) {
          console.log('性別選択をスキップ (フィールドが見つからない)');
        }

        const emailInput = page.locator('input[type="email"]');
        await emailInput.fill(testCase.email);

        console.log(`✅ Client info filled: ${testCase.name}, ${testCase.birthdate}, ${testCase.email}`);

        // ステップ3: 鑑定計算実行
        const calculateButton = page.locator('button:has-text("鑑定計算実行")');
        await calculateButton.click();
        console.log('✅ Calculation triggered');

        // ステップ4: 九星気学結果の確認
        await page.waitForTimeout(3000); // API応答を待機

        const kyuseiSelectors = [
          'div:has-text("本命星")',
          'div:has-text("九星")',
          '[data-testid="kyusei-result"]',
          '.kyusei-result'
        ];

        let kyuseiResultFound = false;
        let kyuseiResult = null;

        for (const selector of kyuseiSelectors) {
          try {
            const element = page.locator(selector);
            if (await element.isVisible({ timeout: 2000 })) {
              kyuseiResult = await element.textContent();
              kyuseiResultFound = true;
              console.log(`✅ 九星気学結果確認: ${kyuseiResult}`);
              break;
            }
          } catch (error) {
            continue;
          }
        }

        // ステップ5: 姓名判断結果の確認
        const seimeiSelectors = [
          'div:has-text("総格")',
          'div:has-text("姓名")',
          '[data-testid="seimei-result"]',
          '.seimei-result'
        ];

        let seimeiResultFound = false;
        let seimeiResult = null;

        for (const selector of seimeiSelectors) {
          try {
            const element = page.locator(selector);
            if (await element.isVisible({ timeout: 2000 })) {
              seimeiResult = await element.textContent();
              seimeiResultFound = true;
              console.log(`✅ 姓名判断結果確認: ${seimeiResult}`);
              break;
            }
          } catch (error) {
            continue;
          }
        }

        // ステップ6: API直接確認（バックエンド統合確認）
        try {
          // 九星気学API直接テスト
          const kyuseiApiResponse = await page.evaluate(async (birthdate) => {
            const response = await fetch('http://localhost:5004/api/kyusei/calculate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ birthdate })
            });
            return response.json();
          }, testCase.birthdate);

          console.log(`✅ 九星気学API直接確認: ${JSON.stringify(kyuseiApiResponse).substring(0, 100)}...`);

          // 姓名判断API直接テスト
          const seimeiApiResponse = await page.evaluate(async (name) => {
            const response = await fetch('http://localhost:5004/api/seimei/calculate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name })
            });
            return response.json();
          }, testCase.name);

          console.log(`✅ 姓名判断API直接確認: ${JSON.stringify(seimeiApiResponse).substring(0, 100)}...`);

          currentResult.kyuseiResult = kyuseiApiResponse;
          currentResult.seimeiResult = seimeiApiResponse;

        } catch (apiError) {
          console.log(`⚠️ API直接確認エラー: ${apiError}`);
        }

        // ステップ7: 統合結果の妥当性確認
        const hasKyuseiData = kyuseiResultFound || currentResult.kyuseiResult;
        const hasSeimeiData = seimeiResultFound || currentResult.seimeiResult;

        if (hasKyuseiData && hasSeimeiData) {
          console.log('✅ 統合鑑定結果確認完了');
          currentResult.success = true;
        } else {
          throw new Error(`結果不完全: 九星気学=${hasKyuseiData}, 姓名判断=${hasSeimeiData}`);
        }

        // スクリーンショット保存
        await page.screenshot({
          path: `test-results/integration-${testCase.name.replace(/\s+/g, '_')}-${Date.now()}.png`,
          fullPage: true
        });

        console.log(`🎉 Integration test completed for ${testCase.name}`);

      } catch (error) {
        console.log(`❌ Integration test failed for ${testCase.name}: ${error}`);
        currentResult.error = error.toString();

        // エラー時もスクリーンショット保存
        try {
          await page.screenshot({
            path: `test-results/error-${testCase.name.replace(/\s+/g, '_')}-${Date.now()}.png`,
            fullPage: true
          });
        } catch (screenshotError) {
          console.log(`スクリーンショット保存失敗: ${screenshotError}`);
        }

        throw error;
      } finally {
        currentResult.duration = Date.now() - startTime;
        testResults.push(currentResult);
      }
    });
  }

  // 総合統計テスト
  test('should validate overall integration statistics', async ({ page }) => {
    console.log('\n📈 Running integration statistics validation');

    // 統計情報の確認
    const successRate = (testResults.filter(r => r.success).length / testCases.length) * 100;
    console.log(`📊 Success Rate: ${successRate.toFixed(2)}%`);

    // 成功率が80%以上であることを確認
    expect(successRate).toBeGreaterThanOrEqual(80);

    // 平均応答時間が適切であることを確認（30秒以下）
    const avgDuration = testResults.reduce((acc, r) => acc + r.duration, 0) / testResults.length;
    console.log(`⏱️ Average Duration: ${avgDuration.toFixed(2)}ms`);
    expect(avgDuration).toBeLessThan(30000);

    // 各計算結果の妥当性確認
    const validKyuseiResults = testResults.filter(r => r.kyuseiResult && Object.keys(r.kyuseiResult).length > 0);
    const validSeimeiResults = testResults.filter(r => r.seimeiResult && Object.keys(r.seimeiResult).length > 0);

    console.log(`🔮 Valid Kyusei Results: ${validKyuseiResults.length}/${testCases.length}`);
    console.log(`📝 Valid Seimei Results: ${validSeimeiResults.length}/${testCases.length}`);

    // 計算結果の妥当性（70%以上）
    expect(validKyuseiResults.length / testCases.length).toBeGreaterThanOrEqual(0.7);
    expect(validSeimeiResults.length / testCases.length).toBeGreaterThanOrEqual(0.7);

    console.log('✅ Integration statistics validation completed');
  });
});