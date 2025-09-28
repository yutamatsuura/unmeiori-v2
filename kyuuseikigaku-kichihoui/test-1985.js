// 1985年3月10日のテスト用スクリプト
const fs = require('fs');

// comprehensive_qsei_test.jsのクラス定義部分を読み込む
const code = fs.readFileSync('./comprehensive_qsei_test.js', 'utf8');
const classDefEnd = code.indexOf('// ===== 包括的テスト実行 =====');
eval(code.substring(0, classDefEnd));

// 1985年3月10日のテスト
const testDate = LocalDate.of(1985, 3, 10);
const yearQsei = Qsei.getYear(testDate);
const monthQsei = Qsei.getMonth(testDate);
const qseiDate = QseiDate.of(testDate);

console.log('=== 1985年3月10日の九星計算 ===');
console.log('kyuuseikigaku-kichihouiエンジンの結果:');
console.log('本命星:', yearQsei.name, '(' + yearQsei.index + ')');
console.log('月命星:', monthQsei.name, '(' + monthQsei.index + ')');
console.log('九星暦年:', qseiDate.year);
console.log('月索引:', qseiDate.monthIndex);

console.log('\n気学なびの結果:');
console.log('本命星: 六白金星 (6)');
console.log('月命星: 四緑木星 (4)');

console.log('\n一致判定:', yearQsei.index === 6 && monthQsei.index === 4 ? '✅ 完全一致' : '❌ 不一致');

// 計算過程の詳細
console.log('\n=== 計算過程の詳細 ===');
const year = 1985;
const mod = year % 9;
const yearSub = Qsei.getYearSub(year);
console.log(`年: ${year}`);
console.log(`年 % 9 = ${mod}`);
console.log(`getYearSub(${year}) = ${yearSub}`);

// 節入り日の確認
const setu = Setu.enters(1985);
console.log(`\n1985年の立春: ${setu[0].toString()}`);
console.log(`3月10日は立春後なので、九星暦年は1985年として計算`);