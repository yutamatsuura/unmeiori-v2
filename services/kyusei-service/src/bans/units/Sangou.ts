import Eto from "./Eto";
import Houi from "./Houi";

export default class Sangou {
    public static readonly SHIN_SHEN_TATSU = new Sangou("申子辰", [Eto.SARU, Eto.NE, Eto.TATU]);
    public static readonly SHEN_UMA_INU = new Sangou("寅午戌", [Eto.TORA, Eto.UMA, Eto.INU]);
    public static readonly SHI_YU_USHI = new Sangou("巳酉丑", [Eto.MI, Eto.TORI, Eto.USHI]);
    public static readonly GAI_BO_HITSUJI = new Sangou("亥卯未", [Eto.INO, Eto.USA, Eto.HITUJI]);

    private static readonly SANGOUS = [
        Sangou.SHIN_SHEN_TATSU,
        Sangou.SHEN_UMA_INU,
        Sangou.SHI_YU_USHI,
        Sangou.GAI_BO_HITSUJI
    ];

    private _name: string;
    private _etos: Eto[];

    private constructor(name: string, etos: Eto[]) {
        this._name = name;
        this._etos = etos;
    }

    get name(): string {
        return this._name;
    }

    get etos(): Eto[] {
        return this._etos;
    }

    get houi(): Houi {
        // 大三合の方位を返す（中央の干支の方位）
        return this._etos[1].houi;
    }

    public static ofDaisangou(eto: Eto): Sangou {
        for (const sangou of Sangou.SANGOUS) {
            if (sangou._etos.includes(eto)) {
                return sangou;
            }
        }
        throw new Error(`Sangou not found for eto: ${eto.name}`);
    }
}