import Seimei from "../../seimeis/units/Seimei";
import YouIn from "../../seimeis/units/YouIn";
import Kaku from "../../seimeis/units/Kaku";

/**
 * 陰陽パターンの判定結果
 */
export interface YouinPattern {
    name: string;
    score: number;
    advice: string;
    detected: boolean;
}

/**
 * 陰陽鑑定結果
 */
export interface YouinKanteiResult {
    patterns: YouinPattern[];
    overall_score: number;
    summary: string;
    youin_sequence: string;
}

/**
 * 姓名判断における陰陽パターン判定クラス
 * 9種類の陰陽パターンを判定し、スコアとアドバイスを提供
 */
export default class YouinKantei {
    private seimei: Seimei;
    private youinSequence: YouIn[];

    constructor(seimei: Seimei) {
        this.seimei = seimei;
        this.youinSequence = this.calculateYouinSequence();
    }

    /**
     * 姓名の各文字の画数から陰陽序列を計算
     */
    private calculateYouinSequence(): YouIn[] {
        const sequence: YouIn[] = [];

        // 姓の文字を処理
        this.seimei.sei.forEach(chara => {
            sequence.push(YouIn.of(chara.kakusu));
        });

        // 名の文字を処理
        this.seimei.mei.forEach(chara => {
            sequence.push(YouIn.of(chara.kakusu));
        });

        return sequence;
    }

    /**
     * 陰陽序列を文字列形式で取得
     */
    private getYouinSequenceString(): string {
        return this.youinSequence.map(youin => youin.you ? '陽' : '陰').join('');
    }

    /**
     * 全ての陰陽パターンを判定
     */
    public kantei(): YouinKanteiResult {
        const patterns: YouinPattern[] = [
            this.detectShibari(),
            this.detectOhbasami(),
            this.detectNijuBasami(),
            this.detectChudan(),
            this.detectHanInyou(),
            this.detectSiroKatayori(),
            this.detectKuroKatayori(),
            this.detectUeMakinaoshi(),
            this.detectShitaMakinaoshi()
        ];

        const overallScore = this.calculateOverallScore(patterns);
        const summary = this.generateSummary(patterns, overallScore);

        return {
            patterns,
            overall_score: overallScore,
            summary,
            youin_sequence: this.getYouinSequenceString()
        };
    }

    /**
     * 1. 縛り（Shibari）パターンの判定
     * 陽陰陽、陰陽陰などの特定パターン
     */
    private detectShibari(): YouinPattern {
        let score = 100;
        let detected = false;

        // 3文字以上の場合のみ判定
        if (this.youinSequence.length >= 3) {
            for (let i = 0; i <= this.youinSequence.length - 3; i++) {
                const first = this.youinSequence[i];
                const second = this.youinSequence[i + 1];
                const third = this.youinSequence[i + 2];

                // 陽陰陽 または 陰陽陰パターン
                if ((first.you && !second.you && third.you) ||
                    (!first.you && second.you && !third.you)) {
                    detected = true;
                    score = 30; // 縛りは良くないパターン
                    break;
                }
            }
        }

        return {
            name: "縛り",
            score,
            advice: detected ?
                "陰陽の縛りパターンが見られます。柔軟性を意識し、固定観念に囚われないよう心がけましょう。" :
                "縛りパターンは見られません。自由な発想を大切にしてください。",
            detected
        };
    }

    /**
     * 2. 大挟み（Ohbasami）パターンの判定
     * 同じ陰陽で挟まれるパターン
     */
    private detectOhbasami(): YouinPattern {
        let score = 100;
        let detected = false;

        if (this.youinSequence.length >= 3) {
            for (let i = 0; i <= this.youinSequence.length - 3; i++) {
                const first = this.youinSequence[i];
                const second = this.youinSequence[i + 1];
                const third = this.youinSequence[i + 2];

                // 同じ陰陽で挟まれるパターン
                if (first.you === third.you && first.you !== second.you) {
                    detected = true;
                    score = 40; // やや良くないパターン
                    break;
                }
            }
        }

        return {
            name: "大挟み",
            score,
            advice: detected ?
                "大挟みパターンが見られます。周囲との調和を大切にし、バランスを保つことを心がけましょう。" :
                "大挟みパターンは見られません。良好なバランスを保ってください。",
            detected
        };
    }

