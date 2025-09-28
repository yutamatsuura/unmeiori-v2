import { test, expect } from '@playwright/test';

test('松浦仁の五行バランスと陰陽パターンが正しく表示される', async ({ page }) => {
  // フロントエンドページを開く
  await page.goto('http://localhost:3002/create');
    // 姓名を入力
    await page.fill('input[placeholder="例: 佐藤"]', '松浦');
    await page.fill('input[placeholder="例: 太郎"]', '仁');

    // 生年月日を設定
    await page.fill('input[type="date"]', '1990-01-01');

    // 計算ボタンをクリック
    await page.click('button:has-text("計算開始")');

    // 計算完了を待つ
    await page.waitForSelector('text=姓名判断結果', { timeout: 10000 });

    // gogyou_balanceセクションが表示されることを確認
    await expect(page.locator('text=gogyou_balance')).toBeVisible();

    // youin_patternセクションが表示されることを確認
    await expect(page.locator('text=youin_pattern')).toBeVisible();

    // 具体的な結果値を確認
    // 五行のバランス(悪)が表示されることを確認
    await expect(page.locator('text=五行のバランス(悪)')).toBeVisible();

    // 黒の方寄りが表示されることを確認
    await expect(page.locator('text=黒の方寄り')).toBeVisible();

    // 陰陽パターン ●●● が表示されることを確認
    await expect(page.locator('text=パターン: ●●●')).toBeVisible();

    // 人格: 火-金 が表示されることを確認
    await expect(page.locator('text=人格: 火-金')).toBeVisible();

    console.log('✅ 松浦仁の五行バランスと陰陽パターンが正しく表示されました');

  // スクリーンショットを撮影
  await page.locator('text=gogyou_balance').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: './tests/screenshots/seimei-result-fixed.png',
    fullPage: true
  });
  console.log('✅ スクリーンショットを保存しました');
});