// Original YouinKantei system ported from seimeihandan
export interface YouinJudgment {
  key: string;
  name: string;
  message: string;
}

interface CountReport {
  youCount: number;
  inCount: number;
}

abstract class KanteiJudgeBase {
  protected judgment: YouinJudgment;

  constructor(judgment: YouinJudgment) {
    this.judgment = judgment;
  }

  get result() {
    return this.judgment;
  }

  protected count(items: boolean[]): CountReport {
    let youCount = 0;
    let inCount = 0;
    items.forEach((c) => {
      if (c) {
        youCount++;
      } else {
        inCount++;
      }
    });

    return {
      youCount: youCount,
      inCount: inCount
    };
  }

  public abstract action(seis: boolean[], meis: boolean[], alls: boolean[], rev: boolean): boolean;
}

class Katayori extends KanteiJudgeBase {
  private rev: boolean;

  constructor(judgment: YouinJudgment, rev: boolean) {
    super(judgment);
    this.rev = rev;
  }

  public action(seis: boolean[], meis: boolean[], alls: boolean[], rev: boolean): boolean {
    if (this.rev !== rev) {
      return false;
    }

    for (let i = 0; i < seis.length; i++) {
      let c = seis[i];
      if (c === false) {
        return false;
      }
    }

    for (let i = 0; i < meis.length; i++) {
      let c = meis[i];
      if (c === false) {
        return false;
      }
    }

    return true;
  }
}

class Chudan extends KanteiJudgeBase {
  constructor() {
    super({
      key: 'inyou_chudan',
      name: '中断',
      message: '姓と名で陰陽が分かれ、運勢に中断が生じやすい傾向があります。'
    });
  }

  public action(seis: boolean[], meis: boolean[], alls: boolean[]): boolean {
    for (let i = 0; i < seis.length; i++) {
      let c = seis[i];
      if (c === false) {
        return false;
      }
    }

    for (let i = 0; i < meis.length; i++) {
      let c = meis[i];
      if (c === true) {
        return false;
      }
    }

    return true;
  }
}

class Makinaoshi extends KanteiJudgeBase {
  private youOver: boolean;

  constructor(judgment: YouinJudgment, judge: boolean) {
    super(judgment);
    this.youOver = judge;
  }

  private preJudge(alls: boolean[]): boolean {
    let i = 0;
    for (; i < alls.length; i++) {
      let c = alls[i];
      if (c === false) {
        break;
      }
    }

    for (; i < alls.length; i++) {
      let c = alls[i];
      if (c === true) {
        // 陰が連続するべきなのに、途中で陽になったら
        return false;
      }
    }

    // 陽が連続した後に、陰が連続した
    return true;
  }

  public action(seis: boolean[], meis: boolean[], alls: boolean[]): boolean {
    // まず連続が2回しているかを判定
    if (this.preJudge(alls) === false) {
      return false;
    }

    let count = this.count(alls);
    let youOver = count.inCount < count.youCount;
    if (youOver === this.youOver) {
      return true;
    } else {
      return false;
    }
  }
}

class HanInyou extends KanteiJudgeBase {
  constructor() {
    super({
      key: 'inyou_zenro',
      name: '善良',
      message: '陰陽のバランスが良く、善良な性格を表しています。'
    });
  }

  public action(seis: boolean[], meis: boolean[], alls: boolean[]): boolean {
    let seiLast = seis[seis.length - 1];
    let meiFirst = meis[0];
    if (seiLast !== meiFirst) {
      let report = this.count(meis);
      if (0 < report.inCount && 0 < report.youCount) {
        return true;
      }
    }
    return false;
  }
}

class Shibari extends KanteiJudgeBase {
  constructor() {
    super({
      key: 'inyou_shibari',
      name: '縛り',
      message: '陰陽の配列に制約があり、運勢に束縛が生じやすい傾向があります。'
    });
  }

  public action(seis: boolean[], meis: boolean[], alls: boolean[]): boolean {
    return true;
  }
}

