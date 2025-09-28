#!/bin/bash

# E2Eテスト - sindankantei 鑑定システム
# 実際のAPIサーバーが動作している状態で実行する統合テスト

set -e

BASE_URL="http://localhost:5004"
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="aikakumei"

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# カウンター
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

test_pass() {
    ((TOTAL_TESTS++))
    ((PASSED_TESTS++))
    echo -e "${GREEN}✅ PASS:${NC} $1"
}

test_fail() {
    ((TOTAL_TESTS++))
    ((FAILED_TESTS++))
    echo -e "${RED}❌ FAIL:${NC} $1"
}

log "=== E2Eテスト開始 ==="

# 1. ヘルスチェックテスト
log "=== ヘルスチェックテスト ==="

health_response=$(curl -s "$BASE_URL/health")
if echo "$health_response" | grep -q '"status":"healthy"'; then
    test_pass "FastAPIメインサービスが正常"
else
    test_fail "FastAPIメインサービスが異常"
fi

if echo "$health_response" | grep -q '"kyusei":"healthy"'; then
    test_pass "九星気学サービスが正常"
else
    test_fail "九星気学サービスが異常"
fi

if echo "$health_response" | grep -q '"seimei":"healthy"'; then
    test_pass "姓名判断サービスが正常"
else
    test_fail "姓名判断サービスが異常"
fi

# 2. 認証テスト
log "=== 認証テスト ==="

login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_USER_EMAIL\", \"password\": \"$TEST_USER_PASSWORD\"}")

if echo "$login_response" | grep -q '"access_token"'; then
    test_pass "ログインが成功"
    auth_token=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    log "取得したトークン: ${auth_token:0:20}..."
else
    test_fail "ログインが失敗"
    echo "レスポンス: $login_response"
    exit 1
fi

# トークン検証
verify_response=$(curl -s -X GET "$BASE_URL/api/auth/verify" \
  -H "Authorization: Bearer $auth_token")

if echo "$verify_response" | grep -q "$TEST_USER_EMAIL"; then
    test_pass "トークン検証が成功"
else
    test_fail "トークン検証が失敗"
fi

# 3. 鑑定計算テスト
log "=== 鑑定計算テスト ==="

kantei_response=$(curl -s -X POST "$BASE_URL/api/kantei/calculate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $auth_token" \
  -d '{
    "client_info": {
      "name": "斉藤仁",
      "birth_date": "2025-09-04",
      "gender": "male",
      "email": "test@example.com"
    }
  }')

if echo "$kantei_response" | grep -q '"id"'; then
    test_pass "鑑定計算APIが成功"
    kantei_id=$(echo "$kantei_response" | grep -o '"id":[^,]*' | cut -d':' -f2)
    log "生成された鑑定ID: $kantei_id"
else
    test_fail "鑑定計算APIが失敗"
    echo "レスポンス: $kantei_response"
fi

# 九星気学結果チェック
if echo "$kantei_response" | grep -q '"kyusei_result"' && echo "$kantei_response" | grep -q '"birth"'; then
    test_pass "九星気学結果が取得された"
    # 本命星と月命星の確認
    if echo "$kantei_response" | grep -q '"name":"二黒土星"' && echo "$kantei_response" | grep -q '"name":"五黄土星"'; then
        test_pass "九星気学の本命星・月命星が正しく計算された"
        log "本命星: 二黒土星, 月命星: 五黄土星"
    else
        test_fail "九星気学の計算結果が不正"
    fi
else
    test_fail "九星気学結果が取得されなかった"
fi