    /**
     * 3. 二重挟み（NijuBasami）パターンの判定
     * 陰が陽に二重に挟まれるパターン
     */
    private detectNijuBasami(): YouinPattern {
        let score = 100;
        let detected = false;

        if (this.youinSequence.length >= 4) {
            for (let i = 0; i <= this.youinSequence.length - 4; i++) {
                const youinSlice = this.youinSequence.slice(i, i + 4);

                // 陽陰陰陽パターン
                if (youinSlice[0].you && !youinSlice[1].you &&
                    !youinSlice[2].you && youinSlice[3].you) {
                    detected = true;
                    score = 25; // 非常に良くないパターン
                    break;
                }
            }
        }

        return {
            name: "二重挟み",
            score,
            advice: detected ?
                "二重挟みパターンが見られます。困難な状況でも諦めず、継続的な努力で道を切り開きましょう。" :
                "二重挟みパターンは見られません。安定した運勢が期待できます。",
            detected
        };
    }

    /**
     * 4. 中断（Chudan）パターンの判定
     * 姓が全陽、名が全陰（または逆）
     */
    private detectChudan(): YouinPattern {
        let score = 100;
        let detected = false;

        const seiLength = this.seimei.sei.length;
        const seiYouins = this.youinSequence.slice(0, seiLength);
        const meiYouins = this.youinSequence.slice(seiLength);

        // 姓が全陽で名が全陰
        const seiAllYou = seiYouins.every(youin => youin.you);
        const meiAllIn = meiYouins.every(youin => !youin.you);

        // 姓が全陰で名が全陽
        const seiAllIn = seiYouins.every(youin => !youin.you);
        const meiAllYou = meiYouins.every(youin => youin.you);

        if ((seiAllYou && meiAllIn) || (seiAllIn && meiAllYou)) {
            detected = true;
            score = 35; // 良くないパターン
        }

        return {
            name: "中断",
            score,
            advice: detected ?
                "中断パターンが見られます。人生の前半と後半で大きな変化があるかもしれません。変化を恐れず、適応力を養いましょう。" :
                "中断パターンは見られません。安定した人生の流れが期待できます。",
            detected
        };
    }

    /**
     * 5. 善良（HanInyou）パターンの判定
     * 陰陽交互のバランス良好パターン
     */
    private detectHanInyou(): YouinPattern {
        let score = 50;
        let detected = false;

        // 陰陽が交互に現れるかチェック
        let alternating = true;
        for (let i = 1; i < this.youinSequence.length; i++) {
            if (this.youinSequence[i].you === this.youinSequence[i - 1].you) {
                alternating = false;
                break;
            }
        }

        if (alternating && this.youinSequence.length >= 2) {
            detected = true;
            score = 90; // 非常に良いパターン
        }

        return {
            name: "善良",
            score,
            advice: detected ?
                "善良パターンが見られます。陰陽のバランスが非常に良好で、調和のとれた人生が期待できます。" :
                "より良いバランスを目指し、陰陽の調和を意識してみましょう。",
            detected
        };
    }

    /**
     * 6. 白片寄り（Siro Katayori）パターンの判定
     * 陽偏重パターン
     */
    private detectSiroKatayori(): YouinPattern {
        const youCount = this.youinSequence.filter(youin => youin.you).length;
        const youRatio = youCount / this.youinSequence.length;

        const detected = youRatio >= 0.7; // 70%以上が陽
        const score = detected ? Math.max(20, 100 - (youRatio - 0.5) * 160) : 100;

        return {
            name: "白片寄り",
            score,
            advice: detected ?
                "陽の気が強すぎる傾向があります。時には静寂を大切にし、内省の時間を持つことが重要です。" :
                "陽の気のバランスは良好です。積極性を活かしつつ、調和も大切にしましょう。",
            detected
        };
    }

    /**
     * 7. 黒片寄り（Kuro Katayori）パターンの判定
     * 陰偏重パターン
     */
    private detectKuroKatayori(): YouinPattern {
        const inCount = this.youinSequence.filter(youin => !youin.you).length;
        const inRatio = inCount / this.youinSequence.length;

        const detected = inRatio >= 0.7; // 70%以上が陰
        const score = detected ? Math.max(20, 100 - (inRatio - 0.5) * 160) : 100;

        return {
            name: "黒片寄り",
            score,
            advice: detected ?
                "陰の気が強すぎる傾向があります。もう少し積極性を発揮し、行動力を高めることが大切です。" :
                "陰の気のバランスは良好です。慎重さを活かしつつ、行動力も意識しましょう。",
            detected
        };
    }

