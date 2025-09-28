/**
 * 詳細解説データベース
 * 陰陽・五行・画数の詳細な解説メッセージを格納
 */

export interface YouinExplanation {
  key: string;
  name: string;
  description: string;
}

export interface GogyouExplanation {
  combination: string;
  description: string;
}

export interface KakusuExplanation {
  number: number;
  type: '大吉' | '吉' | '半吉' | '平' | '凶' | '大凶';
  meaning: string;
  description: string;
}

// 陰陽配列の詳細解説
export const YOUIN_EXPLANATIONS: { [key: string]: YouinExplanation } = {
  '下蒔き直し': {
    key: '下蒔き直し',
    name: '下蒔き直し',
    description: '凶名ではありませんが、途中でやり直す人生になります。あわてて転びやすいです。人格的にあっさりしており、明るく楽しい人になります'
  },
  '同一偏重': {
    key: '同一偏重',
    name: '同一偏重',
    description: '陰陽が偏りすぎています。バランスを取ることで運勢の改善が期待できます'
  },
  '交互配列': {
    key: '交互配列',
    name: '交互配列',
    description: '陰陽のバランスが良好です。安定した性格と運勢を持っています'
  },
  '陽始配列': {
    key: '陽始配列',
    name: '陽始配列',
    description: '積極的で行動力があります。リーダーシップを発揮しやすい性格です'
  },
  '陰始配列': {
    key: '陰始配列',
    name: '陰始配列',
    description: '思慮深く、慎重な判断ができます。サポート役として力を発揮します'
  }
};

// 五行の詳細解説
export const GOGYOU_EXPLANATIONS: { [key: string]: GogyouExplanation } = {
  '水-金': {
    combination: '水-金',
    description: '柔和で意志が強く忍耐強いです。冷静に物事を判断できます'
  },
  '金-水': {
    combination: '金-水',
    description: '理性的で判断力に優れています。計画性があり、着実に目標を達成します'
  },
  '木-火': {
    combination: '木-火',
    description: '成長力と行動力を持っています。積極的に新しいことに挑戦します'
  },
  '火-土': {
    combination: '火-土',
    description: '情熱と安定性を兼ね備えています。リーダーシップと忍耐力があります'
  },
  '土-金': {
    combination: '土-金',
    description: '堅実で信頼性があります。物事を着実に進める力があります'
  },
  '金-木': {
    combination: '金-木',
    description: '理性と感性のバランスが良好です。創造性と論理性を持っています'
  },
  '水-火': {
    combination: '水-火',
    description: '相反する要素が調和しています。柔軟性と決断力を持っています'
  },
  '木-土': {
    combination: '木-土',
    description: '成長志向と安定性があります。長期的な視点で物事を考えます'
  },
  '火-金': {
    combination: '火-金',
    description: '情熱と冷静さを併せ持っています。バランスの取れた判断ができます'
  },
  '土-水': {
    combination: '土-水',
    description: '安定性と柔軟性があります。環境に適応しながら着実に進歩します'
  },
  // 不足していた組み合わせを追加
  '金-火': {
    combination: '金-火',
    description: '冷静な判断力と行動力を兼ね備えています。計画的に目標を達成します'
  },
  '火-木': {
    combination: '火-木',
    description: '情熱と成長力を持っています。新しい分野で才能を発揮します'
  },
  '木-金': {
    combination: '木-金',
    description: '成長意欲と理性的な判断力があります。バランスの取れた発展をします'
  },
  '金-土': {
    combination: '金-土',
    description: '冷静さと安定性を持っています。確実に基盤を築く力があります'
  },
  '土-火': {
    combination: '土-火',
    description: '安定した基盤の上に情熱を注ぎます。持続力と行動力を併せ持っています'
  },
  '火-水': {
    combination: '火-水',
    description: '情熱と冷静さのバランスが取れています。柔軟性と決断力を持っています'
  },
  '水-木': {
    combination: '水-木',
    description: '柔軟性と成長力があります。環境に適応しながら発展していきます'
  },
  '木-水': {
    combination: '木-水',
    description: '成長志向と柔軟性を持っています。新しい環境でも力を発揮します'
  },
  '水-土': {
    combination: '水-土',
    description: '柔軟性と安定性を兼ね備えています。状況に応じて着実に進歩します'
  },
  '土-木': {
    combination: '土-木',
    description: '安定した基盤から成長する力があります。長期的な視野で発展します'
  },
  // 同じ五行の組み合わせ
  '木-木': {
    combination: '木-木',
    description: '強い成長力と向上心があります。積極的に挑戦する姿勢を持っています'
  },
  '火-火': {
    combination: '火-火',
    description: '強い行動力と情熱があります。リーダーシップを発揮しやすい性格です'
  },
  '土-土': {
    combination: '土-土',
    description: '高い安定性と忍耐力があります。確実に物事を進める力があります'
  },
  '金-金': {
    combination: '金-金',
    description: '強い意志力と判断力があります。論理的で計画性に優れています'
  },
  '水-水': {
    combination: '水-水',
    description: '高い柔軟性と適応力があります。状況に応じて臨機応変に対応します'
  }
};

