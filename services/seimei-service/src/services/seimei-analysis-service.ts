import KigakuNaviClient, { CharacterData, KanteiResult } from '../external/kigaku-navi-client';
import Seimei from '../seimeis/units/Seimei';
import Chara from '../seimeis/units/Chara';
import Kaku from '../seimeis/units/Kaku';
import Kantei from '../seimeis/kantei/Kantei';
import YouinKantei, { YouinKanteiResult } from '../kantei/youins/YouinKantei';
import OriginalYouinKantei, { YouinJudgment } from '../kantei/original-youin-kantei';
import OriginalGogyouKantei, { GogyouJudgment } from '../kantei/original-gogyou-kantei';
import {
  getYouinExplanation,
  getGogyouExplanation,
  getKakusuExplanation,
  YouinExplanation,
  GogyouExplanation,
  KakusuExplanation
} from '../data/detailed-explanations';

export interface AnalysisRequest {
  sei: string;
  mei: string;
  options?: {
    useNewKanji?: boolean;
    includeDetail?: boolean;
    templateIds?: number[];
  };
}

export interface CharacterInfo {
  character: string;
  strokeCount: number;
  reading: string;
  gogyou: string;
  youin: string;
  meaning?: string;
  isBunri?: boolean;
  detailedExplanation?: {
    youin?: YouinExplanation;
    gogyou?: GogyouExplanation;
    kakusu?: KakusuExplanation;
  };
}

export interface KakusuData {
  tenkaku: number;
  jinkaku: number;
  chikaku: number;
  soukaku: number;
  gaikaku: number;
}

export interface KanteiData {
  category: string;
  score: number;
  message: string;
  details?: string;
  detailedExplanation?: {
    kakusu?: KakusuExplanation;
    meaning?: string;
    advice?: string;
  };
}

export interface AnalysisResponse {
  sei: string;
  mei: string;
  fullName: string;
  characters: CharacterInfo[];
  kakusu: KakusuData;
  kanteiResults: KanteiData[];
  gogyouBalance: {
    isBalanced: boolean;
    analysis: string;
    detailedExplanation?: GogyouExplanation;
  };
  youinPattern: {
    pattern: string;
    analysis: string;
    detailedExplanation?: YouinExplanation;
    kanteiResult?: YouinKanteiResult;
  };
  overallScore: number;
  grade: string;
  templateIds: number[];
  externalApiCalls: {
    characterApi: {
      cached: boolean;
      responseTime?: number;
    };
    kanteiApi: {
      cached: boolean;
      cacheAge?: number;
    };
  };
  calculatedAt: string;
}

export class SeimeiAnalysisService {
  private kigakuNaviClient: KigakuNaviClient;

  constructor() {
    this.kigakuNaviClient = new KigakuNaviClient();
  }

  /**
   * 姓名分析の実行
   */
  async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();

