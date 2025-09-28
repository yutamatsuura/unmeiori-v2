// Original Gogyou judgment system ported from seimeihandan
export interface GogyouJudgment {
  key: string;
  name: string;
  message: string;
  isBalance: boolean;
}

export interface GogyouCombination {
  first: string;
  second: string;
  judgment: GogyouJudgment;
}

export default class OriginalGogyouKantei {
  // 五行の関係性定義
  private static readonly GOGYOU_COMBINATIONS: GogyouCombination[] = [
    // 相生関係（良好）
    {
      first: '木',
      second: '火',
      judgment: {
        key: 'gogyou_moku_ka',
        name: '木-火',
        message: '相生の関係で、木が火を生じて運勢を強める良い組み合わせです。',
        isBalance: true
      }
    },
    {
      first: '火',
      second: '土',
      judgment: {
        key: 'gogyou_ka_do',
        name: '火-土',
        message: '相生の関係で、火が土を生じて運勢を強める良い組み合わせです。',
        isBalance: true
      }
    },
    {
      first: '土',
      second: '金',
      judgment: {
        key: 'gogyou_do_kin',
        name: '土-金',
        message: '相生の関係で、土が金を生じて運勢を強める良い組み合わせです。',
        isBalance: true
      }
    },
    {
      first: '金',
      second: '水',
      judgment: {
        key: 'gogyou_kin_sui',
        name: '金-水',
        message: '相生の関係で、金が水を生じて運勢を強める良い組み合わせです。',
        isBalance: true
      }
    },
    {
      first: '水',
      second: '木',
      judgment: {
        key: 'gogyou_sui_moku',
        name: '水-木',
        message: '相生の関係で、水が木を生じて運勢を強める良い組み合わせです。',
        isBalance: true
      }
    },

    // 相克関係（悪）
    {
      first: '木',
      second: '土',
      judgment: {
        key: 'gogyou_moku_do',
        name: '木-土',
        message: '相克の関係で、木が土を剋して運勢に制約を生じます。',
        isBalance: false
      }
    },
    {
      first: '火',
      second: '金',
      judgment: {
        key: 'gogyou_ka_kin',
        name: '火-金',
        message: '相克の関係で、火が金を剋して運勢に制約を生じます。',
        isBalance: false
      }
    },
    {
      first: '土',
      second: '水',
      judgment: {
        key: 'gogyou_do_sui',
        name: '土-水',
        message: '相克の関係で、土が水を剋して運勢に制約を生じます。',
        isBalance: false
      }
    },
    {
      first: '金',
      second: '木',
      judgment: {
        key: 'gogyou_kin_moku',
        name: '金-木',
        message: '相克の関係で、金が木を剋して運勢に制約を生じます。',
        isBalance: false
      }
    },
    {
      first: '水',
      second: '火',
      judgment: {
        key: 'gogyou_sui_ka',
        name: '水-火',
        message: '相克の関係で、水が火を剋して運勢に制約を生じます。',
        isBalance: false
      }
    },

    // 同行（普通）
    {
      first: '木',
      second: '木',
      judgment: {
        key: 'gogyou_moku_moku',
        name: '木-木',
        message: '同じ五行で安定していますが、単調になりがちです。',
        isBalance: true
      }
    },
    {
      first: '火',
      second: '火',
      judgment: {
        key: 'gogyou_ka_ka',
        name: '火-火',
        message: '同じ五行で安定していますが、激しすぎる傾向があります。',
        isBalance: false
      }
    },
    {
      first: '土',
      second: '土',
      judgment: {
        key: 'gogyou_do_do',
        name: '土-土',
        message: '同じ五行で安定していますが、変化に乏しい傾向があります。',
        isBalance: true
      }
    },
    {
      first: '金',
      second: '金',
      judgment: {
        key: 'gogyou_kin_kin',
        name: '金-金',
        message: '同じ五行で安定していますが、冷たすぎる傾向があります。',
        isBalance: false
      }
    },
    {
      first: '水',
      second: '水',
      judgment: {
        key: 'gogyou_sui_sui',
        name: '水-水',
        message: '同じ五行で安定していますが、流動的すぎる傾向があります。',
        isBalance: false
      }
    }
  ];

