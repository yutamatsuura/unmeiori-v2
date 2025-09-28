// kyuuseikigaku-kichihouiエンジンの計算結果テスト
const fs = require('fs');

// comprehensive_qsei_test.jsから必要なクラスを読み込む
const engineCode = fs.readFileSync('./kyuuseikigaku-kichihoui/comprehensive_qsei_test.js', 'utf8');
eval(engineCode.substring(0, 15000)); // クラス定義部分のみ読み込み

console.log('=== kyuuseikigaku-kichihouiエンジン 計算テスト ===\n');

// テスト日付のセット（気学なびサイトと比較する日付）
const testDates = [
    { date: LocalDate.of(1990, 5, 15), desc: '1990年5月15日' },
    { date: LocalDate.of(1985, 8, 20), desc: '1985年8月20日' },
    { date: LocalDate.of(2000, 3, 10), desc: '2000年3月10日' },
    { date: LocalDate.of(1975, 12, 25), desc: '1975年12月25日' },
    { date: LocalDate.of(2010, 6, 15), desc: '2010年6月15日' }
];

console.log('日付\t\t\t本命星\t\t\t月命星');
console.log('-----------------------------------------------------------');

testDates.forEach(test => {
    const yearQsei = Qsei.getYear(test.date);
    const monthQsei = Qsei.getMonth(test.date);
    const qseiDate = QseiDate.of(test.date);

    console.log(`${test.desc}\t${yearQsei.name}(${yearQsei.index})\t${monthQsei.name}(${monthQsei.index})`);
    console.log(`  九星暦年: ${qseiDate.year}, 月索引: ${qseiDate.monthIndex}`);
});

// 1990年の年盤計算詳細
console.log('\n=== 1990年の計算詳細 ===');
const year1990 = 1990;
const mod = year1990 % 9;
const yearSub = Qsei.getYearSub(year1990);
console.log(`年: ${year1990}`);
console.log(`年 % 9 = ${mod}`);
console.log(`getYearSub(${year1990}) = ${yearSub}`);
console.log(`結果: ${Qsei.of(yearSub).name}(${yearSub})`);

// 節入り日の確認
console.log('\n=== 節入り日の確認 ===');
const setu1990 = Setu.enters(1990);
console.log(`1990年の立春: ${setu1990[0].toString()}`);
console.log(`1990年2月3日: 立春前 → ${Qsei.getYear(LocalDate.of(1990, 2, 3)).name}`);
console.log(`1990年2月4日: 立春 → ${Qsei.getYear(LocalDate.of(1990, 2, 4)).name}`);
console.log(`1990年2月5日: 立春後 → ${Qsei.getYear(LocalDate.of(1990, 2, 5)).name}`);