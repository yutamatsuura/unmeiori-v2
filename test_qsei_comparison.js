// 九星気学計算の両システム比較テスト

// 既存システムのインポート
const QseiOld = require('./kyuuseikigaku-kichihoui/src/js/bans/qseis/Qsei.ts');
const LocalDateOld = require('./kyuuseikigaku-kichihoui/src/js/times/LocalDate.ts');

// 現在システムのインポート
const QseiNew = require('./services/kyusei-service/src/bans/qseis/Qsei.ts');
const LocalDateNew = require('./services/kyusei-service/src/times/LocalDate.ts');

// テストケース
const testCases = [
    { date: '1990-05-15', description: '1990年5月15日' },
    { date: '2000-02-03', description: '2000年2月3日（節入り前）' },
    { date: '2000-02-04', description: '2000年2月4日（節入り当日）' },
    { date: '1985-12-25', description: '1985年12月25日' },
    { date: '2025-01-01', description: '2025年1月1日' }
];

console.log('九星気学システム計算ロジック比較テスト');
console.log('==========================================');

testCases.forEach((testCase, index) => {
    console.log(`\nテストケース ${index + 1}: ${testCase.description}`);
    console.log('-'.repeat(50));

    try {
        const [year, month, day] = testCase.date.split('-').map(Number);

        // 既存システムでの計算
        const dateOld = LocalDateOld.of(year, month, day);
        const yearQseiOld = QseiOld.getYear(dateOld);
        const monthQseiOld = QseiOld.getMonth(dateOld);

        // 現在システムでの計算
        const dateNew = LocalDateNew.of(year, month, day);
        const yearQseiNew = QseiNew.getYear(dateNew);
        const monthQseiNew = QseiNew.getMonth(dateNew);

        console.log('既存システム:');
        console.log(`  年盤: ${yearQseiOld ? yearQseiOld.name : 'null'} (${yearQseiOld ? yearQseiOld.index : 'null'})`);
        console.log(`  月盤: ${monthQseiOld ? monthQseiOld.name : 'null'} (${monthQseiOld ? monthQseiOld.index : 'null'})`);

        console.log('現在システム:');
        console.log(`  年盤: ${yearQseiNew ? yearQseiNew.name : 'null'} (${yearQseiNew ? yearQseiNew.index : 'null'})`);
        console.log(`  月盤: ${monthQseiNew ? monthQseiNew.name : 'null'} (${monthQseiNew ? monthQseiNew.index : 'null'})`);

        // 日盤（現在システムのみ）
        const dayQseiNew = QseiNew.getDay(dateNew);
        console.log(`  日盤: ${dayQseiNew ? dayQseiNew.name : 'null'} (${dayQseiNew ? dayQseiNew.index : 'null'}) [現在システムのみ]`);

        // 結果比較
        const yearMatch = (yearQseiOld ? yearQseiOld.index : null) === (yearQseiNew ? yearQseiNew.index : null);
        const monthMatch = (monthQseiOld ? monthQseiOld.index : null) === (monthQseiNew ? monthQseiNew.index : null);

        console.log(`\n結果一致: 年盤=${yearMatch ? '✓' : '✗'}, 月盤=${monthMatch ? '✓' : '✗'}`);

        if (!yearMatch || !monthMatch) {
            console.log('⚠️  差異が検出されました');
        }

    } catch (error) {
        console.error(`エラー: ${error.message}`);
    }
});

console.log('\n==========================================');
console.log('テスト完了');