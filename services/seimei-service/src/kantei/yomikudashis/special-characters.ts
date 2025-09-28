/**
 * 読み下し判定用特殊文字マスターデータ
 * 16種類の読み下し判定で使用される文字リスト
 */

/**
 * 分離系文字（読み下し判定で問題となる文字）
 */
export const BUNRI_CHARACTERS = [
  // 基本分離文字
  '一', '十', '二', '三', '四', '五', '六', '七', '八', '九',
  // 山偏・立偏など分離しやすい字
  '山', '川', '木', '土', '大', '小', '上', '下', '中', '工',
  '口', '田', '白', '目', '石', '立', '王', '人', '入', '刀'
];

/**
 * 動物の字
 */
export const ANIMAL_CHARACTERS = [
  // 四足動物
  '虎', '豹', '狼', '猿', '猪', '熊', '馬', '牛', '羊', '鹿',
  '犬', '猫', '狐', '兎', '鼠', '象', '獅', '豚', '馬', '驢',
  // 虫類
  '虫', '蛇', '蛙', '蜂', '蝶', '蟻'
];

/**
 * 魚の字
 */
export const FISH_CHARACTERS = [
  '魚', '鯉', '鮭', '鱈', '鯖', '鰯', '鮪', '鰻', '鯨', '鮫',
  '蛸', '烏賊', '海老', '蟹', '貝', '鯛', '鰤', '鰺', '鰹', '鮃'
];

/**
 * 植物の字
 */
export const PLANT_CHARACTERS = [
  // 花
  '桜', '梅', '菊', '薔薇', '牡丹', '蓮', '菖蒲', '椿', '藤', '百合',
  // 樹木
  '松', '杉', '竹', '柳', '楓', '桐', '椎', '樫', '檜', '榎',
  // 草花
  '草', '花', '葉', '茎', '根', '実', '種', '芽', '蔦', '苔'
];

/**
 * 鉱物の字
 */
export const MINERAL_CHARACTERS = [
  // 金属
  '金', '銀', '銅', '鉄', '鉛', '錫', '鋼', '鋳', '鍛', '錬',
  // 宝石
  '玉', '珠', '宝', '石', '岩', '鉱', '鑛', '銭', '貨', '財'
];

/**
 * 天佑の字（天の助けを表す文字）
 */
export const TENYUU_CHARACTERS = [
  '天', '佑', '助', '援', '護', '守', '保', '救', '恵', '慈',
  '恩', '徳', '仁', '義', '礼', '智', '信', '聖', '賢', '善'
];

/**
 * 幸福すぎる字
 */
export const OVERLY_HAPPY_CHARACTERS = [
  '幸', '福', '喜', '楽', '歓', '悦', '嬉', '慶', '祝', '賀',
  '豊', '富', '栄', '華', '盛', '隆', '昌', '繁', '栄', '満'
];

/**
 * 尊貴すぎる字
 */
export const OVERLY_NOBLE_CHARACTERS = [
  '王', '皇', '帝', '君', '公', '侯', '伯', '子', '男', '爵',
  '殿', '様', '尊', '貴', '高', '上', '優', '秀', '超', '極'
];

/**
 * 品格を損なう字
 */
export const VULGAR_CHARACTERS = [
  // 身体に関する俗語的表現
  '肉', '血', '骨', '糞', '尿', '汗', '涙', '鼻', '耳', '口',
  // 下品な意味を持つ字
  '俗', '卑', '下', '低', '劣', '悪', '醜', '汚', '穢', '臭'
];

/**
 * 十干十二支の字
 */
export const JIKKAN_JUNISHI_CHARACTERS = [
  // 十干
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
  // 十二支
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
];

/**
 * 軽蔑の字
 */
export const CONTEMPTUOUS_CHARACTERS = [
  '侮', '蔑', '軽', '薄', '浅', '愚', '馬鹿', '阿呆', '間抜', '鈍',
  '劣', 'inferior', '拙', '稚', '幼', '嘲', '笑', '馬', '鹿', '呆'
];

/**
 * 気候の字
 */
export const WEATHER_CHARACTERS = [
  // 天候
  '雨', '雪', '風', '雲', '霧', '霜', '雹', '雷', '嵐', '台風',
  // 季節
  '春', '夏', '秋', '冬', '寒', '暑', '涼', '温', '湿', '乾'
];

/**
 * 性別不明の字（男女どちらにも使える字）
 */
export const GENDER_NEUTRAL_CHARACTERS = [
  // 自然
  '海', '空', '星', '月', '陽', '光', '翼', '風', '雲', '波',
  // 抽象概念
  '心', '愛', '希', '夢', '想', '思', '念', '志', '意', '情',
  // 色彩
  '青', '緑', '紫', '茶', '灰', '銀', '金', '黒', '白', '赤'
];

/**
 * 読み下し判定の種類
 */