// 画数の詳細解説（81数理）
export const KAKUSU_EXPLANATIONS: { [key: number]: KakusuExplanation } = {
  1: {
    number: 1,
    type: '大吉',
    meaning: '太陽',
    description: '万物の始まり、指導者の運。強い意志と実行力を持ち、人の上に立つ運勢です'
  },
  2: {
    number: 2,
    type: '凶',
    meaning: '分裂',
    description: '分離、離散の意味。優柔不断で物事が長続きしない傾向があります'
  },
  3: {
    number: 3,
    type: '大吉',
    meaning: '才知',
    description: '技芸、才能に恵まれる。明朗快活で人望があり、成功を収める運勢です'
  },
  4: {
    number: 4,
    type: '凶',
    meaning: '破滅',
    description: '苦労、困難の暗示。病弱で短命、破産などの災いに注意が必要です'
  },
  5: {
    number: 5,
    type: '大吉',
    meaning: '福徳',
    description: '温和円満、福徳円満の運。健康で長寿、家庭円満の幸運な運勢です'
  },
  6: {
    number: 6,
    type: '大吉',
    meaning: '安泰',
    description: '平和、安定の運。家庭円満で社会的地位も安定し、晩年まで幸福です'
  },
  7: {
    number: 7,
    type: '大吉',
    meaning: '独立',
    description: '剛毅果断、独立独歩の運。強い意志で困難を乗り越え、成功を収めます'
  },
  8: {
    number: 8,
    type: '大吉',
    meaning: '勤勉',
    description: '努力と忍耐で成功する運。意志が強く、着実に目標を達成していきます'
  },
  9: {
    number: 9,
    type: '凶',
    meaning: '薄弱',
    description: '不完全、病弱の暗示。努力しても報われにくく、災難に遭いやすい運勢です'
  },
  10: {
    number: 10,
    type: '凶',
    meaning: '空虚',
    description: '万事休止、零落の運。病弱で短命、家族離散などの災いが起こりやすいです'
  },
  11: {
    number: 11,
    type: '大吉',
    meaning: '春日',
    description: '万物新生、発展の運。智慧と勇気を兼ね備え、名誉と富を得る運勢です'
  },
  12: {
    number: 12,
    type: '凶',
    meaning: '薄弱',
    description: '意志薄弱、挫折の運。努力が報われず、孤立しやすい傾向があります'
  },
  13: {
    number: 13,
    type: '大吉',
    meaning: '智慧',
    description: '学芸成功、技芸達者の運。智慧と才能に恵まれ、学問や芸術で成功します'
  },
  14: {
    number: 14,
    type: '凶',
    meaning: '破兆',
    description: '家族離散、孤独の運。病弱で短命、破産などの災いに見舞われやすいです'
  },
  15: {
    number: 15,
    type: '大吉',
    meaning: '福寿',
    description: '福徳長寿、円満の運。人徳があり、家庭も事業も繁栄する最高の運勢です'
  },
  16: {
    number: 16,
    type: '大吉',
    meaning: '厚重',
    description: '大首領運、統率力の運。人望があり、組織のトップとして成功を収めます'
  },
  17: {
    number: 17,
    type: '大吉',
    meaning: '剛健',
    description: '突破力、意志の強さ。困難を克服し、目標を達成する強い運勢です'
  },
  18: {
    number: 18,
    type: '大吉',
    meaning: '有威',
    description: '志望達成、権威の運。強い意志と実行力で、社会的地位を築きます'
  },
  19: {
    number: 19,
    type: '凶',
    meaning: '障害',
    description: '挫折、困難の運。病弱で短命、家族との縁が薄く、苦労が多い運勢です'
  },
  20: {
    number: 20,
    type: '凶',
    meaning: '虚無',
    description: '破滅、空虚の運。病弱で短命、事業失敗、家族離散などの災いが多いです'
  },
  21: {
    number: 21,
    type: '大吉',
    meaning: '独立',
    description: '独立独歩、統率者の運。強いリーダーシップで組織を導き、成功を収めます'
  },
  22: {
    number: 22,
    type: '凶',
    meaning: '薄弱',
    description: '秋草逢霜、挫折の運。意志が弱く、困難に立ち向かう力が不足しています'
  },
  23: {
    number: 23,
    type: '大吉',
    meaning: '壮麗',
    description: '旭日昇天、発展の運。強い向上心と実行力で、大きな成功を収める運勢です'
  },
  24: {
    number: 24,
    type: '大吉',
    meaning: '金銭',
    description: '金銭豊富、家門復活の運。財運に恵まれ、家族も繁栄する幸運な運勢です'
  },
  25: {
    number: 25,
    type: '大吉',
    meaning: '英敏',
    description: '英邁果断、才知の運。優れた判断力と実行力で、学問や事業で成功します'
  },
  26: {
    number: 26,
    type: '凶',
    meaning: '変怪',
    description: '波乱変動、奇怪の運。英雄的な面もありますが、波乱万丈の人生になります'
  },
  27: {
    number: 27,
    type: '半吉',
    meaning: '批難',
    description: '批難中傷、誹謗の運。才能はありますが、人間関係に問題が生じやすいです'
  },
  28: {
    number: 28,
    type: '凶',
    meaning: '不和',
    description: '家族不和、孤独の運。親族との縁が薄く、孤立しやすい傾向があります'
  },
  29: {
    number: 29,
    type: '大吉',
    meaning: '独立',
    description: '人に隠れた苦労はあるが、温厚な性格と人格が苦労に耐え、やがて大業を成し遂げる'
  },
  30: {
    number: 30,
    type: '凶',
    meaning: '浮沈',
    description: '浮沈混合、一進一退の運。成功と失敗を繰り返し、不安定な人生になります'
  },
  31: {
    number: 31,
    type: '大吉',
    meaning: '智勇',
    description: '智勇兼備、福徳集門の運。智慧と勇気を兼ね備え、幸福な人生を送ります'
  },
  32: {
    number: 32,
    type: '大吉',
    meaning: '僥倖',
    description: '僥倖多幸、意外の恵みの運。思いがけない幸運に恵まれる運勢です'
  },
  33: {
    number: 33,
    type: '大吉',
    meaning: '隆昌',
    description: '家門隆昌、才徳開花の運。家系が栄え、個人も才能を発揮して成功します'
  },
  34: {
    number: 34,
    type: '凶',
    meaning: '破家',
    description: '破家亡身、滅亡の運。家庭崩壊、事業失敗などの大きな災いに注意が必要です'
  },
  35: {
    number: 35,
    type: '大吉',
    meaning: '温和',
    description: '温和平穏、技芸の運。温厚な人柄で人望があり、技芸や学問で成功します'
  },
  36: {
    number: 36,
    type: '凶',
    meaning: '波瀾',
    description: '波瀾重畳、風浪の運。困難と波乱が多く、安定しない人生になりがちです'
  },
  37: {
    number: 37,
    type: '大吉',
    meaning: '慈祥',
    description: '慈祥有徳、大望成就の運。徳を積み、大きな目標を達成する幸運な運勢です'
  },
  38: {
    number: 38,
    type: '半吉',
    meaning: '芸術',
    description: '技芸成功、芸術の運。芸術的才能に恵まれますが、意志がやや弱い面があります'
  },
  39: {
    number: 39,
    type: '大吉',
    meaning: '富貴',
    description: '富貴栄華、福禄の運。財運と地位に恵まれ、社会的に成功を収める運勢です'
  },
  40: {
    number: 40,
    type: '凶',
    meaning: '退安',
    description: '退安保身、無謀の運。消極的で、大胆な行動を避ける傾向があります'
  },
  41: {
    number: 41,
    type: '大吉',
    meaning: '有徳',
    description: '有徳円満、純潔の運。人格者として尊敬され、円満な人生を送ります'
  },
  42: {
    number: 42,
    type: '凶',
    meaning: '薄弱',
    description: '薄弱挫折、離散の運。意志が弱く、物事を最後まで成し遂げることが困難です'
  },
  43: {
    number: 43,
    type: '凶',
    meaning: '散財',
    description: '散財酒色、悪癖の運。浪費癖があり、享楽に溺れやすい傾向があります'
  },
  44: {
    number: 44,
    type: '凶',
    meaning: '破滅',
    description: '破滅滅亡、家族離散の運。家庭崩壊や事業失敗などの大きな災いに注意です'
  },
  45: {
    number: 45,
    type: '大吉',
    meaning: '順風',
    description: '順風満帆、新生の運。順調に発展し、新しい分野で成功を収める運勢です'
  },
  46: {
    number: 46,
    type: '凶',
    meaning: '浪費',
    description: '浪費散財、困窮の運。金銭管理が苦手で、経済的困難に陥りやすいです'
  },
  47: {
    number: 47,
    type: '大吉',
    meaning: '開花',
    description: '開花結実、権威の運。努力が実を結び、社会的地位と名誉を得る運勢です'
  },
  48: {
    number: 48,
    type: '大吉',
    meaning: '智謀',
    description: '智謀兼備、徳望の運。智慧と人徳を兼ね備え、人々から信頼される運勢です'
  },
  49: {
    number: 49,
    type: '半吉',
    meaning: '転変',
    description: '転変極まりなし、吉凶混合の運。変化が多く、吉凶が入り混じった運勢です'
  },
  50: {
    number: 50,
    type: '凶',
    meaning: '小舟',
    description: '小舟大海、遭難の運。大きな困難に立ち向かう力が不足し、挫折しやすいです'
  },
  51: {
    number: 51,
    type: '半吉',
    meaning: '雲晴',
    description: '雲晴月明、一進一退の運。時には成功し、時には失敗する波のある運勢です'
  },
  52: {
    number: 52,
    type: '大吉',
    meaning: '達眼',
    description: '達眼識見、先見の明の運。優れた洞察力で将来を見通し、成功を収めます'
  },
  53: {
    number: 53,
    type: '凶',
    meaning: '憂愁',
    description: '憂愁困苦、内外の患いの運。心配事が多く、精神的に不安定になりがちです'
  },
  54: {
    number: 54,
    type: '凶',
    meaning: '石上',
    description: '石上金花、多難の運。努力しても報われにくく、困難が続く運勢です'
  },
  55: {
    number: 55,
    type: '半吉',
    meaning: '善悪',
    description: '善悪並行、外観隆盛の運。表面的には成功しているが、内実は不安定です'
  },
  56: {
    number: 56,
    type: '凶',
    meaning: '浪費',
    description: '浪費散財、薄弱の運。意志が弱く、計画性に欠けて失敗しやすいです'
  },
  57: {
    number: 57,
    type: '大吉',
    meaning: '日照',
    description: '日照春松、徳望の運。温和な人柄で人望があり、晩年まで幸福です'
  },
  58: {
    number: 58,
    type: '半吉',
    meaning: '晩年',
    description: '晩年運上昇、浮沈の運。若い頃は苦労しますが、晩年に運勢が向上します'
  },
  59: {
    number: 59,
    type: '凶',
    meaning: '寒蝉',
    description: '寒蝉悲風、無策の運。計画性がなく、困難に立ち向かう力が不足しています'
  },
  60: {
    number: 60,
    type: '凶',
    meaning: '暗雲',
    description: '暗雲蔽月、無謀の運。判断力に欠け、無謀な行動で失敗しやすいです'
  },
  61: {
    number: 61,
    type: '大吉',
    meaning: '順調',
    description: '順調発達、名誉の運。着実に発展し、社会的地位と名誉を獲得する運勢です'
  },
  62: {
    number: 62,
    type: '凶',
    meaning: '衰弱',
    description: '衰弱気力、内外の患いの運。気力が衰え、内外から困難が押し寄せます'
  },
  63: {
    number: 63,
    type: '大吉',
    meaning: '舟着',
    description: '舟着岸、富貴の運。努力が実を結び、財運と地位に恵まれる幸運な運勢です'
  },
  64: {
    number: 64,
    type: '凶',
    meaning: '非命',
    description: '非命短縮、破滅の運。短命や突然の災いに見舞われやすい危険な運勢です'
  },
  65: {
    number: 65,
    type: '大吉',
    meaning: '富貴',
    description: '富貴長寿、家門栄達の運。財運と長寿に恵まれ、家系も繁栄する運勢です'
  },
  66: {
    number: 66,
    type: '凶',
    meaning: '岩石',
    description: '岩石困難、内外不和の運。困難が山積し、人間関係も円滑ではありません'
  },
  67: {
    number: 67,
    type: '大吉',
    meaning: '通達',
    description: '通達万象、成功の運。あらゆる分野で成功し、社会的に大きな成果を上げます'
  },
  68: {
    number: 68,
    type: '大吉',
    meaning: '智慧',
    description: '智慧明敏、発明の運。優れた智慧と独創性で、新しい分野を開拓します'
  },
  69: {
    number: 69,
    type: '凶',
    meaning: '非業',
    description: '非業短命、薄弱の運。意志が弱く、短命や災難に見舞われやすいです'
  },
  70: {
    number: 70,
    type: '凶',
    meaning: '暗雲',
    description: '暗雲蔽日、衰退の運。運勢が低迷し、事業や家庭が衰退する傾向があります'
  },
  71: {
    number: 71,
    type: '大吉',
    meaning: '石上',
    description: '石上開花、安泰の運。困難を乗り越えて成功し、安定した生活を築きます'
  },
  72: {
    number: 72,
    type: '凶',
    meaning: '労苦',
    description: '労苦無功、先見なしの運。努力しても報われず、将来への見通しが立ちません'
  },
  73: {
    number: 73,
    type: '大吉',
    meaning: '無憂',
    description: '無憂平安、自然の恵みの運。心配事がなく、自然体で幸福な人生を送ります'
  },
  74: {
    number: 74,
    type: '凶',
    meaning: '残菊',
    description: '残菊経霜、逆境の運。晩年に困難に見舞われ、孤独感を味わいやすいです'
  },
  75: {
    number: 75,
    type: '大吉',
    meaning: '退守',
    description: '退守保身、吉凶混合の運。控えめな姿勢で身を守れば、災いを避けられます'
  },
  76: {
    number: 76,
    type: '凶',
    meaning: '破船',
    description: '破船遭難、倒産の運。事業失敗や家庭崩壊など、大きな災いに注意が必要です'
  },
  77: {
    number: 77,
    type: '大吉',
    meaning: '喜悦',
    description: '喜悦歓楽、家族の和の運。家族円満で、喜びに満ちた幸福な人生を送ります'
  },
  78: {
    number: 78,
    type: '凶',
    meaning: '晩苦',
    description: '晩苦功無し、将来性なしの運。晩年に苦労し、努力が報われにくいです'
  },
  79: {
    number: 79,
    type: '凶',
    meaning: '不遇',
    description: '不遇精神、心身衰弱の運。精神的に不安定で、心身ともに衰弱しやすいです'
  },
  80: {
    number: 80,
    type: '凶',
    meaning: '遁世',
    description: '遁世離俗、凶運極みの運。世間から離れ、孤独な人生を歩む傾向があります'
  },
  81: {
    number: 81,
    type: '大吉',
    meaning: '還元',
    description: '還元復始、万物回春の運。新しいスタートを切り、復活・再生の幸運な運勢です'
  }
};

