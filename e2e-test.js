/**
 * E2Eテスト - sindankantei 鑑定システム
 *
 * 実際のAPIサーバーが動作している状態で実行する統合テスト
 */

const axios = require('axios');

// 設定
const BASE_URL = 'http://localhost:5004';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpass123'
};

const TEST_CLIENT = {
  name: '斉藤仁',
  birth_date: '2025-09-04',
  gender: 'male',
  email: 'test@example.com'
};

let authToken = null;

// テスト結果追跡
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    log(`✅ PASS: ${message}`);
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    log(`❌ FAIL: ${message}`);
  }
}

async function testHealthChecks() {
  log('=== ヘルスチェックテスト ===');

  try {
    // FastAPI メインサービス
    const mainHealth = await axios.get(`${BASE_URL}/health`);
    assert(mainHealth.status === 200, 'FastAPIメインサービスが正常');
    assert(mainHealth.data.status === 'healthy', 'FastAPIメインサービスのステータスが healthy');

    // マイクロサービスの確認
    assert(mainHealth.data.microservices.kyusei === 'healthy', '九星気学サービスが正常');
    assert(mainHealth.data.microservices.seimei === 'healthy', '姓名判断サービスが正常');

  } catch (error) {
    assert(false, `ヘルスチェックエラー: ${error.message}`);
  }
}

async function testAuthentication() {
  log('=== 認証テスト ===');

  try {
    // ログイン
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    assert(loginResponse.status === 200, 'ログインが成功');
    assert(loginResponse.data.access_token, 'アクセストークンが取得できた');

    authToken = loginResponse.data.access_token;
    log(`取得したトークン: ${authToken.substring(0, 20)}...`);

    // トークン検証
    const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert(verifyResponse.status === 200, 'トークン検証が成功');
    assert(verifyResponse.data.email === TEST_USER.email, '正しいユーザー情報が取得できた');

  } catch (error) {
    assert(false, `認証エラー: ${error.message}`);
  }
}

async function testKanteiCalculation() {
  log('=== 鑑定計算テスト ===');

  try {
    const kanteiResponse = await axios.post(`${BASE_URL}/api/kantei/calculate`, {
      client_info: TEST_CLIENT
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert(kanteiResponse.status === 200, '鑑定計算APIが成功');

    const data = kanteiResponse.data;
    assert(data.id, '鑑定IDが生成された');
    assert(data.kyusei_result, '九星気学結果が取得された');
    assert(data.seimei_result, '姓名判断結果が取得された');
    assert(data.combined_result, '統合結果が生成された');

    // 九星気学結果の詳細チェック
    const kyusei = data.kyusei_result;
    assert(kyusei.birth && kyusei.birth.year && kyusei.birth.year.name, '本命星が計算された');
    assert(kyusei.birth && kyusei.birth.month && kyusei.birth.month.name, '月命星が計算された');
    log(`本命星: ${kyusei.birth.year.name}, 月命星: ${kyusei.birth.month.name}`);

    // 姓名判断結果の詳細チェック
    const seimei = data.seimei_result;
    assert(typeof seimei.total === 'number' && seimei.total > 0, '総格が計算された');
    assert(typeof seimei.heaven === 'number' && seimei.heaven > 0, '天格が計算された');
    assert(typeof seimei.earth === 'number' && seimei.earth > 0, '地格が計算された');
    assert(typeof seimei.personality === 'number' && seimei.personality > 0, '人格が計算された');
    log(`総格: ${seimei.total}画, 天格: ${seimei.heaven}画, 地格: ${seimei.earth}画, 人格: ${seimei.personality}画`);

    // 統合結果チェック
    const combined = data.combined_result;
    assert(combined.kyusei_available === true, '九星気学データが利用可能');
    assert(combined.seimei_available === true, '姓名判断データが利用可能');
    assert(combined.overall_fortune, '総合運勢が生成された');
    log(`統合結果: ${combined.overall_fortune}`);

    // 後続テスト用にIDを保存
    global.testKanteiId = data.id;

  } catch (error) {
    assert(false, `鑑定計算エラー: ${error.response ? error.response.data : error.message}`);
  }
}

async function testPdfGeneration() {
  log('=== PDF生成テスト ===');

  if (!global.testKanteiId) {
    assert(false, 'PDF生成テストには鑑定IDが必要');
    return;
  }

  try {
    const pdfResponse = await axios.post(`${BASE_URL}/api/kantei/generate-pdf-legacy`, {
      kantei_id: global.testKanteiId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert(pdfResponse.status === 200, 'PDF生成APIが成功');
    assert(pdfResponse.data.success === true, 'PDF生成が成功');
    assert(pdfResponse.data.pdf_path, 'PDFパスが生成された');
    assert(pdfResponse.data.pdf_url, 'PDF URLが生成された');

    log(`生成されたPDFパス: ${pdfResponse.data.pdf_path}`);

    // PDFダウンロードテスト
    const downloadResponse = await axios.get(`${BASE_URL}/api/kantei/pdf/${global.testKanteiId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      responseType: 'arraybuffer'
    });

    assert(downloadResponse.status === 200, 'PDFダウンロードが成功');
    assert(downloadResponse.headers['content-type'] === 'application/pdf', 'PDFファイルが返された');
    assert(downloadResponse.data.byteLength > 1000, 'PDFファイルサイズが妥当');

    log(`ダウンロードしたPDFサイズ: ${downloadResponse.data.byteLength} bytes`);

  } catch (error) {
    assert(false, `PDF生成エラー: ${error.response ? error.response.data : error.message}`);
  }
}

async function testDirectMicroservices() {
  log('=== マイクロサービス直接テスト ===');

  try {
    // 九星気学サービス直接テスト
    const kyuseiResponse = await axios.post('http://localhost:5002/kyusei/calculate', {
      birthDate: TEST_CLIENT.birth_date
    });

    assert(kyuseiResponse.status === 200, '九星気学サービス直接呼び出しが成功');
    assert(kyuseiResponse.data.birth, '九星気学結果が取得された');

    // 姓名判断サービス直接テスト
    const seimeiResponse = await axios.post('http://localhost:5003/seimei/kakusu', {
      sei: '斉',
      mei: '藤仁'
    });

    assert(seimeiResponse.status === 200, '姓名判断サービス直接呼び出しが成功');
    assert(seimeiResponse.data.success === true, '姓名判断結果が取得された');
    assert(seimeiResponse.data.data.kakusu, '画数データが取得された');

  } catch (error) {
    assert(false, `マイクロサービステストエラー: ${error.message}`);
  }
}

async function runAllTests() {
  log('=== E2Eテスト開始 ===');

  await testHealthChecks();
  await testAuthentication();
  await testKanteiCalculation();
  await testPdfGeneration();
  await testDirectMicroservices();

  log('=== テスト結果 ===');
  log(`総テスト数: ${testResults.total}`);
  log(`成功: ${testResults.passed}`);
  log(`失敗: ${testResults.failed}`);

  if (testResults.failed > 0) {
    log('=== 失敗したテスト ===');
    testResults.errors.forEach(error => {
      log(`❌ ${error}`);
    });
  }

  const successRate = (testResults.passed / testResults.total * 100).toFixed(1);
  log(`成功率: ${successRate}%`);

  if (testResults.failed === 0) {
    log('🎉 全てのテストが成功しました！');
    process.exit(0);
  } else {
    log('❌ 一部のテストが失敗しました。');
    process.exit(1);
  }
}

// テスト実行
if (require.main === module) {
  runAllTests().catch(error => {
    log(`致命的エラー: ${error.message}`);
    process.exit(1);
  });
}