    /**
     * 8. 上蒔き直し（Ue Makinaoshi）パターンの判定
     * 陽多く後半陰パターン
     */
    private detectUeMakinaoshi(): YouinPattern {
        let score = 100;
        let detected = false;

        if (this.youinSequence.length >= 4) {
            const halfIndex = Math.floor(this.youinSequence.length / 2);
            const firstHalf = this.youinSequence.slice(0, halfIndex);
            const secondHalf = this.youinSequence.slice(halfIndex);

            const firstHalfYouRatio = firstHalf.filter(y => y.you).length / firstHalf.length;
            const secondHalfInRatio = secondHalf.filter(y => !y.you).length / secondHalf.length;

            if (firstHalfYouRatio >= 0.6 && secondHalfInRatio >= 0.6) {
                detected = true;
                score = 45; // やや良くないパターン
            }
        }

        return {
            name: "上蒔き直し",
            score,
            advice: detected ?
                "人生の前半は活発でも、後半は内向的になる傾向があります。持続的な活力の維持を心がけましょう。" :
                "人生全体を通じてバランスの良い活動が期待できます。",
            detected
        };
    }

    /**
     * 9. 下蒔き直し（Shita Makinaoshi）パターンの判定
     * 陰多く後半陽パターン
     */
    private detectShitaMakinaoshi(): YouinPattern {
        let score = 100;
        let detected = false;

        if (this.youinSequence.length >= 4) {
            const halfIndex = Math.floor(this.youinSequence.length / 2);
            const firstHalf = this.youinSequence.slice(0, halfIndex);
            const secondHalf = this.youinSequence.slice(halfIndex);

            const firstHalfInRatio = firstHalf.filter(y => !y.you).length / firstHalf.length;
            const secondHalfYouRatio = secondHalf.filter(y => y.you).length / secondHalf.length;

            if (firstHalfInRatio >= 0.6 && secondHalfYouRatio >= 0.6) {
                detected = true;
                score = 75; // 比較的良いパターン（後半上昇）
            }
        }

        return {
            name: "下蒔き直し",
            score,
            advice: detected ?
                "人生の前半は控えめでも、後半に大きく飛躍する可能性があります。諦めずに努力を続けましょう。" :
                "安定した人生の歩みが期待できます。継続的な成長を目指しましょう。",
            detected
        };
    }

    /**
     * 全体スコアを計算
     */
    private calculateOverallScore(patterns: YouinPattern[]): number {
        const detectedPatterns = patterns.filter(p => p.detected);

        if (detectedPatterns.length === 0) {
            return 80; // デフォルトスコア
        }

        // 検出されたパターンの重み付き平均
        const totalScore = detectedPatterns.reduce((sum, pattern) => sum + pattern.score, 0);
        return Math.round(totalScore / detectedPatterns.length);
    }

    /**
     * 総合的な判定結果のサマリーを生成
     */
    private generateSummary(patterns: YouinPattern[], overallScore: number): string {
        const detectedPatterns = patterns.filter(p => p.detected);

        let summary = `陰陽鑑定結果（総合スコア: ${overallScore}点）\n\n`;

        if (overallScore >= 80) {
            summary += "非常に良好な陰陽バランスです。";
        } else if (overallScore >= 60) {
            summary += "概ね良好な陰陽バランスです。";
        } else if (overallScore >= 40) {
            summary += "注意が必要な陰陽パターンが見られます。";
        } else {
            summary += "改善が必要な陰陽パターンが見られます。";
        }

        if (detectedPatterns.length > 0) {
            summary += `\n\n検出されたパターン: ${detectedPatterns.map(p => p.name).join('、')}`;
        }

        return summary;
    }

    /**
     * 陰陽序列を正規化（必要に応じて調整）
     */
    public toNormalize(): YouinKanteiResult {
        // 基本的な正規化処理
        const result = this.kantei();

        // スコアの正規化（0-100の範囲に収める）
        result.patterns.forEach(pattern => {
            pattern.score = Math.max(0, Math.min(100, pattern.score));
        });

        result.overall_score = Math.max(0, Math.min(100, result.overall_score));

        return result;
    }
}