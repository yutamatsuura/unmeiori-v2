import YouinKantei from "./YouinKantei";
import Seimei from "../../seimeis/units/Seimei";
import Chara from "../../seimeis/units/Chara";

/**
 * YouinKanteiの使用例とデモンストレーション
 */
export class YouinKanteiExample {

    /**
     * 実際の名前を使った使用例
     */
    public static demonstrateUsage(): void {
        console.log("=== 陰陽鑑定システム デモンストレーション ===\n");

        // 例1: 田中太郎（縛りパターン）
        const example1 = this.createExample("田中太郎", [5, 4], [4, 9]);
        this.printKanteiResult("田中太郎", example1);

        // 例2: 佐藤花子（善良パターン）
        const example2 = this.createExample("佐藤花子", [7, 10], [7, 3]);
        this.printKanteiResult("佐藤花子", example2);

        // 例3: 山田一郎（中断パターン）
        const example3 = this.createExample("山田一郎", [3, 5], [1, 9]);
        this.printKanteiResult("山田一郎", example3);

        // 例4: 鈴木美香（上蒔き直しパターン）
        const example4 = this.createExample("鈴木美香", [13, 11], [9, 10]);
        this.printKanteiResult("鈴木美香", example4);
    }

    /**
     * テスト用の姓名オブジェクトを作成
     */
    private static createExample(name: string, seiKakusus: number[], meiKakusus: number[]): YouinKantei {
        const seiCharas = seiKakusus.map((kakusu, index) =>
            Chara.of(name.charAt(index), kakusu, "ア", false)
        );

        const nameStartIndex = seiKakusus.length;
        const meiCharas = meiKakusus.map((kakusu, index) =>
            Chara.of(name.charAt(nameStartIndex + index), kakusu, "ア", false)
        );

        const seimei = new Seimei(seiCharas, meiCharas, []);
        return new YouinKantei(seimei);
    }

    /**
     * 鑑定結果を見やすく出力
     */
    private static printKanteiResult(name: string, kantei: YouinKantei): void {
        const result = kantei.toNormalize();

        console.log(`【${name}】の陰陽鑑定結果`);
        console.log(`陰陽序列: ${result.youin_sequence}`);
        console.log(`総合スコア: ${result.overall_score}点`);
        console.log(`\n検出されたパターン:`);

        const detectedPatterns = result.patterns.filter(p => p.detected);
        if (detectedPatterns.length === 0) {
            console.log("  特に問題となるパターンは検出されませんでした。");
        } else {
            detectedPatterns.forEach(pattern => {
                console.log(`  ◆ ${pattern.name} (${pattern.score}点)`);
                console.log(`    ${pattern.advice}`);
            });
        }

        console.log(`\n${result.summary}`);
        console.log("\n" + "=".repeat(50) + "\n");
    }

    /**
     * 各パターンの詳細説明を表示
     */
    public static explainPatterns(): void {
        console.log("=== 陰陽パターンの説明 ===\n");

        const explanations = [
            {
                name: "縛り",
                description: "陽陰陽、陰陽陰などの特定パターン。柔軟性に欠ける傾向。"
            },
            {
                name: "大挟み",
                description: "同じ陰陽で挟まれるパターン。調和を意識することが重要。"
            },
            {
                name: "二重挟み",
                description: "陰が陽に二重に挟まれるパターン。困難を乗り越える力が試される。"
            },
            {
                name: "中断",
                description: "姓が全陽で名が全陰（または逆）。人生の大きな変化を暗示。"
            },
            {
                name: "善良",
                description: "陰陽交互のバランス良好パターン。非常に良い運勢。"
            },
            {
                name: "白片寄り",
                description: "陽偏重パターン。積極性過多、静寂の時間も大切。"
            },
            {
                name: "黒片寄り",
                description: "陰偏重パターン。慎重さ過多、行動力を高める必要。"
            },
            {
                name: "上蒔き直し",
                description: "前半陽多く後半陰。若い頃活発、年齢と共に内向的。"
            },
            {
                name: "下蒔き直し",
                description: "前半陰多く後半陽。後半に大きく飛躍する可能性。"
            }
        ];

        explanations.forEach(exp => {
            console.log(`◆ ${exp.name}`);
            console.log(`  ${exp.description}\n`);
        });
    }

    /**
     * APIレスポンス形式でのサンプル出力
     */
    public static generateApiSample(): object {
        const seimei = this.createExample("田中太郎", [5, 4], [4, 9]);
        const result = seimei.toNormalize();

        return {
            success: true,
            data: {
                name: "田中太郎",
                youin_kantei: result
            },
            timestamp: new Date().toISOString()
        };
    }
}

// デモンストレーションの実行（このファイルが直接実行された場合）
if (require.main === module) {
    YouinKanteiExample.demonstrateUsage();
    YouinKanteiExample.explainPatterns();

    console.log("=== API サンプル出力 ===");
    console.log(JSON.stringify(YouinKanteiExample.generateApiSample(), null, 2));
}