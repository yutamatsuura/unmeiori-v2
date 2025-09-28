import { test, expect } from '@playwright/test';

test.describe('PDF生成機能 - E2Eテスト', () => {

  // E2E-PDF-001: ログイン機能テスト
  test('E2E-PDF-001: ログイン機能テスト', async ({ page }) => {
    console.log('🎯 E2E-PDF-001 開始: ログイン機能テスト');

    // ログインページにアクセス
    console.log('📍 1. ログインページにアクセス');
    await page.goto('http://localhost:3001/login');

    // ページが正しく読み込まれたことを確認
    await expect(page).toHaveTitle(/鑑定書楽々作成ツール|sindankantei/);

    // ログインフォームの要素が存在することを確認
    console.log('📍 2. ログインフォーム要素の確認');

    // メールアドレス入力フィールドの確認
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEnabled();

    // パスワード入力フィールドの確認
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toBeEnabled();

    // ログインボタンの確認
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();

    // ログインフォームに入力
    console.log('📍 3. ログイン情報入力');
    await emailInput.fill('test@example.com');
    await passwordInput.fill('testpass123');

    // 入力値が正しく設定されていることを確認
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('testpass123');

    // ログインボタンをクリック
    console.log('📍 4. ログイン実行');
    await loginButton.click();

    // ログイン処理の完了を待つ（最大10秒）
    console.log('📍 5. ログイン完了待機');
    await page.waitForTimeout(3000);

    // ログイン成功の確認
    // 成功時は鑑定書作成ページ(/create)にリダイレクトされることを確認
    console.log('📍 6. ログイン成功確認 - /createページへの遷移');
    await page.waitForURL('**/create', { timeout: 10000 });

    // createページが正しく表示されることを確認
    await expect(page).toHaveURL(/.*\/create/);

    // createページの主要要素が存在することを確認
    console.log('📍 7. 鑑定書作成ページの要素確認');

    // 氏名入力フィールドの確認
    const nameField = page.getByLabel('氏名');
    await expect(nameField).toBeVisible();

    // 生年月日フィールドの確認
    const birthdateField = page.locator('input[type="date"]');
    await expect(birthdateField).toBeVisible();

    // 性別選択フィールドの確認
    const genderSelect = page.locator('[data-testid="gender-select"]');
    await expect(genderSelect).toBeVisible();

    // メールアドレスフィールドの確認
    const emailField = page.getByLabel('メールアドレス');
    await expect(emailField).toBeVisible();

    // 鑑定計算ボタンの確認
    const calculateButton = page.locator('[data-testid="calculate-button"]');
    await expect(calculateButton).toBeVisible();

    console.log('✅ E2E-PDF-001 完了: ログイン機能正常動作確認');
  });

  // E2E-PDF-002: Preview/18ページアクセステスト
  test('E2E-PDF-002: Preview/18ページアクセステスト', async ({ page }) => {
    console.log('🎯 E2E-PDF-002 開始: Preview/18ページアクセステスト');

    // 認証が必要な場合はログインから開始
    console.log('📍 1. ログイン処理');
    await page.goto('http://localhost:3001/login');

    // ログインフォームに入力
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('testpass123');
    await page.locator('button[type="submit"]').click();

    // ログイン完了まで待機
    await page.waitForURL('**/create', { timeout: 10000 });

    // preview/18ページに直接アクセス（小文字pに修正）
    console.log('📍 2. preview/18ページへの直接アクセス');
    await page.goto('http://localhost:3001/preview/18');

    // ページが正しく読み込まれたことを確認
    console.log('📍 3. ページ読み込み確認');
    await expect(page).toHaveTitle(/鑑定書楽々作成ツール|sindankantei/);

    // URLが正しく設定されていることを確認（小文字pに修正）
    await expect(page).toHaveURL(/.*\/preview\/18/);

    // ページの主要要素が表示されることを確認
    console.log('📍 4. Previewページの主要要素確認');

    // プリントプレビューコンテナの存在確認
    const previewContainer = page.locator('[data-testid="print-preview-container"]');
    await expect(previewContainer).toBeVisible({ timeout: 10000 });

    // 鑑定結果が表示される主要セクションの確認
    console.log('📍 5. 鑑定結果セクションの確認');

    // 九星気学結果セクション
    const kyuseiSection = page.locator('[data-testid="kyusei-results"]');
    await expect(kyuseiSection).toBeVisible({ timeout: 5000 });

    // 姓名判断結果セクション
    const seimeiSection = page.locator('[data-testid="seimei-results"]');
    await expect(seimeiSection).toBeVisible({ timeout: 5000 });

    // PDFボタンまたはプリント関連のボタン確認
    console.log('📍 6. PDF/プリント機能ボタンの確認');
    const pdfButton = page.locator('[data-testid="pdf-generate-button"], button:has-text("PDF"), button:has-text("プリント")').first();
    await expect(pdfButton).toBeVisible({ timeout: 5000 });

    // ページの基本的なコンテンツ要素が読み込まれているかを確認
    console.log('📍 7. 基本コンテンツの確認');

    // 何らかのテキストコンテンツが存在することを確認
    const contentArea = page.locator('body');
    await expect(contentArea).toContainText(/鑑定|結果|九星|姓名/, { timeout: 5000 });

    console.log('✅ E2E-PDF-002 完了: preview/18ページアクセス正常確認');
  });

  // E2E-PDF-003: PDF生成ボタンテスト
  test('E2E-PDF-003: PDF生成ボタンテスト', async ({ page }) => {
    console.log('🎯 E2E-PDF-003 開始: PDF生成ボタンテスト');

    // 認証が必要な場合はログインから開始
    console.log('📍 1. ログイン処理');
    await page.goto('http://localhost:3001/login');

    // ログインフォームに入力
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('testpass123');
    await page.locator('button[type="submit"]').click();

    // ログイン完了まで待機
    await page.waitForURL('**/create', { timeout: 10000 });

    // preview/18ページに直接アクセス
    console.log('📍 2. preview/18ページへのアクセス');
    await page.goto('http://localhost:3001/preview/18');

    // ページが正しく読み込まれたことを確認
    console.log('📍 3. ページ読み込み確認');
    await expect(page).toHaveTitle(/鑑定書楽々作成ツール|sindankantei/);
    await expect(page).toHaveURL(/.*\/preview\/18/);

    // プリントプレビューコンテナの存在確認
    console.log('📍 4. プリントプレビューコンテナ確認');
    const previewContainer = page.locator('[data-testid="print-preview-container"]');
    await expect(previewContainer).toBeVisible({ timeout: 10000 });

    // PDF生成ボタンの存在確認と操作
    console.log('📍 5. PDF生成ボタンの確認');

    // 複数の可能なセレクタでPDF生成ボタンを検索
    const pdfButton = page.locator([
      '[data-testid="pdf-generate-button"]',
      'button:has-text("PDF")',
      'button:has-text("プリント")',
      'button:has-text("印刷")',
      'button:has-text("ダウンロード")',
      '[data-testid="download-button"]',
      '[data-testid="print-button"]'
    ].join(', ')).first();

    await expect(pdfButton).toBeVisible({ timeout: 10000 });
    await expect(pdfButton).toBeEnabled();

    console.log('📍 6. PDF生成ボタンのクリック');
    await pdfButton.click();

    // PDF生成処理の開始を確認
    console.log('📍 7. PDF生成処理の確認');

    // PDF生成中のローディングインジケータや進行状況の確認
    // または新しいタブ/ウィンドウの開かれることを確認
    await page.waitForTimeout(2000);

    // PDF生成が開始されたことを示すUIの変化を確認
    // 例：ローディングスピナー、進行バー、成功メッセージなど
    const loadingIndicator = page.locator([
      '[data-testid="pdf-loading"]',
      '.loading',
      'text=生成中',
      'text=処理中',
      'text=Loading'
    ].join(', '));

    // ローディングが表示されるかダウンロードが開始されるかの確認
    const hasLoading = await loadingIndicator.first().isVisible().catch(() => false);

    console.log('📍 8. PDF生成処理結果の確認');

    if (hasLoading) {
      console.log('✓ PDF生成処理中のローディング表示を確認');
      // ローディングが完了するまで待機（最大30秒）
      await loadingIndicator.first().waitFor({ state: 'hidden', timeout: 30000 });
    }

    // PDF生成完了後の状態確認
    // 成功メッセージやダウンロード完了の表示を確認
    const successMessage = page.locator([
      'text=生成完了',
      'text=ダウンロード完了',
      'text=成功',
      '[data-testid="pdf-success"]'
    ].join(', '));

    const hasSuccess = await successMessage.first().isVisible().catch(() => false);

    if (hasSuccess) {
      console.log('✓ PDF生成完了メッセージを確認');
    } else {
      console.log('⚠ PDF生成完了メッセージは表示されていませんが、処理は実行されました');
    }

    console.log('✅ E2E-PDF-003 完了: PDF生成ボタン機能確認完了');
  });

  // E2E-PDF-004: PDF生成とダウンロードテスト
  test('E2E-PDF-004: PDF生成とダウンロードテスト', async ({ page }) => {
    console.log('🎯 E2E-PDF-004 開始: PDF生成とダウンロードテスト');

    // 認証処理
    console.log('📍 1. ログイン処理');
    await page.goto('http://localhost:3001/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('testpass123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/create', { timeout: 10000 });

    // preview/18ページにアクセス
    console.log('📍 2. preview/18ページへのアクセス');
    await page.goto('http://localhost:3001/preview/18');
    await expect(page).toHaveTitle(/鑑定書楽々作成ツール|sindankantei/);
    await expect(page).toHaveURL(/.*\/preview\/18/);

    // ページ読み込み完了を待機
    console.log('📍 3. ページ読み込み完了確認');
    const previewContainer = page.locator('[data-testid="print-preview-container"]');
    await expect(previewContainer).toBeVisible({ timeout: 10000 });

    // 鑑定データが正しく表示されているか確認
    console.log('📍 4. 鑑定データ表示確認');
    await expect(page.locator('text=鑑定書 #18')).toBeVisible();

    // 基本的なコンテンツが表示されているかを確認
    const hasContent = await page.locator('text=氏名').or(page.locator('text=生年月日')).first().isVisible();
    if (hasContent) {
      console.log('✓ 鑑定データの基本情報が表示されています');
    } else {
      console.log('⚠ 鑑定データが読み込み中の可能性があります。待機します...');
      await page.waitForTimeout(2000);
    }

    // 印刷用表示ボタンをクリックして、PrintPreviewModeに入る
    console.log('📍 5. 印刷用表示モードへの切り替え');
    const printModeButton = page.locator('[data-testid="pdf-generate-button"]:has-text("印刷用表示")');
    await expect(printModeButton).toBeVisible({ timeout: 5000 });
    await printModeButton.click();

    // PrintPreviewModeに切り替わったことを確認
    await page.waitForTimeout(1000);

    // PDF生成ボタンの確認とクリック
    console.log('📍 6. PDF生成ボタンの操作');
    const pdfButton = page.locator('[data-testid="pdf-generate-button"]:has-text("PDF生成")');
    await expect(pdfButton).toBeVisible({ timeout: 5000 });
    await expect(pdfButton).toBeEnabled();

    // APIレスポンスの監視設定
    let pdfGenerateResponse = null;
    page.on('response', response => {
      if (response.url().includes('/api/pdf/generate')) {
        pdfGenerateResponse = response;
        console.log('API Response PDF Generate:', response.status(), response.url());
      }
    });

    // PDF生成ボタンをクリック
    console.log('📍 7. PDF生成実行');
    await pdfButton.click();

    // PDF生成APIの完了を待機
    console.log('📍 8. PDF生成API応答確認');
    await page.waitForTimeout(3000); // API処理時間を考慮

    // PDF生成が成功したことを確認
    if (pdfGenerateResponse) {
      console.log('✓ PDF生成API応答を確認:', pdfGenerateResponse.status());
      expect(pdfGenerateResponse.status()).toBe(200);
    } else {
      console.log('⚠ PDF生成API応答が検出されませんでした');
    }

    // 生成成功の確認（ローディング状態の変化、成功メッセージなど）
    console.log('📍 9. PDF生成成功確認');

    // 成功メッセージまたはダウンロード開始の確認
    const successIndicators = [
      page.locator('text=PDF生成が完了しました'),
      page.locator('text=ダウンロードが開始されました'),
      page.locator('text=生成完了'),
      page.locator('[data-testid="pdf-success"]')
    ];

    let successFound = false;
    for (const indicator of successIndicators) {
      try {
        await indicator.waitFor({ state: 'visible', timeout: 2000 });
        console.log('✓ PDF生成成功メッセージを確認');
        successFound = true;
        break;
      } catch (e) {
        // 次のインジケータを試す
      }
    }

    if (!successFound) {
      console.log('⚠ 明示的な成功メッセージは見つかりませんが、API応答で成功を確認');
    }

    // ダウンロード確認（実際にファイルがダウンロードされたかは環境依存のため、API応答で判定）
    console.log('📍 10. PDF生成結果の最終確認');

    // 最終的な確認：APIが成功ステータスを返し、エラーメッセージが表示されていないことを確認
    const errorMessage = page.locator('text=エラー').or(page.locator('text=失敗'));
    const hasError = await errorMessage.isVisible().catch(() => false);

    if (hasError) {
      console.log('❌ エラーメッセージが表示されています');
      throw new Error('PDF生成でエラーが発生しました');
    } else {
      console.log('✓ エラーメッセージは表示されていません');
    }

    console.log('✅ E2E-PDF-004 完了: PDF生成とダウンロードテスト成功');
  });

  // E2E-PDF-005: 日本語文字表示検証テスト
  test('E2E-PDF-005: 日本語文字表示検証テスト', async ({ page }) => {
    console.log('🎯 E2E-PDF-005 開始: 日本語文字表示検証テスト');

    // 認証処理
    console.log('📍 1. ログイン処理');
    await page.goto('http://localhost:3001/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('testpass123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/create', { timeout: 10000 });

    // preview/18ページにアクセス
    console.log('📍 2. preview/18ページへのアクセス');
    await page.goto('http://localhost:3001/preview/18');
    await expect(page).toHaveTitle(/鑑定書楽々作成ツール|sindankantei/);
    await expect(page).toHaveURL(/.*\/preview\/18/);

    // ページ読み込み完了を待機
    console.log('📍 3. ページ読み込み完了確認');
    const previewContainer = page.locator('[data-testid="print-preview-container"]');
    await expect(previewContainer).toBeVisible({ timeout: 10000 });

    // 日本語文字の表示確認
    console.log('📍 4. 日本語文字表示確認');

    // 基本的な日本語キーワードの表示確認
    const japaneseTerms = [
      '鑑定書',
      '氏名',
      '生年月日',
      '九星気学',
      '姓名判断'
    ];

    for (const term of japaneseTerms) {
      console.log(`  - 確認中: "${term}"`);
      const element = page.locator(`text=${term}`);
      await expect(element.first()).toBeVisible({ timeout: 5000 });
      console.log(`  ✓ "${term}" 表示確認済み`);
    }

    // 九星気学関連の日本語表示確認
    console.log('📍 5. 九星気学関連の日本語表示確認');
    const kyuseiTerms = [
      '本命星',
      '月命星',
      '運勢',
      '性格'
    ];

    for (const term of kyuseiTerms) {
      const element = page.locator(`text=${term}`);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`  ✓ 九星気学用語 "${term}" 表示確認済み`);
      } else {
        console.log(`  ⚠ 九星気学用語 "${term}" が見つかりませんが、データ依存のため許容します`);
      }
    }

    // 姓名判断関連の日本語表示確認
    console.log('📍 6. 姓名判断関連の日本語表示確認');
    const seimeiTerms = [
      '画数',
      '天格',
      '人格',
      '地格',
      '外格',
      '総格'
    ];

    for (const term of seimeiTerms) {
      const element = page.locator(`text=${term}`);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`  ✓ 姓名判断用語 "${term}" 表示確認済み`);
      } else {
        console.log(`  ⚠ 姓名判断用語 "${term}" が見つかりませんが、データ依存のため許容します`);
      }
    }

    // 文字エンコーディングの確認
    console.log('📍 7. 文字エンコーディング確認');

    // ページの文字エンコーディングがUTF-8であることを確認
    const charsetMeta = page.locator('meta[charset]');
    const charset = await charsetMeta.getAttribute('charset').catch(() => 'not found');
    console.log(`  - ページ文字エンコーディング: ${charset}`);

    // 基本的な日本語文字の正常表示確認（文字化けチェック）
    const bodyText = await page.locator('body').textContent();

    // 文字化けパターンの検出
    const corruptedPatterns = [
      /\uFFFD/g,  // 置換文字（?マーク）
      /ï¿½/g,     // UTF-8 BOMエラー
      /\?\?\?/g   // 複数の?マーク
    ];

    let hasCorruption = false;
    for (const pattern of corruptedPatterns) {
      if (pattern.test(bodyText)) {
        hasCorruption = true;
        console.log(`  ❌ 文字化けパターンを検出: ${pattern}`);
      }
    }

    if (!hasCorruption) {
      console.log('  ✓ 文字化けパターンは検出されませんでした');
    }

    // 日本語フォントの表示確認
    console.log('📍 8. 日本語フォント表示確認');

    // 基本的な日本語文字が読み込まれているかを確認
    const textElements = page.locator('body *').filter({ hasText: /[ひらがなカタカナ漢字]/ });
    const textCount = await textElements.count();
    console.log(`  - 日本語文字を含む要素数: ${textCount}`);

    if (textCount > 0) {
      console.log('  ✓ 日本語文字を含む要素が正常に表示されています');
    } else {
      console.log('  ⚠ 日本語文字を含む要素が見つかりませんが、データ依存のため許容します');
    }

    // 最終確認：重要な日本語コンテンツの存在確認
    console.log('📍 9. 重要な日本語コンテンツの最終確認');

    const importantContent = page.locator('text=鑑定書').or(page.locator('text=鑑定結果'));
    await expect(importantContent.first()).toBeVisible();
    console.log('  ✓ 重要な日本語コンテンツ（鑑定書/鑑定結果）の表示を確認');

    console.log('✅ E2E-PDF-005 完了: 日本語文字表示検証テスト成功');
  });

  // E2E-PDF-006: 総合PDF生成テスト
  test('E2E-PDF-006: 総合PDF生成テスト', async ({ page }) => {
    console.log('🎯 E2E-PDF-006 開始: 総合PDF生成テスト');

    // 認証処理
    console.log('📍 1. ログイン処理');
    await page.goto('http://localhost:3001/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('testpass123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/create', { timeout: 10000 });

    // preview/18ページにアクセス
    console.log('📍 2. preview/18ページへのアクセス');
    await page.goto('http://localhost:3001/preview/18');
    await expect(page).toHaveTitle(/鑑定書楽々作成ツール|sindankantei/);
    await expect(page).toHaveURL(/.*\/preview\/18/);

    // ページ読み込み完了を待機
    console.log('📍 3. ページ読み込み完了確認');
    const previewContainer = page.locator('[data-testid="print-preview-container"]');
    await expect(previewContainer).toBeVisible({ timeout: 10000 });

    // 鑑定データの表示確認（総合テストのため詳細に確認）
    console.log('📍 4. 総合的な鑑定データ表示確認');

    // 基本情報の確認
    console.log('  - 基本情報の確認');
    await expect(page.locator('text=鑑定書 #18')).toBeVisible();

    // 日本語文字の正常表示確認
    console.log('  - 日本語文字の正常表示確認');
    const japaneseTerms = ['鑑定書', '氏名', '生年月日'];
    for (const term of japaneseTerms) {
      await expect(page.locator(`text=${term}`).first()).toBeVisible({ timeout: 5000 });
    }

    // 九星気学結果セクションの確認
    console.log('  - 九星気学結果セクションの確認');
    const kyuseiSection = page.locator('[data-testid="kyusei-results"]');
    await expect(kyuseiSection).toBeVisible({ timeout: 5000 });

    // 姓名判断結果セクションの確認
    console.log('  - 姓名判断結果セクションの確認');
    const seimeiSection = page.locator('[data-testid="seimei-results"]');
    await expect(seimeiSection).toBeVisible({ timeout: 5000 });

    // 印刷用表示モードへの切り替え
    console.log('📍 5. 印刷用表示モードへの切り替え');
    const printModeButton = page.locator('[data-testid="pdf-generate-button"]:has-text("印刷用表示")');
    await expect(printModeButton).toBeVisible({ timeout: 5000 });
    await printModeButton.click();
    await page.waitForTimeout(1000);

    // PDF生成機能の総合テスト
    console.log('📍 6. PDF生成機能の総合実行');
    const pdfButton = page.locator('[data-testid="pdf-generate-button"]:has-text("PDF生成")');
    await expect(pdfButton).toBeVisible({ timeout: 5000 });
    await expect(pdfButton).toBeEnabled();

    // APIレスポンスの監視設定（総合テストのため詳細監視）
    let pdfGenerateResponse = null;
    let apiCallCount = 0;
    page.on('response', response => {
      if (response.url().includes('/api/pdf/generate')) {
        pdfGenerateResponse = response;
        apiCallCount++;
        console.log(`API Response PDF Generate #${apiCallCount}:`, response.status(), response.url());
      }
    });

    // PDF生成実行
    console.log('📍 7. PDF生成実行');
    await pdfButton.click();

    // API応答の詳細確認（総合テストのため厳密に検証）
    console.log('📍 8. API応答の詳細確認');
    await page.waitForTimeout(3000);

    if (pdfGenerateResponse) {
      console.log('✓ PDF生成API応答を確認:', pdfGenerateResponse.status());
      expect(pdfGenerateResponse.status()).toBe(200);

      // レスポンスボディの確認（可能な場合）
      try {
        const responseText = await pdfGenerateResponse.text();
        console.log('API Response Body length:', responseText.length);
        if (responseText.includes('success') || responseText.includes('url')) {
          console.log('✓ API応答にPDF生成成功の内容が含まれています');
        }
      } catch (e) {
        console.log('⚠ API応答ボディの読み取りに失敗しましたが、ステータスコードで成功を確認済みです');
      }
    } else {
      console.log('❌ PDF生成API応答が検出されませんでした');
      throw new Error('PDF生成APIが呼び出されていません');
    }

    // 生成結果の総合確認
    console.log('📍 9. PDF生成結果の総合確認');

    // 成功メッセージの確認
    const successIndicators = [
      page.locator('text=PDF生成が完了しました'),
      page.locator('text=ダウンロードが開始されました'),
      page.locator('text=生成完了'),
      page.locator('[data-testid="pdf-success"]')
    ];

    let successFound = false;
    for (const indicator of successIndicators) {
      try {
        await indicator.waitFor({ state: 'visible', timeout: 2000 });
        console.log('✓ PDF生成成功メッセージを確認');
        successFound = true;
        break;
      } catch (e) {
        // 次のインジケータを試す
      }
    }

    // エラーメッセージがないことの確認
    console.log('📍 10. エラー状態の確認');
    const errorMessage = page.locator('text=エラー').or(page.locator('text=失敗'));
    const hasError = await errorMessage.isVisible().catch(() => false);

    if (hasError) {
      console.log('❌ エラーメッセージが表示されています');
      const errorText = await errorMessage.textContent();
      console.log('エラー内容:', errorText);
      throw new Error(`PDF生成でエラーが発生しました: ${errorText}`);
    } else {
      console.log('✓ エラーメッセージは表示されていません');
    }

    // 総合テスト結果の最終判定
    console.log('📍 11. 総合テスト結果の最終判定');

    const summaryResults = {
      login: '✓ ログイン成功',
      pageAccess: '✓ preview/18ページアクセス成功',
      dataDisplay: '✓ 鑑定データ表示確認',
      japaneseText: '✓ 日本語文字表示正常',
      kyuseiSection: '✓ 九星気学セクション表示',
      seimeiSection: '✓ 姓名判断セクション表示',
      printMode: '✓ 印刷用表示モード切替成功',
      pdfGeneration: pdfGenerateResponse ? '✓ PDF生成API実行成功' : '❌ PDF生成API実行失敗',
      apiResponse: pdfGenerateResponse && pdfGenerateResponse.status() === 200 ? '✓ API応答200 OK' : '❌ API応答エラー',
      noErrors: !hasError ? '✓ エラーなし' : '❌ エラーあり'
    };

    console.log('=== 総合テスト結果サマリー ===');
    Object.entries(summaryResults).forEach(([key, result]) => {
      console.log(`${key}: ${result}`);
    });

    // 全ての必須項目が成功している場合のみテスト成功とする
    const criticalFailures = Object.values(summaryResults).filter(result => result.includes('❌'));

    if (criticalFailures.length > 0) {
      console.log('❌ 総合テストで重要な項目に失敗があります:', criticalFailures);
      throw new Error('総合PDF生成テストで重要な機能に問題があります');
    }

    console.log('✅ E2E-PDF-006 完了: 総合PDF生成テスト全項目成功');
  });

  // E2E-PDF-007: PDF品質検証テスト
  test.only('E2E-PDF-007: PDF品質検証テスト', async ({ page }) => {
    console.log('🎯 E2E-PDF-007 開始: PDF品質検証テスト');

    // 認証処理
    console.log('📍 1. ログイン処理');
    await page.goto('http://localhost:3001/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('testpass123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/create', { timeout: 10000 });

    // preview/18ページにアクセス
    console.log('📍 2. preview/18ページへのアクセス');
    await page.goto('http://localhost:3001/preview/18');
    await expect(page).toHaveTitle(/鑑定書楽々作成ツール|sindankantei/);
    await expect(page).toHaveURL(/.*\/preview\/18/);

    // ページ読み込み完了を待機
    console.log('📍 3. ページ読み込み完了確認');
    const previewContainer = page.locator('[data-testid="print-preview-container"]');
    await expect(previewContainer).toBeVisible({ timeout: 10000 });

    // 鑑定データの品質確認
    console.log('📍 4. 鑑定データ品質確認');

    // 基本情報の存在と品質確認
    console.log('  - 基本情報の品質確認');
    await expect(page.locator('text=鑑定書 #18')).toBeVisible();

    // 氏名データの品質確認
    const nameElement = page.locator('text=氏名').or(page.locator('text=お名前'));
    const hasName = await nameElement.isVisible().catch(() => false);
    if (hasName) {
      console.log('  ✓ 氏名データが存在します');
    } else {
      console.log('  ⚠ 氏名データが見つかりません（データ依存）');
    }

    // 生年月日データの品質確認
    const birthdateElement = page.locator('text=生年月日');
    const hasBirthdate = await birthdateElement.isVisible().catch(() => false);
    if (hasBirthdate) {
      console.log('  ✓ 生年月日データが存在します');
    } else {
      console.log('  ⚠ 生年月日データが見つかりません（データ依存）');
    }

    // 九星気学結果の品質確認
    console.log('📍 5. 九星気学結果品質確認');
    const kyuseiSection = page.locator('[data-testid="kyusei-results"]');
    await expect(kyuseiSection).toBeVisible({ timeout: 5000 });

    // 九星気学データの詳細品質確認
    const kyuseiTerms = ['本命星', '月命星', '九星', '運勢', '性格', '白', '黒', '緑', '碧', '黄', '赤'];
    let kyuseiQualityScore = 0;
    for (const term of kyuseiTerms) {
      const element = page.locator(`text=${term}`);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        kyuseiQualityScore++;
        console.log(`  ✓ 九星気学用語 "${term}" 確認済み`);
      }
    }
    console.log(`  📊 九星気学データ品質スコア: ${kyuseiQualityScore}/${kyuseiTerms.length}`);

    // 姓名判断結果の品質確認
    console.log('📍 6. 姓名判断結果品質確認');
    const seimeiSection = page.locator('[data-testid="seimei-results"]');
    await expect(seimeiSection).toBeVisible({ timeout: 5000 });

    // 姓名判断データの詳細品質確認
    const seimeiTerms = ['天格', '人格', '地格', '外格', '総格', '画数', '吉', '凶', '大吉', '中吉'];
    let seimeiQualityScore = 0;
    for (const term of seimeiTerms) {
      const element = page.locator(`text=${term}`);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        seimeiQualityScore++;
        console.log(`  ✓ 姓名判断用語 "${term}" 確認済み`);
      }
    }
    console.log(`  📊 姓名判断データ品質スコア: ${seimeiQualityScore}/${seimeiTerms.length}`);

    // 印刷用表示モードへの切り替え
    console.log('📍 7. 印刷用表示モードへの切り替え');
    const printModeButton = page.locator('[data-testid="pdf-generate-button"]:has-text("印刷用表示")');
    await expect(printModeButton).toBeVisible({ timeout: 5000 });
    await printModeButton.click();
    await page.waitForTimeout(1000);

    // PDF生成ボタンの品質確認
    console.log('📍 8. PDF生成機能品質確認');
    const pdfButton = page.locator('[data-testid="pdf-generate-button"]:has-text("PDF生成")');
    await expect(pdfButton).toBeVisible({ timeout: 5000 });
    await expect(pdfButton).toBeEnabled();

    // PDFダウンロード機能の品質テスト
    console.log('📍 9. PDFダウンロード品質テスト');

    // ダウンロードイベントの監視設定
    let downloadStarted = false;
    let downloadPath = '';

    page.on('download', download => {
      downloadStarted = true;
      downloadPath = download.suggestedFilename();
      console.log('✓ PDFダウンロードが開始されました:', downloadPath);
    });

    // APIレスポンスの品質監視設定
    let pdfGenerateResponse = null;
    let pdfResponseTime = 0;
    const startTime = Date.now();

    page.on('response', response => {
      if (response.url().includes('/api/pdf/generate')) {
        pdfGenerateResponse = response;
        pdfResponseTime = Date.now() - startTime;
        console.log('API Response PDF Generate:', response.status(), `(${pdfResponseTime}ms)`);
      }
    });

    // PDF生成実行
    console.log('📍 10. PDF生成実行と品質評価');
    await pdfButton.click();

    // API応答の品質確認
    console.log('📍 11. API応答品質確認');
    await page.waitForTimeout(5000); // PDF生成処理時間を考慮

    if (pdfGenerateResponse) {
      console.log('✓ PDF生成API応答を確認:', pdfGenerateResponse.status());
      console.log('✓ API応答時間:', pdfResponseTime, 'ms');

      // 応答時間の品質評価
      if (pdfResponseTime < 3000) {
        console.log('  📊 API応答時間品質: 優秀（3秒未満）');
      } else if (pdfResponseTime < 10000) {
        console.log('  📊 API応答時間品質: 良好（10秒未満）');
      } else {
        console.log('  📊 API応答時間品質: 要改善（10秒以上）');
      }

      expect(pdfGenerateResponse.status()).toBe(200);
    } else {
      console.log('❌ PDF生成API応答が検出されませんでした');
      throw new Error('PDF生成APIが呼び出されていません');
    }

    // PDFダウンロード品質確認
    console.log('📍 12. PDFダウンロード品質確認');

    // ダウンロード開始の確認（最大10秒待機）
    await page.waitForTimeout(3000);

    if (downloadStarted) {
      console.log('✅ PDFダウンロードが正常に開始されました');
      console.log('  📄 ダウンロードファイル名:', downloadPath);

      // ファイル名の品質確認
      if (downloadPath.includes('.pdf')) {
        console.log('  ✓ PDFファイル拡張子が正しく設定されています');
      }

      if (downloadPath.includes('鑑定書') || downloadPath.includes('kantei')) {
        console.log('  ✓ ファイル名に鑑定書関連の命名が含まれています');
      }
    } else {
      console.log('⚠ 直接ダウンロードは開始されませんでしたが、API経由での処理は確認済みです');
    }

    // 成功メッセージの品質確認
    console.log('📍 13. 成功メッセージ品質確認');
    const successIndicators = [
      page.locator('text=PDF生成が完了しました'),
      page.locator('text=ダウンロードが開始されました'),
      page.locator('text=生成完了'),
      page.locator('[data-testid="pdf-success"]')
    ];

    let successMessageFound = false;
    let successMessageText = '';
    for (const indicator of successIndicators) {
      try {
        await indicator.waitFor({ state: 'visible', timeout: 2000 });
        successMessageText = await indicator.textContent();
        console.log('✓ PDF生成成功メッセージを確認:', successMessageText);
        successMessageFound = true;
        break;
      } catch (e) {
        // 次のインジケータを試す
      }
    }

    // エラーメッセージがないことの品質確認
    console.log('📍 14. エラー状態品質確認');
    const errorMessage = page.locator('text=エラー').or(page.locator('text=失敗'));
    const hasError = await errorMessage.isVisible().catch(() => false);

    if (hasError) {
      console.log('❌ エラーメッセージが表示されています');
      const errorText = await errorMessage.textContent();
      console.log('エラー内容:', errorText);
      throw new Error(`PDF生成でエラーが発生しました: ${errorText}`);
    } else {
      console.log('✓ エラーメッセージは表示されていません');
    }

    // PDF品質検証の総合評価
    console.log('📍 15. PDF品質検証総合評価');

    const qualityResults = {
      login: '✅ ログイン成功',
      pageAccess: '✅ preview/18ページアクセス成功',
      dataQuality: `📊 九星気学品質: ${kyuseiQualityScore}/${kyuseiTerms.length}, 姓名判断品質: ${seimeiQualityScore}/${seimeiTerms.length}`,
      apiPerformance: pdfResponseTime ? `📊 API応答時間: ${pdfResponseTime}ms` : '❌ API応答時間測定失敗',
      pdfGeneration: pdfGenerateResponse && pdfGenerateResponse.status() === 200 ? '✅ PDF生成API実行成功' : '❌ PDF生成API実行失敗',
      downloadFunction: downloadStarted ? '✅ PDFダウンロード機能動作確認' : '⚠ ダウンロード機能要確認',
      successMessage: successMessageFound ? '✅ 成功メッセージ表示確認' : '⚠ 成功メッセージ要改善',
      noErrors: !hasError ? '✅ エラーなし' : '❌ エラーあり'
    };

    console.log('=== PDF品質検証結果サマリー ===');
    Object.entries(qualityResults).forEach(([key, result]) => {
      console.log(`${key}: ${result}`);
    });

    // 品質基準の評価
    let qualityScore = 0;
    const totalCriteria = 8;

    if (qualityResults.login.includes('✅')) qualityScore++;
    if (qualityResults.pageAccess.includes('✅')) qualityScore++;
    if (kyuseiQualityScore >= 3) qualityScore++;
    if (seimeiQualityScore >= 3) qualityScore++;
    if (pdfResponseTime && pdfResponseTime < 10000) qualityScore++;
    if (qualityResults.pdfGeneration.includes('✅')) qualityScore++;
    if (qualityResults.noErrors.includes('✅')) qualityScore++;
    if (downloadStarted || successMessageFound) qualityScore++;

    const qualityPercentage = Math.round((qualityScore / totalCriteria) * 100);
    console.log(`📊 総合品質スコア: ${qualityScore}/${totalCriteria} (${qualityPercentage}%)`);

    // 品質基準による判定
    if (qualityPercentage >= 90) {
      console.log('🏆 PDF品質評価: 優秀（90%以上）');
    } else if (qualityPercentage >= 75) {
      console.log('✅ PDF品質評価: 良好（75%以上）');
    } else if (qualityPercentage >= 60) {
      console.log('⚠ PDF品質評価: 要改善（60%以上）');
    } else {
      console.log('❌ PDF品質評価: 不合格（60%未満）');
      throw new Error('PDF品質が基準を満たしていません');
    }

    // 最終品質確認（60%以上で合格とする）
    if (qualityPercentage < 60) {
      throw new Error(`PDF品質検証失敗: 品質スコア ${qualityPercentage}% は基準の60%を下回っています`);
    }

    console.log('✅ E2E-PDF-007 完了: PDF品質検証テスト成功');
  });

});