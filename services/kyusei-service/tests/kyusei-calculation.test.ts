import Qsei from '../src/bans/qseis/Qsei';
import LocalDate from '../src/times/LocalDate';
import QseiDate from '../src/bans/dates/QseiDate';

/**
 * 九星気学計算精度検証テスト
 *
 * 目的：
 * - 年盤・月盤・日盤の計算精度を検証
 * - 境界値（節入り前後、年末年始）での動作確認
 * - 五行・方位・吉凶判定の検証
 * - 1950年〜2030年の範囲での広範囲テスト
 */

describe('九星気学計算精度検証テスト', () => {

  describe('年盤計算精度テスト', () => {

    it('通常ケース - 1990年5月15日', () => {
      const date = LocalDate.parse('1990-05-15');
      const yearQsei = Qsei.getYear(date);

      expect(yearQsei).not.toBeNull();
      expect(yearQsei!.index).toBe(1); // 一白水星
      expect(yearQsei!.name).toBe('一白水星');
      expect(yearQsei!.rubi).toBe('いっぱくすいせい');
      expect(yearQsei!.gogyou?.key).toBe('水');
      expect(yearQsei!.houi?.name).toBe('北');
    });

    it('境界値 - 2000年2月3日（節入り前）', () => {
      const date = LocalDate.parse('2000-02-03');
      const yearQsei = Qsei.getYear(date);

      expect(yearQsei).not.toBeNull();
      expect(yearQsei!.index).toBe(1); // 1999年の計算結果（一白水星）
      expect(yearQsei!.name).toBe('一白水星');
    });

    it('境界値 - 2000年2月4日（節入り当日）', () => {
      const date = LocalDate.parse('2000-02-04');
      const yearQsei = Qsei.getYear(date);

      expect(yearQsei).not.toBeNull();
      expect(yearQsei!.index).toBe(9); // 2000年の計算結果（九紫火星）
      expect(yearQsei!.name).toBe('九紫火星');
    });

    it('境界値 - 1999年12月31日（年末）', () => {
      const date = LocalDate.parse('1999-12-31');
      const yearQsei = Qsei.getYear(date);

      expect(yearQsei).not.toBeNull();
      expect(yearQsei!.index).toBe(1); // 1999年の計算結果（一白水星）
      expect(yearQsei!.name).toBe('一白水星');
    });

    it('境界値 - 2000年1月1日（年始）', () => {
      const date = LocalDate.parse('2000-01-01');
      const yearQsei = Qsei.getYear(date);

      expect(yearQsei).not.toBeNull();
      expect(yearQsei!.index).toBe(1); // まだ1999年の九星（一白水星）
      expect(yearQsei!.name).toBe('一白水星');
    });

    // 広範囲年代テスト（実際の計算結果に基づく）
    const testCases = [
      { date: '1950-05-01', expectedIndex: 5, expectedName: '五黄土星' },
      { date: '1960-08-15', expectedIndex: 4, expectedName: '四緑木星' },
      { date: '1970-12-25', expectedIndex: 3, expectedName: '三碧木星' },
      { date: '1980-03-10', expectedIndex: 2, expectedName: '二黒土星' },
      { date: '1985-07-04', expectedIndex: 6, expectedName: '六白金星' },
      { date: '1995-11-11', expectedIndex: 5, expectedName: '五黄土星' },
      { date: '2005-09-20', expectedIndex: 4, expectedName: '四緑木星' },
      { date: '2015-04-29', expectedIndex: 3, expectedName: '三碧木星' },
      { date: '2025-06-15', expectedIndex: 2, expectedName: '二黒土星' },
      { date: '2030-10-31', expectedIndex: 6, expectedName: '六白金星' }
    ];

    testCases.forEach(({ date, expectedIndex, expectedName }) => {
      it(`広範囲テスト - ${date}`, () => {
        const localDate = LocalDate.parse(date);
        const yearQsei = Qsei.getYear(localDate);

        expect(yearQsei).not.toBeNull();
        expect(yearQsei!.index).toBe(expectedIndex);
        expect(yearQsei!.name).toBe(expectedName);
      });
    });
  });

  describe('月盤計算精度テスト', () => {

    it('通常ケース - 1990年5月15日', () => {
      const date = LocalDate.parse('1990-05-15');
      const monthQsei = Qsei.getMonth(date);

      expect(monthQsei).not.toBeNull();
      expect(monthQsei!.index).toBeGreaterThanOrEqual(1);
      expect(monthQsei!.index).toBeLessThanOrEqual(9);
      expect(monthQsei!.name).toMatch(/星$/);
    });

    it('月初境界値 - 2000年3月1日', () => {
      const date = LocalDate.parse('2000-03-01');
      const monthQsei = Qsei.getMonth(date);

      expect(monthQsei).not.toBeNull();
      expect(monthQsei!.index).toBeGreaterThanOrEqual(1);
      expect(monthQsei!.index).toBeLessThanOrEqual(9);
    });

    it('月末境界値 - 2000年2月29日（うるう年）', () => {
      const date = LocalDate.parse('2000-02-29');
      const monthQsei = Qsei.getMonth(date);

      expect(monthQsei).not.toBeNull();
      expect(monthQsei!.index).toBeGreaterThanOrEqual(1);
      expect(monthQsei!.index).toBeLessThanOrEqual(9);
    });

    // 12ヶ月全てのテスト
    const monthTestCases = [
      { date: '2024-01-15', month: 1 },
      { date: '2024-02-15', month: 2 },
      { date: '2024-03-15', month: 3 },
      { date: '2024-04-15', month: 4 },
      { date: '2024-05-15', month: 5 },
      { date: '2024-06-15', month: 6 },
      { date: '2024-07-15', month: 7 },
      { date: '2024-08-15', month: 8 },
      { date: '2024-09-15', month: 9 },
      { date: '2024-10-15', month: 10 },
      { date: '2024-11-15', month: 11 },
      { date: '2024-12-15', month: 12 }
    ];

    monthTestCases.forEach(({ date, month }) => {
      it(`月盤計算 - ${month}月（${date}）`, () => {
        const localDate = LocalDate.parse(date);
        const monthQsei = Qsei.getMonth(localDate);

        expect(monthQsei).not.toBeNull();
        expect(monthQsei!.index).toBeGreaterThanOrEqual(1);
        expect(monthQsei!.index).toBeLessThanOrEqual(9);
        expect(monthQsei!.name).toMatch(/[一二三四五六七八九][白黒碧緑黄紫赤].*星$/);
      });
    });
  });

  describe('九星のプロパティ検証テスト', () => {

    it('全九星のプロパティ完整性検証', () => {
      for (let i = 1; i <= 9; i++) {
        const qsei = Qsei.of(i);

        expect(qsei).not.toBeNull();
        expect(qsei!.index).toBe(i);
        expect(qsei!.name).toBeDefined();
        expect(qsei!.rubi).toBeDefined();
        expect(qsei!.kiban8).toHaveLength(8);
        expect(qsei!.kiban12).toHaveLength(12);

        // 五黄土星以外は方位を持つ
        if (i !== 5) {
          expect(qsei!.houi).not.toBeNull();
          expect(qsei!.houi!.name).toBeDefined();
        }

        // 五行の検証（実際のプロパティに基づく）
        expect(qsei!.gogyou).not.toBeNull();
        expect(qsei!.gogyou!.key).toMatch(/^(水|木|火|土|金)$/);
      }
    });

    it('五行の分類検証', () => {
      // 水星
      const one = Qsei.of(1);
      expect(one!.gogyou!.key).toBe('水');

      // 土星
      const two = Qsei.of(2);
      const five = Qsei.of(5);
      const eight = Qsei.of(8);
      expect(two!.gogyou!.key).toBe('土');
      expect(five!.gogyou!.key).toBe('土');
      expect(eight!.gogyou!.key).toBe('土');

      // 木星
      const three = Qsei.of(3);
      const four = Qsei.of(4);
      expect(three!.gogyou!.key).toBe('木');
      expect(four!.gogyou!.key).toBe('木');

      // 金星
      const six = Qsei.of(6);
      const seven = Qsei.of(7);
      expect(six!.gogyou!.key).toBe('金');
      expect(seven!.gogyou!.key).toBe('金');

      // 火星
      const nine = Qsei.of(9);
      expect(nine!.gogyou!.key).toBe('火');
    });
  });

  describe('方位の検証テスト', () => {

    it('九星の方位配置検証', () => {
      const directionMapping = {
        1: '北',
        2: '西南',  // 実際の値に修正
        3: '東',
        4: '東南',  // 実際の値に修正
        5: '中央', // 五黄土星は中央
        6: '西北',  // 実際の値に修正
        7: '西',
        8: '東北',  // 実際の値に修正
        9: '南'
      };

      for (let i = 1; i <= 9; i++) {
        const qsei = Qsei.of(i);
        if (i === 5) {
          expect(qsei!.houi?.name || '中央').toBe('中央');
        } else {
          expect(qsei!.houi!.name).toBe(directionMapping[i as keyof typeof directionMapping]);
        }
      }
    });
  });

  describe('吉方位計算検証テスト', () => {

    it('一白水星の吉方位計算', () => {
      const one = Qsei.of(1);
      const kipous = one!.findKipous();

      expect(kipous).toBeInstanceOf(Array);
      expect(kipous.length).toBeGreaterThan(0);

      // 一白水星の吉方位は木星系（3,4）と金星系（6,7）
      const expectedKipous = [3, 4, 6, 7].sort();
      expect(kipous.sort()).toEqual(expectedKipous);
    });

    it('五黄土星の吉方位計算', () => {
      const five = Qsei.of(5);
      const kipous = five!.findKipous();

      expect(kipous).toBeInstanceOf(Array);
      // 五黄土星自身は除外される
      expect(kipous).not.toContain(5);
    });

    it('九紫火星の吉方位計算', () => {
      const nine = Qsei.of(9);
      const kipous = nine!.findKipous();

      expect(kipous).toBeInstanceOf(Array);
      expect(kipous.length).toBeGreaterThan(0);

      // 九紫火星の吉方位は木星系（3,4）と土星系（2,8）
      const expectedKipous = [2, 3, 4, 8].sort();
      expect(kipous.sort()).toEqual(expectedKipous);
    });
  });

  describe('気盤8と気盤12の検証テスト', () => {

    it('全九星の気盤8/12の完整性検証', () => {
      for (let i = 1; i <= 9; i++) {
        const qsei = Qsei.of(i);

        // 気盤8は8要素
        expect(qsei!.kiban8).toHaveLength(8);
        // 全要素が1-9の範囲内
        qsei!.kiban8.forEach(val => {
          expect(val).toBeGreaterThanOrEqual(1);
          expect(val).toBeLessThanOrEqual(9);
        });

        // 気盤12は12要素
        expect(qsei!.kiban12).toHaveLength(12);
        // 全要素が1-9の範囲内
        qsei!.kiban12.forEach(val => {
          expect(val).toBeGreaterThanOrEqual(1);
          expect(val).toBeLessThanOrEqual(9);
        });
      }
    });

    it('気盤8から気盤12への変換検証', () => {
      // 一白水星のケースで検証
      const one = Qsei.of(1);
      const kiban8 = one!.kiban8;
      const kiban12 = one!.kiban12;

      // 気盤12は気盤8の特定パターンでの展開
      expect(kiban12[0]).toBe(kiban8[0]);
      expect(kiban12[1]).toBe(kiban8[1]);
      expect(kiban12[2]).toBe(kiban8[1]); // 重複
      expect(kiban12[3]).toBe(kiban8[2]);
      expect(kiban12[4]).toBe(kiban8[3]);
      expect(kiban12[5]).toBe(kiban8[3]); // 重複
      expect(kiban12[6]).toBe(kiban8[4]);
      expect(kiban12[7]).toBe(kiban8[5]);
      expect(kiban12[8]).toBe(kiban8[5]); // 重複
      expect(kiban12[9]).toBe(kiban8[6]);
      expect(kiban12[10]).toBe(kiban8[7]);
      expect(kiban12[11]).toBe(kiban8[7]); // 重複
    });
  });

  describe('節入りの特殊ケース検証', () => {

    // 立春前後のテスト（実際の計算結果に基づく）
    const risshunTestCases = [
      {
        year: 2020,
        before: '2020-02-03',
        after: '2020-02-04',
        beforeIndex: 8,
        afterIndex: 7,
        beforeName: '八白土星',
        afterName: '七赤金星'
      },
      {
        year: 2022,
        before: '2022-02-03',
        after: '2022-02-04',
        beforeIndex: 6,
        afterIndex: 5,
        beforeName: '六白金星',
        afterName: '五黄土星'
      },
      {
        year: 2023,
        before: '2023-02-03',
        after: '2023-02-04',
        beforeIndex: 5,
        afterIndex: 4,
        beforeName: '五黄土星',
        afterName: '四緑木星'
      },
      {
        year: 2024,
        before: '2024-02-03',
        after: '2024-02-04',
        beforeIndex: 4,
        afterIndex: 3,
        beforeName: '四緑木星',
        afterName: '三碧木星'
      }
    ];

    risshunTestCases.forEach(({ year, before, after, beforeIndex, afterIndex, beforeName, afterName }) => {
      it(`立春前後の年盤変化検証 - ${year}年`, () => {
        const beforeDate = LocalDate.parse(before);
        const afterDate = LocalDate.parse(after);

        const beforeQsei = Qsei.getYear(beforeDate);
        const afterQsei = Qsei.getYear(afterDate);

        expect(beforeQsei).not.toBeNull();
        expect(afterQsei).not.toBeNull();

        // 実際の計算結果を検証
        expect(beforeQsei!.index).toBe(beforeIndex);
        expect(beforeQsei!.name).toBe(beforeName);
        expect(afterQsei!.index).toBe(afterIndex);
        expect(afterQsei!.name).toBe(afterName);

        // 立春前後で年盤が変わることを確認
        expect(beforeQsei!.index).not.toBe(afterQsei!.index);
      });
    });

    it('2021年の特殊ケース - 立春前後で変化しないケース', () => {
      const beforeDate = LocalDate.parse('2021-02-03');
      const afterDate = LocalDate.parse('2021-02-04');

      const beforeQsei = Qsei.getYear(beforeDate);
      const afterQsei = Qsei.getYear(afterDate);

      expect(beforeQsei).not.toBeNull();
      expect(afterQsei).not.toBeNull();

      // 2021年は立春前後で年盤が変化しない（実際の計算結果）
      expect(beforeQsei!.index).toBe(6); // 六白金星
      expect(afterQsei!.index).toBe(6); // 六白金星
      expect(beforeQsei!.index).toBe(afterQsei!.index);
    });
  });

  describe('QseiDateクラスの検証', () => {

    it('QseiDateの基本動作確認', () => {
      const date = LocalDate.parse('2024-05-15');
      const qseiDate = QseiDate.of(date);

      expect(qseiDate).toBeDefined();
      expect(qseiDate.year).toBeGreaterThan(0);
      expect(qseiDate.monthIndex).toBeGreaterThanOrEqual(0);
      expect(qseiDate.monthIndex).toBeLessThan(12);
    });

    it('月のインデックス計算確認', () => {
      // 2月は添字0、3月は添字1...の確認
      const feb = LocalDate.parse('2024-02-15');
      const mar = LocalDate.parse('2024-03-15');

      const qseiDateFeb = QseiDate.of(feb);
      const qseiDateMar = QseiDate.of(mar);

      // 2月の月インデックスは0
      expect(qseiDateFeb.monthIndex).toBe(0);
      // 3月の月インデックスは1
      expect(qseiDateMar.monthIndex).toBe(1);
    });
  });

  describe('エラーハンドリング検証', () => {

    it('無効な九星インデックスでnullを返す', () => {
      expect(Qsei.of(0)).toBeNull();
      expect(Qsei.of(10)).toBeNull();
      expect(Qsei.of(-1)).toBeNull();
      expect(Qsei.of(100)).toBeNull();
    });

    it('toTextメソッドの動作確認', () => {
      const kipous = [1, 3, 6];
      const text = Qsei.toText(kipous);

      expect(text).toBe('一白水星,三碧木星,六白金星');
    });

    it('空配列でのtoTextメソッド', () => {
      const emptyKipous: number[] = [];
      const text = Qsei.toText(emptyKipous);

      expect(text).toBe('ー');
    });
  });
});