export enum YomikudashiType {
  BUNRI_NAME = 'bunri_name',           // 分離名判定
  SINGLE_CHARACTER = 'single_character', // 一文字名判定
  CHIKAKU_9_19 = 'chikaku_9_19',      // 地格9画・19画判定
  JINKAKU_9_19 = 'jinkaku_9_19',      // 人格9画・19画判定
  ANIMAL_CHARACTER = 'animal_character', // 動物の字判定
  FISH_CHARACTER = 'fish_character',    // 魚の字判定
  PLANT_CHARACTER = 'plant_character',  // 植物の字判定
  MINERAL_CHARACTER = 'mineral_character', // 鉱物の字判定
  TENYUU_CHARACTER = 'tenyuu_character', // 天佑の字判定
  OVERLY_HAPPY = 'overly_happy',        // 幸福すぎる字判定
  OVERLY_NOBLE = 'overly_noble',        // 尊貴すぎる字判定
  VULGAR_CHARACTER = 'vulgar_character', // 品格を損なう字判定
  JIKKAN_JUNISHI = 'jikkan_junishi',    // 十干十二支の字判定
  CONTEMPTUOUS = 'contemptuous',        // 軽蔑の字判定
  WEATHER_CHARACTER = 'weather_character', // 気候の字判定
  GENDER_NEUTRAL = 'gender_neutral'     // 性別不明の字判定
}

/**
 * 判定の重要度レベル
 */
export enum SeverityLevel {
  CRITICAL = 'critical',  // 重大（80-100点減点）
  HIGH = 'high',          // 高（60-79点減点）
  MEDIUM = 'medium',      // 中（40-59点減点）
  LOW = 'low'             // 低（20-39点減点）
}

/**
 * 各判定の重要度設定
 */
export const YOMIKUDASHI_SEVERITY: Record<YomikudashiType, SeverityLevel> = {
  [YomikudashiType.BUNRI_NAME]: SeverityLevel.CRITICAL,
  [YomikudashiType.SINGLE_CHARACTER]: SeverityLevel.HIGH,
  [YomikudashiType.CHIKAKU_9_19]: SeverityLevel.HIGH,
  [YomikudashiType.JINKAKU_9_19]: SeverityLevel.HIGH,
  [YomikudashiType.ANIMAL_CHARACTER]: SeverityLevel.MEDIUM,
  [YomikudashiType.FISH_CHARACTER]: SeverityLevel.MEDIUM,
  [YomikudashiType.PLANT_CHARACTER]: SeverityLevel.LOW,
  [YomikudashiType.MINERAL_CHARACTER]: SeverityLevel.MEDIUM,
  [YomikudashiType.TENYUU_CHARACTER]: SeverityLevel.MEDIUM,
  [YomikudashiType.OVERLY_HAPPY]: SeverityLevel.MEDIUM,
  [YomikudashiType.OVERLY_NOBLE]: SeverityLevel.MEDIUM,
  [YomikudashiType.VULGAR_CHARACTER]: SeverityLevel.HIGH,
  [YomikudashiType.JIKKAN_JUNISHI]: SeverityLevel.MEDIUM,
  [YomikudashiType.CONTEMPTUOUS]: SeverityLevel.HIGH,
  [YomikudashiType.WEATHER_CHARACTER]: SeverityLevel.LOW,
  [YomikudashiType.GENDER_NEUTRAL]: SeverityLevel.LOW
};

/**
 * 文字マスターデータのマッピング
 */
export const CHARACTER_SETS: Record<YomikudashiType, string[]> = {
  [YomikudashiType.BUNRI_NAME]: BUNRI_CHARACTERS,
  [YomikudashiType.SINGLE_CHARACTER]: [], // 特別処理
  [YomikudashiType.CHIKAKU_9_19]: [], // 画数による判定
  [YomikudashiType.JINKAKU_9_19]: [], // 画数による判定
  [YomikudashiType.ANIMAL_CHARACTER]: ANIMAL_CHARACTERS,
  [YomikudashiType.FISH_CHARACTER]: FISH_CHARACTERS,
  [YomikudashiType.PLANT_CHARACTER]: PLANT_CHARACTERS,
  [YomikudashiType.MINERAL_CHARACTER]: MINERAL_CHARACTERS,
  [YomikudashiType.TENYUU_CHARACTER]: TENYUU_CHARACTERS,
  [YomikudashiType.OVERLY_HAPPY]: OVERLY_HAPPY_CHARACTERS,
  [YomikudashiType.OVERLY_NOBLE]: OVERLY_NOBLE_CHARACTERS,
  [YomikudashiType.VULGAR_CHARACTER]: VULGAR_CHARACTERS,
  [YomikudashiType.JIKKAN_JUNISHI]: JIKKAN_JUNISHI_CHARACTERS,
  [YomikudashiType.CONTEMPTUOUS]: CONTEMPTUOUS_CHARACTERS,
  [YomikudashiType.WEATHER_CHARACTER]: WEATHER_CHARACTERS,
  [YomikudashiType.GENDER_NEUTRAL]: GENDER_NEUTRAL_CHARACTERS
};