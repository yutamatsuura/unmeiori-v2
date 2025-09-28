const axios = require('axios');

console.log('姓名判断システム統合テスト開始');

async function testSeimeiAPI() {
  try {
    console.log('🔬 API動作確認開始');

    // Health check
    console.log('1. ヘルスチェック...');
    const healthRes = await axios.get('http://localhost:5003/health');
    console.log(`✅ ヘルスチェック成功: ${healthRes.data.status}`);

    // Test cases
    const testCases = [
      { name: '田中太郎', sei: '田中', mei: '太郎' },
      { name: '佐藤花子', sei: '佐藤', mei: '花子' },
      { name: '山田一', sei: '山田', mei: '一' },
      { name: '渡辺美智子', sei: '渡辺', mei: '美智子' },
      { name: '鈴木健', sei: '鈴木', mei: '健' }
    ];

    console.log('2. 有名人テストケース実行...');

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const startTime = Date.now();

      try {
        const response = await axios.post('http://localhost:5003/seimei/analyze', {
          sei: testCase.sei,
          mei: testCase.mei
        }, { timeout: 5000 });

        const processingTime = Date.now() - startTime;

        if (response.data.success && response.data.data) {
          const data = response.data.data;
          console.log(`✅ ${testCase.name}: 成功 (${processingTime}ms) スコア:${data.overallScore} グレード:${data.grade}`);

          // 3秒以内チェック
          if (processingTime > 3000) {
            console.warn(`⚠️  ${testCase.name}: レスポンス時間が3秒を超過 (${processingTime}ms)`);
          }
        } else {
          console.error(`❌ ${testCase.name}: レスポンス構造が不正`);
        }

      } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ ${testCase.name}: エラー (${processingTime}ms) - ${error.message}`);
      }
    }

    // Edge cases
    console.log('3. エッジケーステスト実行...');
    const edgeCases = [
      { name: '一一', sei: '一', mei: '一' },
      { name: '小林正', sei: '小林', mei: '正' }
    ];

    for (const edgeCase of edgeCases) {
      const startTime = Date.now();

      try {
        const response = await axios.post('http://localhost:5003/seimei/analyze', {
          sei: edgeCase.sei,
          mei: edgeCase.mei
        }, { timeout: 5000 });

        const processingTime = Date.now() - startTime;

        if (response.data.success) {
          console.log(`✅ ${edgeCase.name}: 成功 (${processingTime}ms)`);
        } else {
          console.log(`⚠️  ${edgeCase.name}: 期待される失敗`);
        }

      } catch (error) {
        console.log(`⚠️  ${edgeCase.name}: エラー処理確認 - ${error.message}`);
      }
    }

    // Performance test
    console.log('4. パフォーマンステスト（同時リクエスト）...');
    const concurrentRequests = 5;
    const testCase = testCases[0];

    const startTime = Date.now();
    const promises = Array(concurrentRequests).fill(null).map(() =>
      axios.post('http://localhost:5003/seimei/analyze', {
        sei: testCase.sei,
        mei: testCase.mei
      }, { timeout: 5000 })
    );

    try {
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const successCount = results.filter(r => r.data.success).length;

      console.log(`✅ 同時リクエスト ${concurrentRequests}件: ${successCount}/${concurrentRequests} 成功`);
      console.log(`   総実行時間: ${totalTime}ms`);

    } catch (error) {
      console.error(`❌ パフォーマンステスト失敗: ${error.message}`);
    }

    console.log('\n🎯 統合テスト完了');

  } catch (error) {
    console.error('統合テスト実行中にエラーが発生:', error.message);
    process.exit(1);
  }
}

testSeimeiAPI();