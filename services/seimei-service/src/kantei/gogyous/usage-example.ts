/**
 * 五行詳細判定システム使用例
 */

import { GogyouKantei, GogyouKanteiInput } from './index';

/**
 * 使用例1: 田中太郎さんの五行判定
 */
export function exampleTanakaTaro() {
  const input: GogyouKanteiInput = {
    seiCharacters: [
      { char: '田', strokeCount: 5 },
      { char: '中', strokeCount: 4 }
    ],
    meiCharacters: [
      { char: '太', strokeCount: 4 },
      { char: '郎', strokeCount: 9 }
    ]
  };

  const result = GogyouKantei.performKantei(input);

  console.log('=== 田中太郎さんの五行判定結果 ===');
  console.log(`人格: ${result.jinkaku.description}`);
  console.log(`地格: ${result.chikaku.description}`);
  console.log(`人格と地格の関係: ${result.jinkakuChikakuRelation.relation} (スコア: ${result.jinkakuChikakuRelation.score}点)`);
  console.log(`内的五行バランス: ${result.internalBalance.typeCount}種類 (${result.internalBalance.evaluation})`);
  console.log(`総合スコア: ${result.totalScore}点 (${result.totalEvaluation})`);
  console.log(`アドバイス: ${result.advice}`);

  return result;
}

/**
 * 使用例2: APIエンドポイントでの使用
 */
export function createGogyouKanteiEndpoint() {
  return {
    method: 'POST',
    path: '/api/seimei/gogyou-kantei',
    handler: (req: any, res: any) => {
      try {
        const { name } = req.body;

        // 名前から文字と画数を抽出（実際の実装では画数マスターデータを使用）
        const input: GogyouKanteiInput = parseNameToKanteiInput(name);

        // 五行判定を実行
        const result = GogyouKantei.performKantei(input);

        // レスポンスを整形
        const response = {
          success: true,
          data: {
            name,
            jinkaku: result.jinkaku,
            chikaku: result.chikaku,
            relation: result.jinkakuChikakuRelation,
            balance: result.internalBalance,
            totalScore: result.totalScore,
            evaluation: result.totalEvaluation,
            advice: result.advice
          }
        };

        res.json(response);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '五行判定の処理中にエラーが発生しました',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };
}

/**
 * 名前文字列から五行判定用の入力データに変換
 * （実際の実装では画数マスターデータを参照）
 */
function parseNameToKanteiInput(name: string): GogyouKanteiInput {
  // 簡易的な実装例（実際はDBから画数を取得）
  const strokeMap: Record<string, number> = {
    '田': 5, '中': 4, '太': 4, '郎': 9,
    '佐': 7, '藤': 18, '花': 7, '子': 3,
    '山': 3, '一': 1
  };

  // 姓名を分割（仮実装）
  const chars = name.split('');
  const midPoint = Math.floor(chars.length / 2);

  const seiCharacters = chars.slice(0, midPoint).map(char => ({
    char,
    strokeCount: strokeMap[char] || 1
  }));

  const meiCharacters = chars.slice(midPoint).map(char => ({
    char,
    strokeCount: strokeMap[char] || 1
  }));

  return { seiCharacters, meiCharacters };
}

/**
 * 使用例3: バッチ処理での使用
 */
export function exampleBatchProcessing() {
  const names = ['田中太郎', '佐藤花子', '山田一郎'];

  const results = names.map(name => {
    const input = parseNameToKanteiInput(name);
    const result = GogyouKantei.performKantei(input);

    return {
      name,
      totalScore: result.totalScore,
      evaluation: result.totalEvaluation,
      balanceType: result.internalBalance.typeCount
    };
  });

  console.log('=== バッチ処理結果 ===');
  results.forEach(result => {
    console.log(`${result.name}: ${result.totalScore}点 (${result.evaluation}) - 五行${result.balanceType}種類`);
  });

  return results;
}