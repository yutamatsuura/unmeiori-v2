/**
 * 五行詳細判定システム
 *
 * 25通りの五行組み合わせを判定し、相生・相克・比和関係を分析
 * 人格五行、地格五行、内的五行バランスを総合的に評価
 */

import {
  Gogyou,
  GogyouRelation,
  getGogyouFromStrokeCount,
  getGogyouRelation,
  GOGYOU_RELATION_DESCRIPTIONS,
  GOGYOU_CHARACTERISTICS
} from './gogyou-relations';

import {
  GogyouKanteiInput,
  GogyouKanteiResult,
  GogyouRelationResult,
  InternalGogyouBalance
} from './types';

export class GogyouKantei {
  /**
   * 五行詳細判定を実行
   */
  public static performKantei(input: GogyouKanteiInput): GogyouKanteiResult {
    const kantei = new GogyouKantei();
    return kantei.analyze(input);
  }

  /**
   * 詳細分析を実行
   */
  private analyze(input: GogyouKanteiInput): GogyouKanteiResult {
    // 1. 人格五行判定（姓の最後の文字＋名の最初の文字）
    const jinkaku = this.calculateJinkaku(input);

    // 2. 地格五行判定（名の文字同士）
    const chikaku = this.calculateChikaku(input);

    // 3. 人格と地格の関係判定
    const jinkakuChikakuRelation = this.analyzeGogyouRelation(
      jinkaku.gogyou,
      chikaku.gogyou,
      'jinkaku-chikaku'
    );

    // 4. 内的五行バランス判定
    const internalBalance = this.analyzeInternalBalance(input);

    // 5. 総合評価算出
    const totalScore = this.calculateTotalScore(
      jinkakuChikakuRelation,
      internalBalance
    );

    const totalEvaluation = this.getEvaluationLevel(totalScore);
    const advice = this.generateAdvice(
      jinkakuChikakuRelation,
      internalBalance,
      totalEvaluation
    );

    return {
      jinkaku,
      chikaku,
      jinkakuChikakuRelation,
      internalBalance,
      totalScore,
      totalEvaluation,
      advice
    };
  }

  /**
   * 人格五行を計算（姓の最後の文字＋名の最初の文字の画数）
   */
  private calculateJinkaku(input: GogyouKanteiInput): {
    gogyou: Gogyou;
    strokeCount: number;
    description: string;
  } {
    const seiLastChar = input.seiCharacters[input.seiCharacters.length - 1];
    const meiFirstChar = input.meiCharacters[0];

    const strokeCount = seiLastChar.strokeCount + meiFirstChar.strokeCount;
    const gogyou = getGogyouFromStrokeCount(strokeCount);

    const description = `人格（${seiLastChar.char}${meiFirstChar.char}）：${strokeCount}画 → ${gogyou}`;

    return {
      gogyou,
      strokeCount,
      description
    };
  }

  /**
   * 地格五行を計算（名の文字同士の画数合計）
   */
  private calculateChikaku(input: GogyouKanteiInput): {
    gogyou: Gogyou;
    strokeCount: number;
    description: string;
  } {
    const strokeCount = input.meiCharacters.reduce(
      (sum, char) => sum + char.strokeCount,
      0
    );
    const gogyou = getGogyouFromStrokeCount(strokeCount);

    const meiChars = input.meiCharacters.map(c => c.char).join('');
    const description = `地格（${meiChars}）：${strokeCount}画 → ${gogyou}`;

    return {
      gogyou,
      strokeCount,
      description
    };
  }

  /**
   * 二つの五行の関係を詳細分析
   */
  private analyzeGogyouRelation(
    gogyou1: Gogyou,
    gogyou2: Gogyou,
    context: string
  ): GogyouRelationResult {
    const relation = getGogyouRelation(gogyou1, gogyou2);
    const score = this.calculateRelationScore(relation);
    const impact = this.determineImpact(relation, gogyou1, gogyou2);
    const description = this.generateRelationDescription(
      gogyou1,
      gogyou2,
      relation,
      context
    );

    return {
      gogyou1,
      gogyou2,
      relation,
      score,
      description,
      impact
    };
  }

  /**
   * 関係性のスコアを計算
   */
  private calculateRelationScore(relation: GogyouRelation): number {
    switch (relation) {
      case GogyouRelation.相生:
        return 85; // 良好な関係
      case GogyouRelation.比和:
        return 75; // 安定した関係
      case GogyouRelation.相克:
        return 60; // 試練もあるが成長につながる
      default:
        return 50;
    }
  }

  /**
   * 影響の強さを判定
   */
  private determineImpact(
    relation: GogyouRelation,
    gogyou1: Gogyou,
    gogyou2: Gogyou
  ): 'strong' | 'moderate' | 'weak' {
    if (relation === GogyouRelation.比和) {
      return 'moderate'; // 比和は安定だが変化は少ない
    }

    // 相生・相克関係では五行の組み合わせによって影響度が変わる
    const strongCombinations = [
      [Gogyou.火, Gogyou.金], // 火克金（強い関係）
      [Gogyou.水, Gogyou.火], // 水克火（強い関係）
      [Gogyou.木, Gogyou.土], // 木克土（強い関係）
    ];

    const isStrongCombination = strongCombinations.some(
      ([g1, g2]) =>
        (gogyou1 === g1 && gogyou2 === g2) ||
        (gogyou1 === g2 && gogyou2 === g1)
    );

    return isStrongCombination ? 'strong' : 'moderate';
  }