class Ohbasami extends KanteiJudgeBase {
  constructor() {
    super({
      key: 'inyou_ohbasami',
      name: '大挟み',
      message: '陰陽の配列に大きな挟まれる形があり、運勢に制約が生じる可能性があります。'
    });
  }

  public action(seis: boolean[], meis: boolean[], alls: boolean[]): boolean {
    let seiLast = seis[seis.length - 1];
    let meiFirst = meis[0];
    if (seiLast === meiFirst) {
      let seiReport = this.count(seis);
      let meiReport = this.count(meis);

      if (seiLast) {
        // 陽だったら
        if (0 < seiReport.inCount && 0 < meiReport.inCount) {
          return true;
        }
      } else {
        // 陰だったら
        if (0 < seiReport.youCount && 0 < meiReport.youCount) {
          return true;
        }
      }
    }

    return false;
  }
}

class NijuBasami extends KanteiJudgeBase {
  constructor() {
    super({
      key: 'inyou_niju_basami',
      name: '二重挟み',
      message: '陰陽の配列に二重の挟まれる形があり、運勢に複雑な制約が生じる傾向があります。'
    });
  }

  public action(seis: boolean[], meis: boolean[], alls: boolean[]): boolean {
    for (let i = seis.length; i < alls.length - 2; i++) {
      let item = alls[i];
      if (item === false) {
        let beforeReport = this.count(alls.slice(0, i));
        let afterReport = this.count(alls.slice(i + 1));
        if (beforeReport.inCount === 0 && afterReport.inCount === 0) {
          return true;
        }
      }
    }

    return false;
  }
}

export default class OriginalYouinKantei {
  private static readonly JUDGES = [
    new NijuBasami(),
    new Ohbasami(),
    new Katayori({
      key: 'inyou_siro_katayori',
      name: '白の方寄り',
      message: 'コミュニケーションが上手で、社交的な性格です。'
    }, false),
    new Katayori({
      key: 'inyou_kuro_katayori',
      name: '黒の方寄り',
      message: '根暗で、人とコミュニケーションを取るのが苦手な傾向があります。'
    }, true),
    new Chudan(),
    new Makinaoshi({
      key: 'inyou_ue_makinaosi',
      name: '上蒔き直し',
      message: '人生の前半で大きな変化や転換期を迎える可能性があります。'
    }, false),
    new Makinaoshi({
      key: 'inyou_sita_makinaosi',
      name: '下蒔き直し',
      message: '人生の後半で大きな変化や転換期を迎える可能性があります。'
    }, true),
    new HanInyou(),
    new Shibari()
  ];

  // 全てを陽にするメソッド
  static toNormalize(youins: boolean[], first: boolean): boolean[] {
    let result = new Array<boolean>();
    if (first) {
      // はじめの文字が陽だった場合にはそのまま格納
      youins.forEach((youin) => {
        result.push(youin);
      });
    } else {
      // はじめの文字が陰だった場合には陽に反転する
      youins.forEach((youin) => {
        result.push(!youin);
      });
    }

    return result;
  }

  public static analyze(seis: boolean[], meis: boolean[]): YouinJudgment | null {
    if (seis.length === 0 || meis.length === 0) {
      return null;
    }

    let rev = !meis[0];
    let normalizedSeis = OriginalYouinKantei.toNormalize(seis, seis[0]);
    let normalizedMeis = OriginalYouinKantei.toNormalize(meis, seis[0]);
    let alls = normalizedSeis.slice().concat(normalizedMeis);

    for (let i = 0; i < OriginalYouinKantei.JUDGES.length; i++) {
      let judge = OriginalYouinKantei.JUDGES[i];
      if (judge.action(normalizedSeis, normalizedMeis, alls, rev)) {
        return judge.result;
      }
    }

    return null;
  }

  // 陰陽パターンを文字列で表現（●は陰、○は陽）
  public static getYouinPattern(youins: boolean[]): string {
    return youins.map(youin => youin ? '○' : '●').join('');
  }
}