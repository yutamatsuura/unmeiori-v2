import YouinKantei from "../YouinKantei";
import Seimei from "../../../seimeis/units/Seimei";
import Chara from "../../../seimeis/units/Chara";
import Ngwords from "../../../seimeis/components/Ngwords";

/**
 * YouinKanteiのテストクラス
 * 各陰陽パターンの判定ロジックを検証
 */
describe("YouinKantei", () => {

    /**
     * テスト用の姓名オブジェクトを作成するヘルパー関数
     */
    const createTestSeimei = (seiKakusus: number[], meiKakusus: number[]): Seimei => {
        const seiCharas = seiKakusus.map((kakusu, index) =>
            Chara.of(`姓${index}`, kakusu, "ア", false)
        );

        const meiCharas = meiKakusus.map((kakusu, index) =>
            Chara.of(`名${index}`, kakusu, "ア", false)
        );

        return new Seimei(seiCharas, meiCharas, []);
    };

    describe("陰陽序列の計算", () => {
        test("正しい陰陽序列が生成される", () => {
            // 田中太郎の例: 5(陽), 4(陰), 4(陰), 9(陽)
            const seimei = createTestSeimei([5, 4], [4, 9]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            expect(result.youin_sequence).toBe("陽陰陰陽");
        });

        test("単文字の姓名でも動作する", () => {
            // 単文字の例: 3(陽), 2(陰)
            const seimei = createTestSeimei([3], [2]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            expect(result.youin_sequence).toBe("陽陰");
        });
    });

    describe("縛りパターンの判定", () => {
        test("陽陰陽パターンが検出される", () => {
            // 1(陽), 2(陰), 3(陽)の縛りパターン
            const seimei = createTestSeimei([1, 2], [3]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const shibariPattern = result.patterns.find(p => p.name === "縛り");
            expect(shibariPattern?.detected).toBe(true);
            expect(shibariPattern?.score).toBe(30);
        });

        test("陰陽陰パターンが検出される", () => {
            // 2(陰), 1(陽), 4(陰)の縛りパターン
            const seimei = createTestSeimei([2, 1], [4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const shibariPattern = result.patterns.find(p => p.name === "縛り");
            expect(shibariPattern?.detected).toBe(true);
        });

        test("縛りパターンが検出されない場合", () => {
            // 1(陽), 3(陽), 5(陽) - 縛りなし
            const seimei = createTestSeimei([1, 3], [5]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const shibariPattern = result.patterns.find(p => p.name === "縛り");
            expect(shibariPattern?.detected).toBe(false);
            expect(shibariPattern?.score).toBe(100);
        });
    });

    describe("大挟みパターンの判定", () => {
        test("陽陰陽パターンが検出される", () => {
            // 1(陽), 2(陰), 3(陽) - 大挟みパターン
            const seimei = createTestSeimei([1, 2], [3]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const ohbasamiPattern = result.patterns.find(p => p.name === "大挟み");
            expect(ohbasamiPattern?.detected).toBe(true);
            expect(ohbasamiPattern?.score).toBe(40);
        });

        test("陰陽陰パターンが検出される", () => {
            // 2(陰), 1(陽), 4(陰) - 大挟みパターン
            const seimei = createTestSeimei([2, 1], [4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const ohbasamiPattern = result.patterns.find(p => p.name === "大挟み");
            expect(ohbasamiPattern?.detected).toBe(true);
        });
    });

    describe("二重挟みパターンの判定", () => {
        test("陽陰陰陽パターンが検出される", () => {
            // 1(陽), 2(陰), 4(陰), 3(陽) - 二重挟みパターン
            const seimei = createTestSeimei([1, 2], [4, 3]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const nijuBasamiPattern = result.patterns.find(p => p.name === "二重挟み");
            expect(nijuBasamiPattern?.detected).toBe(true);
            expect(nijuBasamiPattern?.score).toBe(25);
        });

        test("4文字未満では検出されない", () => {
            // 3文字では二重挟み判定されない
            const seimei = createTestSeimei([1, 2], [3]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const nijuBasamiPattern = result.patterns.find(p => p.name === "二重挟み");
            expect(nijuBasamiPattern?.detected).toBe(false);
        });
    });

    describe("中断パターンの判定", () => {
        test("姓全陽・名全陰パターンが検出される", () => {
            // 姓: 1(陽), 3(陽), 名: 2(陰), 4(陰)
            const seimei = createTestSeimei([1, 3], [2, 4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const chudanPattern = result.patterns.find(p => p.name === "中断");
            expect(chudanPattern?.detected).toBe(true);
            expect(chudanPattern?.score).toBe(35);
        });

        test("姓全陰・名全陽パターンが検出される", () => {
            // 姓: 2(陰), 4(陰), 名: 1(陽), 3(陽)
            const seimei = createTestSeimei([2, 4], [1, 3]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const chudanPattern = result.patterns.find(p => p.name === "中断");
            expect(chudanPattern?.detected).toBe(true);
        });

        test("混在の場合は検出されない", () => {
            // 姓: 1(陽), 2(陰), 名: 3(陽), 4(陰) - 混在
            const seimei = createTestSeimei([1, 2], [3, 4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const chudanPattern = result.patterns.find(p => p.name === "中断");
            expect(chudanPattern?.detected).toBe(false);
        });
    });

    describe("善良パターンの判定", () => {
        test("陰陽交互パターンが検出される", () => {
            // 1(陽), 2(陰), 3(陽), 4(陰) - 交互
            const seimei = createTestSeimei([1, 2], [3, 4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const hanInyouPattern = result.patterns.find(p => p.name === "善良");
            expect(hanInyouPattern?.detected).toBe(true);
            expect(hanInyouPattern?.score).toBe(90);
        });

        test("陽陰交互パターンが検出される", () => {
            // 2(陰), 1(陽), 4(陰), 3(陽) - 交互
            const seimei = createTestSeimei([2, 1], [4, 3]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const hanInyouPattern = result.patterns.find(p => p.name === "善良");
            expect(hanInyouPattern?.detected).toBe(true);
        });

        test("交互でない場合は検出されない", () => {
            // 1(陽), 3(陽), 2(陰), 4(陰) - 交互でない
            const seimei = createTestSeimei([1, 3], [2, 4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const hanInyouPattern = result.patterns.find(p => p.name === "善良");
            expect(hanInyouPattern?.detected).toBe(false);
        });
    });

    describe("白片寄りパターンの判定", () => {
        test("陽70%以上で検出される", () => {
            // 1(陽), 3(陽), 5(陽), 2(陰) - 75%が陽
            const seimei = createTestSeimei([1, 3], [5, 2]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const siroKatayoriPattern = result.patterns.find(p => p.name === "白片寄り");
            expect(siroKatayoriPattern?.detected).toBe(true);
            expect(siroKatayoriPattern?.score).toBeLessThan(100);
        });

        test("陽70%未満では検出されない", () => {
            // 1(陽), 2(陰), 3(陽), 4(陰) - 50%が陽
            const seimei = createTestSeimei([1, 2], [3, 4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const siroKatayoriPattern = result.patterns.find(p => p.name === "白片寄り");
            expect(siroKatayoriPattern?.detected).toBe(false);
        });
    });

    describe("黒片寄りパターンの判定", () => {
        test("陰70%以上で検出される", () => {
            // 2(陰), 4(陰), 6(陰), 1(陽) - 75%が陰
            const seimei = createTestSeimei([2, 4], [6, 1]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const kuroKatayoriPattern = result.patterns.find(p => p.name === "黒片寄り");
            expect(kuroKatayoriPattern?.detected).toBe(true);
            expect(kuroKatayoriPattern?.score).toBeLessThan(100);
        });

        test("陰70%未満では検出されない", () => {
            // 1(陽), 2(陰), 3(陽), 4(陰) - 50%が陰
            const seimei = createTestSeimei([1, 2], [3, 4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const kuroKatayoriPattern = result.patterns.find(p => p.name === "黒片寄り");
            expect(kuroKatayoriPattern?.detected).toBe(false);
        });
    });

    describe("上蒔き直しパターンの判定", () => {
        test("前半陽多め・後半陰多めで検出される", () => {
            // 1(陽), 3(陽), 2(陰), 4(陰) - 前半陽100%、後半陰100%
            const seimei = createTestSeimei([1, 3], [2, 4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const ueMakinaoshiPattern = result.patterns.find(p => p.name === "上蒔き直し");
            expect(ueMakinaoshiPattern?.detected).toBe(true);
            expect(ueMakinaoshiPattern?.score).toBe(45);
        });

        test("4文字未満では検出されない", () => {
            // 3文字では上蒔き直し判定されない
            const seimei = createTestSeimei([1, 3], [2]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const ueMakinaoshiPattern = result.patterns.find(p => p.name === "上蒔き直し");
            expect(ueMakinaoshiPattern?.detected).toBe(false);
        });
    });

    describe("下蒔き直しパターンの判定", () => {
        test("前半陰多め・後半陽多めで検出される", () => {
            // 2(陰), 4(陰), 1(陽), 3(陽) - 前半陰100%、後半陽100%
            const seimei = createTestSeimei([2, 4], [1, 3]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const shitaMakinaoshiPattern = result.patterns.find(p => p.name === "下蒔き直し");
            expect(shitaMakinaoshiPattern?.detected).toBe(true);
            expect(shitaMakinaoshiPattern?.score).toBe(75);
        });

        test("4文字未満では検出されない", () => {
            // 3文字では下蒔き直し判定されない
            const seimei = createTestSeimei([2, 4], [1]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const shitaMakinaoshiPattern = result.patterns.find(p => p.name === "下蒔き直し");
            expect(shitaMakinaoshiPattern?.detected).toBe(false);
        });
    });

    describe("総合判定", () => {
        test("全てのパターンが評価される", () => {
            const seimei = createTestSeimei([1, 2], [3, 4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            expect(result.patterns).toHaveLength(9);
            expect(result.overall_score).toBeGreaterThanOrEqual(0);
            expect(result.overall_score).toBeLessThanOrEqual(100);
            expect(result.summary).toBeDefined();
            expect(result.youin_sequence).toBeDefined();
        });

        test("正規化メソッドが正常に動作する", () => {
            const seimei = createTestSeimei([1, 2], [3, 4]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.toNormalize();

            // スコアが0-100の範囲内であることを確認
            expect(result.overall_score).toBeGreaterThanOrEqual(0);
            expect(result.overall_score).toBeLessThanOrEqual(100);

            result.patterns.forEach(pattern => {
                expect(pattern.score).toBeGreaterThanOrEqual(0);
                expect(pattern.score).toBeLessThanOrEqual(100);
            });
        });

        test("複数のパターンが同時に検出される場合", () => {
            // 陽陰陽パターン（縛り + 大挟み）
            const seimei = createTestSeimei([1, 2], [3]);
            const kantei = new YouinKantei(seimei);
            const result = kantei.kantei();

            const detectedPatterns = result.patterns.filter(p => p.detected);
            expect(detectedPatterns.length).toBeGreaterThanOrEqual(1);

            // 縛りと大挟みの両方が検出されることを確認
            const shibariDetected = result.patterns.find(p => p.name === "縛り")?.detected;
            const ohbasamiDetected = result.patterns.find(p => p.name === "大挟み")?.detected;
            expect(shibariDetected).toBe(true);
            expect(ohbasamiDetected).toBe(true);
        });
    });

    describe("エラーハンドリング", () => {
        test("空の姓名でもエラーが発生しない", () => {
            const seimei = createTestSeimei([], []);
            const kantei = new YouinKantei(seimei);

            expect(() => {
                const result = kantei.kantei();
                expect(result).toBeDefined();
            }).not.toThrow();
        });

        test("単文字の姓名でも正常に動作する", () => {
            const seimei = createTestSeimei([5], []);
            const kantei = new YouinKantei(seimei);

            expect(() => {
                const result = kantei.kantei();
                expect(result.youin_sequence).toBe("陽");
            }).not.toThrow();
        });
    });
});