/**
 * 陰陽パターンから詳細解説を取得
 */
export function getYouinExplanation(pattern: string): YouinExplanation | null {
  // パターン分析ロジック
  if (pattern.includes('○○○') || pattern.includes('●●●')) {
    return YOUIN_EXPLANATIONS['同一偏重'];
  } else if (pattern.match(/^(○●)+○?$/) || pattern.match(/^(●○)+●?$/)) {
    return YOUIN_EXPLANATIONS['交互配列'];
  } else if (pattern.startsWith('○')) {
    return YOUIN_EXPLANATIONS['陽始配列'];
  } else if (pattern.startsWith('●')) {
    return YOUIN_EXPLANATIONS['陰始配列'];
  } else {
    return YOUIN_EXPLANATIONS['下蒔き直し'];
  }
}

/**
 * 五行の組み合わせから詳細解説を取得
 */
export function getGogyouExplanation(gogyou1: string, gogyou2: string): GogyouExplanation | null {
  const combination = `${gogyou1}-${gogyou2}`;
  return GOGYOU_EXPLANATIONS[combination] || null;
}

/**
 * 画数から詳細解説を取得
 */
export function getKakusuExplanation(kakusu: number): KakusuExplanation | null {
  const adjustedKakusu = kakusu % 81 || 81;
  return KAKUSU_EXPLANATIONS[adjustedKakusu] || null;
}