  /**
   * 関係性の詳細説明を生成
   */
  private generateRelationDescription(
    gogyou1: Gogyou,
    gogyou2: Gogyou,
    relation: GogyouRelation,
    context: string
  ): string {
    const relationInfo = GOGYOU_RELATION_DESCRIPTIONS[relation];
    const char1Info = GOGYOU_CHARACTERISTICS[gogyou1];
    const char2Info = GOGYOU_CHARACTERISTICS[gogyou2];

    let description = `${gogyou1}と${gogyou2}の${relationInfo.title}。`;
    description += relationInfo.description;
    description += relationInfo.effect;

    if (relation === GogyouRelation.相生) {
      description += `${gogyou1}の${char1Info.nature}が${gogyou2}の${char2Info.nature}を促進し、`;
      description += '相互に高め合う良好な関係です。';
    } else if (relation === GogyouRelation.相克) {
      description += `${gogyou1}と${gogyou2}が対立する関係ですが、`;
      description += 'この緊張感がバランスと成長をもたらします。';
    } else {
      description += `${gogyou1}の安定した性質が一貫性を保ち、`;
      description += '穏やかで持続的な発展を期待できます。';
    }

    return description;
  }

  /**
   * 内的五行バランスを分析
   */
  private analyzeInternalBalance(input: GogyouKanteiInput): InternalGogyouBalance {
    // 全ての文字の五行を収集
    const allGogyous = new Set<Gogyou>();

    // 姓の文字の五行
    input.seiCharacters.forEach(char => {
      const gogyou = getGogyouFromStrokeCount(char.strokeCount);
      allGogyous.add(gogyou);
    });

    // 名の文字の五行
    input.meiCharacters.forEach(char => {
      const gogyou = getGogyouFromStrokeCount(char.strokeCount);
      allGogyous.add(gogyou);
    });

    const gogyouTypes = Array.from(allGogyous);
    const typeCount = gogyouTypes.length;

    // バランススコアを計算
    const balanceScore = this.calculateBalanceScore(typeCount);
    const evaluation = this.getEvaluationLevel(balanceScore);
    const description = this.generateBalanceDescription(typeCount, gogyouTypes);

    return {
      gogyouTypes,
      typeCount,
      balanceScore,
      evaluation,
      description
    };
  }

  /**
   * バランススコアを計算
   */
  private calculateBalanceScore(typeCount: number): number {
    switch (typeCount) {
      case 5:
        return 100; // 全ての五行が揃っている
      case 4:
        return 90;  // 4種類の五行
      case 3:
        return 80;  // 3種類の五行（良好）
      case 2:
        return 65;  // 2種類の五行（普通）
      case 1:
        return 40;  // 1種類のみ（偏り）
      default:
        return 50;
    }
  }

  /**
   * バランスの詳細説明を生成
   */
  private generateBalanceDescription(
    typeCount: number,
    gogyouTypes: Gogyou[]
  ): string {
    const gogyouList = gogyouTypes.join('・');

    let description = `含まれる五行：${gogyouList}（${typeCount}種類）。`;

    if (typeCount >= 4) {
      description += '非常にバランスの取れた五行配置です。';
      description += '多様な才能と適応力を持ち、様々な分野で活躍できる可能性があります。';
    } else if (typeCount === 3) {
      description += '良好なバランスの五行配置です。';
      description += '安定感がありながらも変化に対応できる柔軟性を持っています。';
    } else if (typeCount === 2) {
      description += '二つの五行による構成です。';
      description += '特定の分野に集中する傾向があり、専門性を発揮しやすいタイプです。';
    } else {
      description += '単一の五行による構成です。';
      description += '一貫性と専門性に優れていますが、多様性を意識することで更なる発展が期待できます。';
    }

    return description;
  }

  /**
   * 総合スコアを計算
   */
  private calculateTotalScore(
    relationResult: GogyouRelationResult,
    balanceResult: InternalGogyouBalance
  ): number {
    // 関係性スコア（60%の重み）
    const relationScore = relationResult.score * 0.6;

    // バランススコア（40%の重み）
    const balanceScore = balanceResult.balanceScore * 0.4;

    return Math.round(relationScore + balanceScore);
  }

  /**
   * 評価レベルを判定
   */
  private getEvaluationLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    return 'poor';
  }

  /**
   * 総合的なアドバイスを生成
   */
  private generateAdvice(
    relationResult: GogyouRelationResult,
    balanceResult: InternalGogyouBalance,
    evaluation: 'excellent' | 'good' | 'fair' | 'poor'
  ): string {
    let advice = '';

    // 評価に基づく基本的なアドバイス
    switch (evaluation) {
      case 'excellent':
        advice += '非常に優れた五行配置です。';
        break;
      case 'good':
        advice += '良好な五行配置です。';
        break;
      case 'fair':
        advice += 'バランスの取れた五行配置です。';
        break;
      case 'poor':
        advice += '改善の余地がある五行配置です。';
        break;
    }

    // 関係性に基づくアドバイス
    if (relationResult.relation === GogyouRelation.相生) {
      advice += '人格と地格が相互に高め合う関係にあるため、自然体で物事に取り組むことで良い結果を得られるでしょう。';
    } else if (relationResult.relation === GogyouRelation.相克) {
      advice += '人格と地格に緊張関係がありますが、この試練を乗り越えることで大きな成長が期待できます。困難に立ち向かう勇気を持ちましょう。';
    } else {
      advice += '人格と地格が安定した関係にあるため、継続的な努力により着実な発展が見込めます。';
    }

    // バランスに基づくアドバイス
    if (balanceResult.typeCount >= 4) {
      advice += '多様な五行のバランスにより、様々な分野での活躍が期待できます。幅広い視野を持ち続けることが重要です。';
    } else if (balanceResult.typeCount <= 2) {
      advice += '専門性に優れていますが、他の五行の要素も意識的に取り入れることで、更なる発展が可能です。';
    }

    return advice;
  }
}