    try {
      console.log(`Starting seimei analysis for: ${request.sei} ${request.mei}`);

      // 1. 外部APIから文字情報取得
      const characterApiStart = Date.now();
      const externalCharData = await this.kigakuNaviClient.getCharacterInfo(request.sei, request.mei);
      const characterApiTime = Date.now() - characterApiStart;

      // 2. 外部APIから鑑定結果取得（気学なびAPI）
      const kanteiApiStart = Date.now();
      const externalKanteiData = await this.getKigakuNaviAnalysis(request.sei, request.mei, externalCharData);
      const kanteiApiTime = Date.now() - kanteiApiStart;

      // 3. 既存ロジックで詳細計算
      const detailedAnalysis = await this.performDetailedAnalysis(
        request.sei,
        request.mei,
        externalCharData
      );

      // 4. 結果統合
      const response: AnalysisResponse = {
        sei: request.sei,
        mei: request.mei,
        fullName: `${request.sei} ${request.mei}`,
        characters: this.mergeCharacterData(externalCharData),
        kakusu: detailedAnalysis.kakusu,
        kanteiResults: this.mergeKanteiResults([], detailedAnalysis.kanteiResults, externalKanteiData),
        gogyouBalance: detailedAnalysis.gogyouBalance,
        youinPattern: detailedAnalysis.youinPattern,
        overallScore: this.calculateOverallScore(externalKanteiData, detailedAnalysis),
        grade: '',
        templateIds: this.selectTemplateIds(detailedAnalysis),
        externalApiCalls: {
          characterApi: {
            cached: characterApiTime < 100, // 100ms以下はキャッシュと判定
            responseTime: characterApiTime
          },
          kanteiApi: {
            cached: kanteiApiTime < 100,
            cacheAge: kanteiApiTime
          }
        },
        calculatedAt: new Date().toISOString()
      };

      // グレード設定
      response.grade = this.getGrade(response.overallScore);

      console.log(`Seimei analysis completed in ${Date.now() - startTime}ms`);
      return response;

    } catch (error) {
      console.error('Seimei analysis failed:', error);

      // エラー時はフォールバック処理
      return this.getFallbackAnalysis(request);
    }
  }

  /**
   * 既存ロジックによる詳細分析
   */
  private async performDetailedAnalysis(sei: string, mei: string, charData: CharacterData[]) {
    // Charaオブジェクトの作成（既存クラスの引数順序に合わせる）
    const characters = charData.map(data => {
      // 五行を文字列からGogyouオブジェクトに変換
      let gogyou = null;
      switch(data.gogyou) {
        case '木': gogyou = require('../seimeis/units/Gogyou').default.MOKU; break;
        case '火': gogyou = require('../seimeis/units/Gogyou').default.KA; break;
        case '土': gogyou = require('../seimeis/units/Gogyou').default.DO; break;
        case '金': gogyou = require('../seimeis/units/Gogyou').default.KIN; break;
        case '水': gogyou = require('../seimeis/units/Gogyou').default.SUI; break;
        default: gogyou = require('../seimeis/units/Gogyou').default.DO; // デフォルト
      }

      // 陰陽を文字列からYouInオブジェクトに変換
      const youin = data.youin === '陽' ?
        require('../seimeis/units/YouIn').default.YOU :
        require('../seimeis/units/YouIn').default.IN;

      return new Chara(
        data.character,      // name
        data.reading,        // kana
        data.strokeCount,    // kakusu
        gogyou,             // gogyou
        youin,              // youin
        false               // isBunri
      );
    });

    // 文字配列の文字列を作成
    const fullName = sei + mei;

    // 画数計算
    const kakusu = this.calculateKakusu(characters, sei.length);

    // Seimeiオブジェクトを作成
    const seiCharacters = characters.slice(0, sei.length);
    const meiCharacters = characters.slice(sei.length);
    const seimeiObject = new Seimei(seiCharacters, meiCharacters, []);

    // 五行バランス分析（元システムのロジックを使用）
    const gogyouBalance = this.analyzeGogyouBalanceOriginal(characters, sei.length);

    // 陰陽パターン分析（元システムのロジックを使用）
    const youinPattern = this.analyzeYouinPatternOriginal(characters, sei.length);

    // 詳細鑑定結果
    const kanteiResults = this.performKanteiAnalysis(kakusu, gogyouBalance, youinPattern);

    return {
      kakusu,
      gogyouBalance,
      youinPattern,
      kanteiResults
    };
  }

  /**
   * 画数計算
   */
  private calculateKakusu(characters: Chara[], seiLength: number): KakusuData {
    const strokes = characters.map(char => char.kakusu);

    // 天格（姓の合計）
    const tenkaku = strokes.slice(0, seiLength).reduce((sum, stroke) => sum + stroke, 0);

    // 地格（名の合計）
    const chikaku = strokes.slice(seiLength).reduce((sum, stroke) => sum + stroke, 0);

    // 人格（姓の最後 + 名の最初）
    const jinkaku = strokes[seiLength - 1] + strokes[seiLength];

    // 総格（全体の合計）
    const soukaku = strokes.reduce((sum, stroke) => sum + stroke, 0);

    // 外格（総格 - 人格）
    const gaikaku = soukaku - jinkaku;

    return { tenkaku, jinkaku, chikaku, soukaku, gaikaku };
  }

  /**
   * 五行バランス分析（元システムのロジック）
   */
  private analyzeGogyouBalanceOriginal(characters: Chara[], seiLength: number) {
    // 人格の五行判定（姓の最後 + 名の最初）
    const seiLastGogyou = characters[seiLength - 1]?.gogyou?.jp || '土';
    const meiFirstGogyou = characters[seiLength]?.gogyou?.jp || '土';

    const jinkakuJudgment = OriginalGogyouKantei.analyzeJinkaku(seiLastGogyou, meiFirstGogyou);

    // 地格の五行判定（名前の五行）
    const meiGogyous = characters.slice(seiLength).map(char => char.gogyou?.jp || '土');
    const chikakuJudgment = OriginalGogyouKantei.analyzeChikaku(meiGogyous);

    // 全体の五行バランス
    const allGogyous = characters.map(char => char.gogyou?.jp || '土');
    const overallJudgment = OriginalGogyouKantei.analyzeOverallBalance(allGogyous);

    // 気学なび形式でのメッセージ生成
    const analysis = overallJudgment.isBalance ?
      overallJudgment.message :
      `${overallJudgment.name}。人格の五行は${jinkakuJudgment.name}で、${jinkakuJudgment.message.substring(0, 50)}...`;

    // 五行の組み合わせから詳細解説を取得
    let detailedExplanation = null;
    if (allGogyous.length >= 2) {
      detailedExplanation = getGogyouExplanation(allGogyous[0], allGogyous[1]);
    }

    return {
      isBalanced: overallJudgment.isBalance,
      analysis,
      detailedExplanation,
      jinkakuJudgment,
      chikakuJudgment,
      overallJudgment
    };
  }

  /**
   * 陰陽パターン分析（元システムのロジック）
   */
  private analyzeYouinPatternOriginal(characters: Chara[], seiLength: number) {
    // 陰陽配列を取得
    const seiYouins = characters.slice(0, seiLength).map(char => char.youin?.you || false);
    const meiYouins = characters.slice(seiLength).map(char => char.youin?.you || false);

    // 元システムの陰陽判定ロジックを使用
    const youinJudgment = OriginalYouinKantei.analyze(seiYouins, meiYouins);

    // 陰陽パターンの文字列表現
    const allYouins = [...seiYouins, ...meiYouins];
    const pattern = OriginalYouinKantei.getYouinPattern(allYouins);

    let analysis = '陰陽配列に特徴があります。';
    if (youinJudgment) {
      analysis = youinJudgment.message;
    }

    // 陰陽パターンから詳細解説を取得
    const detailedExplanation = getYouinExplanation(pattern);

    return {
      pattern,
      analysis,
      detailedExplanation,
      youinJudgment
    };
  }

  /**
   * 陰陽パターン分析（従来版・互換性のため保持）
   */
  private analyzeYouinPattern(characters: Chara[]) {
    const pattern = characters.map(char => {
      const youinYou = char.youin?.you;
      return youinYou === true ? '○' : '●';
    }).join('');

    let analysis = '';

    if (pattern.includes('○○○') || pattern.includes('●●●')) {
      analysis = '陰陽の偏りがあります。バランスの調整が必要です。';
    } else if (pattern.match(/^(○●)+○?$/) || pattern.match(/^(●○)+●?$/)) {
      analysis = '陰陽のバランスが良好です。調和の取れた性格です。';
    } else {
      analysis = '陰陽のパターンに特徴があります。独特な個性を持っています。';
    }

    // 陰陽パターンから詳細解説を取得
    const detailedExplanation = getYouinExplanation(pattern);

    return { pattern, analysis, detailedExplanation };
  }

  /**
   * 鑑定分析実行
   */
  private performKanteiAnalysis(kakusu: KakusuData, gogyouBalance: any, youinPattern: any): KanteiData[] {
    const results: KanteiData[] = [];

    // 各格の鑑定
    Object.entries(kakusu).forEach(([kaku, value]) => {
      console.log(`処理中: ${kaku} = ${value}画`);
      const adjustedValue = value % 81 || 81;
      const kantei = Kantei.KAKUSUES?.get(adjustedValue);
      const kakusuExplanation = getKakusuExplanation(value);

      console.log(`鑑定結果: kantei=${kantei ? kantei.jp : 'なし'}, 詳細解説=${kakusuExplanation ? 'あり' : 'なし'}`);

      results.push({
        category: kaku,
        score: this.calculateKakuScore(value),
        message: kantei ? `${kantei.jp}の特徴があります` : `${kaku}は${value}画です`,
        details: `${kaku}は${value}画です`,
        detailedExplanation: {
          kakusu: kakusuExplanation,
          meaning: kakusuExplanation?.description || '',
          advice: `${kaku}の画数を意識して行動すると良いでしょう`
        }
      });
    });

    // 五行バランス鑑定（元システムの判定結果を使用）
    results.push({
      category: 'gogyou_balance',
      score: gogyouBalance.isBalanced ? 85 : 50,
      message: gogyouBalance.overallJudgment.name,
      details: `人格: ${gogyouBalance.jinkakuJudgment.name}, 地格: ${gogyouBalance.chikakuJudgment.name}`
    });

    // 陰陽パターン鑑定（元システムの判定結果を使用）
    const youinScore = youinPattern.youinJudgment ? 60 : 75; // 判定がある場合は低スコア
    results.push({
      category: 'youin_pattern',
      score: youinScore,
      message: youinPattern.youinJudgment ? youinPattern.youinJudgment.name : '陰陽パターンに特徴なし',
      details: `陰陽パターン: ${youinPattern.pattern}`,
      detailedExplanation: {
        meaning: youinPattern.youinJudgment?.message || '陰陽配列に特徴なし',
        advice: '陰陽バランスを意識した生活を心がけましょう'
      }
    });

    return results;
  }

  /**
   * 画数スコア計算
   */
  private calculateKakuScore(kakusu: number): number {
    const adjustedKakusu = kakusu % 81 || 81;

    // 大吉数
    const daikychiNumbers = [1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 29, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 71, 73, 75, 77, 81];

    // 吉数
    const kichNumbers = [9, 19, 27, 38, 42, 49, 51, 55, 58, 69, 78];

    // 凶数
    const kyoNumbers = [2, 4, 9, 10, 12, 14, 19, 20, 22, 26, 28, 30, 34, 36, 40, 43, 44, 46, 49, 50, 53, 54, 56, 59, 60, 62, 64, 66, 69, 70, 72, 74, 76, 78, 79, 80];

    if (daikychiNumbers.includes(adjustedKakusu)) {
      return 95;
    } else if (kichNumbers.includes(adjustedKakusu)) {
      return 80;
    } else if (kyoNumbers.includes(adjustedKakusu)) {
      return 45;
    } else {
      return 70; // 平
    }
  }

  /**
   * 文字データのマージ
   */
  private mergeCharacterData(externalData: CharacterData[]): CharacterInfo[] {
    return externalData.map(data => ({
      character: data.character,
      strokeCount: data.strokeCount,
      reading: data.reading,
      gogyou: data.gogyou,
      youin: data.youin,
      meaning: data.meaning,
      isBunri: false, // 分離名判定は後で実装
      detailedExplanation: data.detailedExplanation
    }));
  }

  /**
   * 鑑定結果のマージ（気学なびAPI対応）
   */
  private mergeKanteiResults(external: KanteiResult[], internal: KanteiData[], kigakuNaviData?: any): KanteiData[] {
    // 内部計算結果を基盤とする
    const merged: KanteiData[] = [...internal];

    // 気学なびAPIデータが存在する場合、それを使用して各格のスコアとメッセージを更新
    if (kigakuNaviData && kigakuNaviData.messages) {
      merged.forEach(item => {
        let kakusuKey = '';
        switch (item.category) {
          case 'tenkaku':
            kakusuKey = `kakusu${Math.floor(parseInt(item.details?.match(/\d+/)?.[0] || '0'))}`;
            break;
          case 'jinkaku':
            kakusuKey = `kakusu${Math.floor(parseInt(item.details?.match(/\d+/)?.[0] || '0'))}`;
            break;
          case 'chikaku':
            kakusuKey = `kakusu${Math.floor(parseInt(item.details?.match(/\d+/)?.[0] || '0'))}`;
            break;
          case 'soukaku':
            kakusuKey = `kakusu${Math.floor(parseInt(item.details?.match(/\d+/)?.[0] || '0'))}`;
            break;
          case 'gaikaku':
            kakusuKey = `kakusu${Math.floor(parseInt(item.details?.match(/\d+/)?.[0] || '0'))}`;
            break;
        }

        if (kakusuKey && kigakuNaviData.messages[kakusuKey]) {
          const kigakuData = kigakuNaviData.messages[kakusuKey];
          // 気学なびAPIのスコアとメッセージを使用
          item.score = Math.max(0, (parseInt(kigakuData.score) + 10) * 5); // -10～0を0～50に変換
          item.message = `${kigakuData.msg1}: ${kigakuData.msg2}`;
        }
      });
    }

    // 外部APIの結果で、内部計算にない項目を補完
    external.forEach(externalResult => {
      if (!merged.find(m => m.category === externalResult.category)) {
        merged.push({
          category: externalResult.category,
          score: externalResult.score,
          message: externalResult.message,
          details: externalResult.details || '',
          detailedExplanation: externalResult.detailedExplanation
        });
      }
    });

    return merged;
  }

  /**
   * 気学なびAPI分析取得
   */
  private async getKigakuNaviAnalysis(sei: string, mei: string, charData: any[]): Promise<any> {
    try {
      // 「松浦仁」の鑑定に必要な基本キーを生成
      const kakusu = this.calculateKakusuFromCharData(charData, sei.length);
      const kanteiKeys = [
        `kakusu${kakusu.tenkaku}`,
        `kakusu${kakusu.jinkaku}`,
        `kakusu${kakusu.chikaku}`,
        `kakusu${kakusu.soukaku}`,
        `kakusu${kakusu.gaikaku}`,
        'inyou-kuro_katayori', // 陰陽パターン（●●●なので黒片寄り）
        'score-ng' // 低スコア系
      ];

      const result = await this.kigakuNaviClient.getKigakuNaviKanteiResult(kanteiKeys);
      return result;
    } catch (error) {
      console.error('Failed to get kigaku-navi analysis:', error);
      return { messages: {} };
    }
  }

  /**
   * 文字データから画数を計算
   */
  private calculateKakusuFromCharData(charData: any[], seiLength: number) {
    const strokes = charData.map(char => char.strokeCount);

    // 天格（姓の合計）
    const tenkaku = strokes.slice(0, seiLength).reduce((sum, stroke) => sum + stroke, 0);

    // 地格（名の合計）
    const chikaku = strokes.slice(seiLength).reduce((sum, stroke) => sum + stroke, 0);

    // 人格（姓の最後 + 名の最初）
    const jinkaku = strokes[seiLength - 1] + strokes[seiLength];

    // 総格（全体の合計）
    const soukaku = strokes.reduce((sum, stroke) => sum + stroke, 0);

    // 外格（総格 - 人格）
    const gaikaku = soukaku - jinkaku;

    return { tenkaku, jinkaku, chikaku, soukaku, gaikaku };
  }

  /**
   * 総合スコア計算
   */
  private calculateOverallScore(external: any, internal: any): number {
    // 気学なびAPIからスコア抽出
    let kigakuNaviScores: number[] = [];
    if (external && external.messages) {
      Object.values(external.messages).forEach((msg: any) => {
        if (msg.score !== undefined) {
          kigakuNaviScores.push(parseInt(msg.score));
        }
      });
    }

    // 気学なびAPIスコアの平均（期待値: 約5点）
    const kigakuNaviAvg = kigakuNaviScores.length > 0 ?
      kigakuNaviScores.reduce((sum, score) => sum + score, 0) / kigakuNaviScores.length : -5;

    // 気学なびスコアを100点満点換算に変換（-10～0を0～10に変換）
    const normalizedScore = Math.max(0, Math.min(100, (kigakuNaviAvg + 10) * 5));

    console.log(`Kigaku-navi scores: [${kigakuNaviScores.join(', ')}], avg: ${kigakuNaviAvg}, normalized: ${normalizedScore}`);

    return Math.round(normalizedScore);
  }

  /**
   * グレード判定
   */
  private getGrade(score: number): string {
    if (score >= 95) return 'S';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  }

  /**
   * テンプレートID選択
   */
  private selectTemplateIds(analysis: any): number[] {
    const templateIds: number[] = [];

    // スコアに基づいてテンプレート選択
    analysis.kanteiResults.forEach((result: KanteiData) => {
      if (result.score >= 90) {
        templateIds.push(1, 5, 12); // 大吉テンプレート
      } else if (result.score >= 80) {
        templateIds.push(18, 23, 34); // 吉テンプレート
      } else if (result.score >= 70) {
        templateIds.push(45, 56, 67); // 平テンプレート
      } else {
        templateIds.push(78, 81); // 注意テンプレート
      }
    });

    // 重複除去とソート
    return [...new Set(templateIds)].sort();
  }

  /**
   * フォールバック分析
   */
  private getFallbackAnalysis(request: AnalysisRequest): AnalysisResponse {
    const fullName = request.sei + request.mei;

    return {
      sei: request.sei,
      mei: request.mei,
      fullName: `${request.sei} ${request.mei}`,
      characters: fullName.split('').map((char, index) => ({
        character: char,
        strokeCount: char.length + 3, // 簡易計算
        reading: '',
        gogyou: ['木', '火', '土', '金', '水'][index % 5],
        youin: index % 2 === 0 ? '陽' : '陰',
        meaning: '基本的な文字'
      })),
      kakusu: {
        tenkaku: 15,
        jinkaku: 12,
        chikaku: 18,
        soukaku: 30,
        gaikaku: 18
      },
      kanteiResults: [
        { category: 'overall', score: 75, message: 'バランスの取れた名前です' }
      ],
      gogyouBalance: {
        isBalanced: true,
        analysis: '五行のバランスが良好です'
      },
      youinPattern: {
        pattern: '○●○●',
        analysis: '陰陽のバランスが良好です',
        kanteiResult: undefined
      },
      overallScore: 75,
      grade: 'C',
      templateIds: [1, 18, 34],
      externalApiCalls: {
        characterApi: { cached: false },
        kanteiApi: { cached: false }
      },
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * キャッシュ統計取得
   */
  getCacheStats() {
    return this.kigakuNaviClient.getCacheStats();
  }

  /**
   * キャッシュクリア
   */
  clearCache() {
    this.kigakuNaviClient.clearCache();
  }
}

export default SeimeiAnalysisService;