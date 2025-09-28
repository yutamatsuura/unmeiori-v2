import { TenchiKantei, TenchiJudgmentType } from '../src/kantei/tenchis';
import Seimei from '../src/seimeis/units/Seimei';
import Chara from '../src/seimeis/units/Chara';

describe('TenchiKantei - 天地特殊判定テスト', () => {
    // テスト用のSeimeiオブジェクトを作成するヘルパー関数
    function createTestSeimei(seiKakusus: number[], meiKakusus: number[]): Seimei {
        const seis = seiKakusus.map((kakusu, index) =>
            Chara.of(`姓${index + 1}`, kakusu, `セイ${index + 1}`, false)
        );
        const meis = meiKakusus.map((kakusu, index) =>
            Chara.of(`名${index + 1}`, kakusu, `メイ${index + 1}`, false)
        );
        return new Seimei(seis, meis, []);
    }

    describe('天地同数（偶数）判定', () => {
        test('天格と地格が同じ偶数の場合に該当すること', () => {
            // 天格8画、地格8画のケース
            const seimei = createTestSeimei([4, 4], [8]);
            const kantei = new TenchiKantei(seimei);
            const results = kantei.judge();

            const evenResult = results.results.find(r => r.type === TenchiJudgmentType.DOUSU_EVEN);
            expect(evenResult).toBeDefined();
            expect(evenResult!.applies).toBe(true);
            expect(evenResult!.tenkaku).toBe(8);
            expect(evenResult!.chikaku).toBe(8);
            expect(evenResult!.score).toBeGreaterThan(50);
        });

        test('天格と地格が異なる偶数の場合に該当しないこと', () => {
            // 天格8画、地格6画のケース
            const seimei = createTestSeimei([4, 4], [6]);
            const kantei = new TenchiKantei(seimei);
            const results = kantei.judge();

            const evenResult = results.results.find(r => r.type === TenchiJudgmentType.DOUSU_EVEN);
            expect(evenResult).toBeDefined();
            expect(evenResult!.applies).toBe(false);
        });
    });

    describe('天地同数（奇数）判定', () => {
        test('天格と地格が同じ奇数の場合に該当すること', () => {
            // 天格9画、地格9画のケース
            const seimei = createTestSeimei([4, 5], [9]);
            const kantei = new TenchiKantei(seimei);
            const results = kantei.judge();

            const oddResult = results.results.find(r => r.type === TenchiJudgmentType.DOUSU_ODD);
            expect(oddResult).toBeDefined();
            expect(oddResult!.applies).toBe(true);
            expect(oddResult!.tenkaku).toBe(9);
            expect(oddResult!.chikaku).toBe(9);
        });

        test('奇数同数で苦労数の場合はスコアが低いこと', () => {
            // 天格19画、地格19画のケース（苦労数）
            const seimei = createTestSeimei([10, 9], [19]);
            const kantei = new TenchiKantei(seimei);
            const results = kantei.judge();

            const oddResult = results.results.find(r => r.type === TenchiJudgmentType.DOUSU_ODD);
            expect(oddResult).toBeDefined();
            expect(oddResult!.applies).toBe(true);
            expect(oddResult!.score).toBeLessThan(50);
        });
    });

    describe('天地総同数判定', () => {
        test('天格と地格が等しい場合に該当すること', () => {
            // 天格15画、地格15画のケース
            const seimei = createTestSeimei([7, 8], [15]);
            const kantei = new TenchiKantei(seimei);
            const results = kantei.judge();

            const souDousuResult = results.results.find(r => r.type === TenchiJudgmentType.SOU_DOUSU);
            expect(souDousuResult).toBeDefined();
            expect(souDousuResult!.applies).toBe(true);
            expect(souDousuResult!.score).toBeGreaterThan(70); // 高いスコア
        });
    });

    describe('天地衝突判定', () => {
        test('3画と9画の組み合わせで衝突が検出されること', () => {
            // 天格3画、地格9画のケース
            const seimei = createTestSeimei([3], [9]);
            const kantei = new TenchiKantei(seimei);
            const results = kantei.judge();

            const shoutotsuResult = results.results.find(r => r.type === TenchiJudgmentType.SHOUTOTSU);
            expect(shoutotsuResult).toBeDefined();
            expect(shoutotsuResult!.applies).toBe(true);
            expect(shoutotsuResult!.score).toBeLessThan(50); // 低いスコア
        });

        test('9画と9画の最強凶組み合わせで最低スコアとなること', () => {
            // 天格9画、地格9画のケース
            const seimei = createTestSeimei([9], [9]);
            const kantei = new TenchiKantei(seimei);
            const results = kantei.judge();

            const shoutotsuResult = results.results.find(r => r.type === TenchiJudgmentType.SHOUTOTSU);
            expect(shoutotsuResult).toBeDefined();
            expect(shoutotsuResult!.applies).toBe(true);
            expect(shoutotsuResult!.score).toBeLessThan(10); // 非常に低いスコア
        });

        test('衝突しない組み合わせでは該当しないこと', () => {
            // 天格7画、地格11画のケース
            const seimei = createTestSeimei([7], [11]);
            const kantei = new TenchiKantei(seimei);
            const results = kantei.judge();

            const shoutotsuResult = results.results.find(r => r.type === TenchiJudgmentType.SHOUTOTSU);
            expect(shoutotsuResult).toBeDefined();
            expect(shoutotsuResult!.applies).toBe(false);
        });
    });

    describe('総合結果の判定', () => {
        test('複数の判定が該当する場合の優先度が正しいこと', () => {
            // 天格9画、地格9画のケース（奇数同数+総同数+衝突）
            const seimei = createTestSeimei([9], [9]);
            const kantei = new TenchiKantei(seimei);
            const results = kantei.judge();

            // 天地総同数が最優先されること
            expect(results.primaryResult?.type).toBe(TenchiJudgmentType.SOU_DOUSU);
            expect(results.applicableResults.length).toBeGreaterThan(1);
        });

        test('該当する判定がない場合の総合スコアが中性値であること', () => {
            // 天格7画、地格11画のケース
            const seimei = createTestSeimei([7], [11]);
            const kantei = new TenchiKantei(seimei);
            const results = kantei.judge();

            expect(results.applicableResults.length).toBe(0);
            expect(results.totalScore).toBe(50);
        });
    });

    describe('静的メソッドのテスト', () => {
        test('judgeByKakusuメソッドが正しく動作すること', () => {
            const results = TenchiKantei.judgeByKakusu(8, 8);

            const evenResult = results.results.find(r => r.type === TenchiJudgmentType.DOUSU_EVEN);
            expect(evenResult).toBeDefined();
            expect(evenResult!.applies).toBe(true);
        });

        test('Seimeiオブジェクトからの静的判定が正しく動作すること', () => {
            const seimei = createTestSeimei([4, 4], [8]);
            const results = TenchiKantei.judge(seimei);

            const evenResult = results.results.find(r => r.type === TenchiJudgmentType.DOUSU_EVEN);
            expect(evenResult).toBeDefined();
            expect(evenResult!.applies).toBe(true);
        });
    });

    describe('ユーティリティメソッドのテスト', () => {
        test('getSummaryメソッドが正しい情報を返すこと', () => {
            const seimei = createTestSeimei([4, 4], [8]);
            const kantei = new TenchiKantei(seimei);
            const summary = kantei.getSummary();

            expect(summary.combination).toBe('8-8');
            expect(summary.totalScore).toBeGreaterThan(50);
            expect(summary.primaryType).toBe(TenchiJudgmentType.SOU_DOUSU); // 天地総同数が優先される
            expect(summary.applicableCount).toBeGreaterThan(0);
            expect(summary.description).toContain('総同数');
        });

        test('getDebugInfoメソッドが詳細情報を返すこと', () => {
            const seimei = createTestSeimei([4, 4], [8]);
            const kantei = new TenchiKantei(seimei);
            const debugInfo = kantei.getDebugInfo();

            expect(debugInfo.seimeiName).toContain('姓1姓2 名1');
            expect(debugInfo.tenkaku.kakusu).toBe(8);
            expect(debugInfo.chikaku.kakusu).toBe(8);
            expect(debugInfo.combination).toBe('8-8');
            expect(debugInfo.judgmentResults).toHaveLength(4);
        });
    });

    describe('エラーハンドリング', () => {
        test('無効な画数でもエラーにならないこと', () => {
            expect(() => {
                TenchiKantei.judgeByKakusu(0, 0);
            }).not.toThrow();
        });

        test('負の画数でもエラーにならないこと', () => {
            expect(() => {
                TenchiKantei.judgeByKakusu(-1, -1);
            }).not.toThrow();
        });

        test('大きな画数でもエラーにならないこと', () => {
            expect(() => {
                TenchiKantei.judgeByKakusu(100, 100);
            }).not.toThrow();
        });
    });
});