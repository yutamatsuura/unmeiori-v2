// TypeScript設定 - 既存システムの九星計算テスト
import Qsei from './kyuuseikigaku-kichihoui/src/js/bans/qseis/Qsei';
import LocalDate from './kyuuseikigaku-kichihoui/src/js/times/LocalDate';

// テストケース
const testCases = [
    { date: '1990-05-15', description: '1990年5月15日' },
    { date: '2000-02-03', description: '2000年2月3日（節入り前）' },
    { date: '2000-02-04', description: '2000年2月4日（節入り当日）' },
    { date: '1985-12-25', description: '1985年12月25日' },
    { date: '2025-01-01', description: '2025年1月1日' }
];

console.log('既存システム九星計算テスト');
console.log('================================');

testCases.forEach((testCase, index) => {
    console.log(`\nテストケース ${index + 1}: ${testCase.description}`);
    console.log('-'.repeat(50));

    try {
        const [year, month, day] = testCase.date.split('-').map(Number);
        const date = LocalDate.of(year, month, day);

        const yearQsei = Qsei.getYear(date);
        const monthQsei = Qsei.getMonth(date);

        console.log(`  年盤: ${yearQsei ? yearQsei.name : 'null'} (${yearQsei ? yearQsei.index : 'null'})`);
        console.log(`  月盤: ${monthQsei ? monthQsei.name : 'null'} (${monthQsei ? monthQsei.index : 'null'})`);
        console.log(`  日盤: 既存システムには実装されていません`);

    } catch (error) {
        console.error(`エラー: ${error.message}`);
    }
});

console.log('\n================================');
console.log('テスト完了');