# 姓名判断結果チェック
if echo "$kantei_response" | grep -q '"seimei_result"' && echo "$kantei_response" | grep -q '"total"'; then
    test_pass "姓名判断結果が取得された"
    # 画数の確認
    total_kaku=$(echo "$kantei_response" | grep -o '"total":[^,]*' | cut -d':' -f2)
    heaven_kaku=$(echo "$kantei_response" | grep -o '"heaven":[^,]*' | cut -d':' -f2)
    earth_kaku=$(echo "$kantei_response" | grep -o '"earth":[^,]*' | cut -d':' -f2)
    personality_kaku=$(echo "$kantei_response" | grep -o '"personality":[^,]*' | cut -d':' -f2)

    if [[ "$total_kaku" -gt 0 && "$heaven_kaku" -gt 0 && "$earth_kaku" -gt 0 && "$personality_kaku" -gt 0 ]]; then
        test_pass "姓名判断の画数が正しく計算された"
        log "総格: ${total_kaku}画, 天格: ${heaven_kaku}画, 地格: ${earth_kaku}画, 人格: ${personality_kaku}画"
    else
        test_fail "姓名判断の画数計算が不正"
    fi
else
    test_fail "姓名判断結果が取得されなかった"
fi

# 統合結果チェック
if echo "$kantei_response" | grep -q '"combined_result"' && echo "$kantei_response" | grep -q '"overall_fortune"'; then
    test_pass "統合結果が生成された"
    overall_fortune=$(echo "$kantei_response" | grep -o '"overall_fortune":"[^"]*"' | cut -d'"' -f4)
    log "総合運勢: $overall_fortune"
else
    test_fail "統合結果が生成されなかった"
fi

# 4. PDF生成テスト
log "=== PDF生成テスト ==="

if [[ -n "$kantei_id" ]]; then
    pdf_response=$(curl -s -X POST "$BASE_URL/api/kantei/generate-pdf-legacy" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $auth_token" \
      -d "{\"kantei_id\": $kantei_id}")

    if echo "$pdf_response" | grep -q '"success":true'; then
        test_pass "PDF生成APIが成功"
        pdf_path=$(echo "$pdf_response" | grep -o '"pdf_path":"[^"]*"' | cut -d'"' -f4)
        log "生成されたPDFパス: $pdf_path"

        # PDFダウンロードテスト
        pdf_download_response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/kantei/pdf/$kantei_id" \
          -H "Authorization: Bearer $auth_token")

        if [[ "$pdf_download_response" == "200" ]]; then
            test_pass "PDFダウンロードが成功"
        else
            test_fail "PDFダウンロードが失敗 (HTTP: $pdf_download_response)"
        fi
    else
        test_fail "PDF生成APIが失敗"
        echo "レスポンス: $pdf_response"
    fi
else
    test_fail "PDF生成テストには鑑定IDが必要"
fi

# 5. マイクロサービス直接テスト
log "=== マイクロサービス直接テスト ==="

# 九星気学サービス直接テスト
kyusei_direct_response=$(curl -s -X POST "http://localhost:5002/kyusei/calculate" \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "2025-09-04"}')

if echo "$kyusei_direct_response" | grep -q '"birth"' && echo "$kyusei_direct_response" | grep -q '"year"'; then
    test_pass "九星気学サービス直接呼び出しが成功"
else
    test_fail "九星気学サービス直接呼び出しが失敗"
fi

# 姓名判断サービス直接テスト
seimei_direct_response=$(curl -s -X POST "http://localhost:5003/seimei/kakusu" \
  -H "Content-Type: application/json" \
  -d '{"sei": "斉", "mei": "藤仁"}')

if echo "$seimei_direct_response" | grep -q '"success":true' && echo "$seimei_direct_response" | grep -q '"kakusu"'; then
    test_pass "姓名判断サービス直接呼び出しが成功"
else
    test_fail "姓名判断サービス直接呼び出しが失敗"
fi

# 結果集計
log "=== テスト結果 ==="
log "総テスト数: $TOTAL_TESTS"
log "成功: $PASSED_TESTS"
log "失敗: $FAILED_TESTS"

success_rate=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)
log "成功率: ${success_rate}%"

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "${GREEN}🎉 全てのテストが成功しました！${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED_TESTS 個のテストが失敗しました。${NC}"
    exit 1
fi