  // 人格の五行判定（姓の最後 + 名の最初）
  public static analyzeJinkaku(seiLastGogyou: string, meiFirstGogyou: string): GogyouJudgment {
    const combination = this.GOGYOU_COMBINATIONS.find(combo =>
      combo.first === seiLastGogyou && combo.second === meiFirstGogyou
    );

    return combination ? combination.judgment : {
      key: 'gogyou_unknown',
      name: `${seiLastGogyou}-${meiFirstGogyou}`,
      message: 'この五行の組み合わせは判定できません。',
      isBalance: true
    };
  }

  // 地格の五行判定（名前の五行バランス）
  public static analyzeChikaku(meiGogyous: string[]): GogyouJudgment {
    if (meiGogyous.length === 0) {
      return {
        key: 'gogyou_no_mei',
        name: '名前なし',
        message: '名前がないため五行判定できません。',
        isBalance: false
      };
    }

    // 単一文字の場合
    if (meiGogyous.length === 1) {
      return {
        key: `gogyou_single_${meiGogyous[0]}`,
        name: `${meiGogyous[0]}行`,
        message: `単一の${meiGogyous[0]}行で、その特性が強く現れます。`,
        isBalance: true
      };
    }

    // 複数文字の場合、最初の2文字を判定
    const first = meiGogyous[0];
    const second = meiGogyous[1];

    return this.analyzeJinkaku(first, second);
  }

  // 全体の五行バランス判定（気学なび基準）
  public static analyzeOverallBalance(allGogyous: string[]): GogyouJudgment {
    const gogyouCount = {
      '木': 0,
      '火': 0,
      '土': 0,
      '金': 0,
      '水': 0
    };

    // 各五行の出現回数をカウント
    allGogyous.forEach(gogyou => {
      if (gogyouCount.hasOwnProperty(gogyou)) {
        gogyouCount[gogyou as keyof typeof gogyouCount]++;
      }
    });

    // 気学なび基準でのバランス判定：
    // - 同じ五行が2個以上ある場合は「良」
    // - 全て異なる五行の場合は「悪」
    const nonZeroCounts = Object.values(gogyouCount).filter(count => count > 0);
    const uniqueGogyous = nonZeroCounts.length;
    const maxCount = Math.max(...nonZeroCounts);

    // バランスが良い条件：同じ五行が2個以上ある
    const isBalanced = maxCount >= 2;

    if (isBalanced) {
      // 同じ五行が複数ある場合
      const dominantGogyou = Object.entries(gogyouCount)
        .filter(([_, count]) => count === maxCount)
        .map(([gogyou, _]) => gogyou)[0];

      return {
        key: 'gogyou_balance_ok',
        name: '五行のバランス(良)',
        message: `${dominantGogyou}行を中心とした五行のバランスが良く、調和の取れた運勢を表しています。`,
        isBalance: true
      };
    } else {
      // 全て異なる五行の場合
      return {
        key: 'gogyou_balance_ng',
        name: '五行のバランス(悪)',
        message: '五行が散らばりすぎており、運勢に安定性を欠く傾向があります。',
        isBalance: false
      };
    }
  }

  // 気学なび形式での判定メッセージを生成
  public static generateKigakuNaviMessage(
    jinkakuJudgment: GogyouJudgment,
    chikakuJudgment: GogyouJudgment,
    overallJudgment: GogyouJudgment
  ): string {
    const messages: string[] = [];

    // 人格の五行メッセージ
    messages.push(`人格の五行組み合わせは${jinkakuJudgment.name}で、${jinkakuJudgment.message}`);

    // 地格の五行メッセージ
    if (chikakuJudgment.key !== jinkakuJudgment.key) {
      messages.push(`地格の五行は${chikakuJudgment.message}`);
    }

    // 全体バランスのメッセージ
    messages.push(overallJudgment.message);

    return messages.join('');
  }
}