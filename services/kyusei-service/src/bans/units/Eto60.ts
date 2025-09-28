import Jikan from "./Jikan";
import Eto from "./Eto";

export default class Eto60 {
    private _index: number;
    private _jikan: Jikan;
    private _eto: Eto;

    private constructor(index: number) {
        this._index = index;
        this._jikan = Jikan.of(index);
        this._eto = Eto.of(index);
    }

    get index(): number {
        return this._index;
    }

    get jikan(): Jikan {
        return this._jikan;
    }

    get eto(): Eto {
        return this._eto;
    }

    get name(): string {
        if (!this._jikan || !this._eto) {
            throw new Error(`Eto60 initialization failed: jikan=${this._jikan}, eto=${this._eto}`);
        }
        if (!this._jikan.name || !this._eto.name) {
            throw new Error(`Eto60 name access failed: jikan.name=${this._jikan.name}, eto.name=${this._eto.name}`);
        }
        return this._jikan.name + this._eto.name;
    }

    public static of(index: number): Eto60 {
        return new Eto60(index % 60);
    }
}