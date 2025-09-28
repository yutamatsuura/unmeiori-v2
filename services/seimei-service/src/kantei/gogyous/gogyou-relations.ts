/**
 * 五行関係マスターデータ
 * 相生・相克・比和の関係定義と判定ルール
 */

export enum Gogyou {
  木 = '木',
  火 = '火',
  土 = '土',
  金 = '金',
  水 = '水'
}

export enum GogyouRelation {
  相生 = '相生',
  相克 = '相克',
  比和 = '比和'
}

/**
 * 画数から五行を判定
 * 画数の下一桁で判定：1,2→木、3,4→火、5,6→土、7,8→金、9,0→水
 */
export function getGogyouFromStrokeCount(strokeCount: number): Gogyou {
  // 負の数や0以下の場合は絶対値を取って処理
  const positiveStrokeCount = Math.abs(strokeCount) || 1;
  const lastDigit = positiveStrokeCount % 10;

  switch (lastDigit) {
    case 1:
    case 2:
      return Gogyou.木;
    case 3:
    case 4:
      return Gogyou.火;
    case 5:
    case 6:
      return Gogyou.土;
    case 7:
    case 8:
      return Gogyou.金;
    case 9:
    case 0:
      return Gogyou.水;
    default:
      // ここに到達することはないはずだが、安全のため木を返す
      return Gogyou.木;
  }
}

/**
 * 相生関係の定義（木→火→土→金→水→木）
 */
export const SOUSHOU_RELATIONS: Record<Gogyou, Gogyou> = {
  [Gogyou.木]: Gogyou.火,
  [Gogyou.火]: Gogyou.土,
  [Gogyou.土]: Gogyou.金,
  [Gogyou.金]: Gogyou.水,
  [Gogyou.水]: Gogyou.木
};

/**
 * 相克関係の定義（木⇔土、火⇔金、土⇔水、金⇔木、水⇔火）
 */
export const SOUKOKU_RELATIONS: Record<Gogyou, Gogyou> = {
  [Gogyou.木]: Gogyou.土,
  [Gogyou.火]: Gogyou.金,
  [Gogyou.土]: Gogyou.水,
  [Gogyou.金]: Gogyou.木,
  [Gogyou.水]: Gogyou.火
};

/**
 * 二つの五行の関係を判定
 */
export function getGogyouRelation(gogyou1: Gogyou, gogyou2: Gogyou): GogyouRelation {
  // 比和関係（同じ五行）
  if (gogyou1 === gogyou2) {
    return GogyouRelation.比和;
  }

  // 相生関係
  if (SOUSHOU_RELATIONS[gogyou1] === gogyou2 || SOUSHOU_RELATIONS[gogyou2] === gogyou1) {
    return GogyouRelation.相生;
  }

  // 相克関係
  if (SOUKOKU_RELATIONS[gogyou1] === gogyou2 || SOUKOKU_RELATIONS[gogyou2] === gogyou1) {
    return GogyouRelation.相克;
  }

  // ここに到達することはないはずだが、安全のため
  throw new Error(`Unknown relation between ${gogyou1} and ${gogyou2}`);
}

/**
 * 五行関係の詳細説明
 */
export const GOGYOU_RELATION_DESCRIPTIONS: Record<GogyouRelation, {
  title: string;
  description: string;
  effect: string;
}> = {
  [GogyouRelation.相生]: {
    title: '相生関係',
    description: '一方が他方を生み育てる良好な関係です。',
    effect: '運勢を向上させ、才能を開花させる力があります。'
  },
  [GogyouRelation.相克]: {
    title: '相克関係',
    description: '一方が他方を抑制・克服する関係です。',
    effect: '困難や試練を表しますが、それを乗り越えることで成長できます。'
  },
  [GogyouRelation.比和]: {
    title: '比和関係',
    description: '同じ五行同士の安定した関係です。',
    effect: '穏やかで安定した運勢をもたらします。'
  }
};

/**
 * 五行の特性説明
 */
export const GOGYOU_CHARACTERISTICS: Record<Gogyou, {
  nature: string;
  characteristics: string[];
  strengths: string[];
  weaknesses: string[];
}> = {
  [Gogyou.木]: {
    nature: '成長・発展',
    characteristics: ['柔軟性', '創造力', '向上心'],
    strengths: ['適応力が高い', '新しいことに挑戦する', '人との調和を重視'],
    weaknesses: ['優柔不断', '計画性に欠ける', '感情的になりやすい']
  },
  [Gogyou.火]: {
    nature: '情熱・活動',
    characteristics: ['積極性', '明朗さ', '行動力'],
    strengths: ['リーダーシップがある', '明るく社交的', '決断力がある'],
    weaknesses: ['短気', '飽きっぽい', '計画性に欠ける']
  },
  [Gogyou.土]: {
    nature: '安定・信頼',
    characteristics: ['誠実さ', '忍耐力', '責任感'],
    strengths: ['信頼される', '継続力がある', '現実的'],
    weaknesses: ['頑固', '変化を嫌う', '消極的']
  },
  [Gogyou.金]: {
    nature: '正義・規律',
    characteristics: ['正義感', '規律性', '完璧主義'],
    strengths: ['責任感が強い', '正確性がある', '意志が強い'],
    weaknesses: ['融通が利かない', '批判的', '孤立しやすい']
  },
  [Gogyou.水]: {
    nature: '知恵・流動',
    characteristics: ['知性', '柔軟性', '直感力'],
    strengths: ['洞察力がある', '適応力が高い', '学習能力が高い'],
    weaknesses: ['優柔不断', '冷淡', '一貫性に欠ける']
  }
};