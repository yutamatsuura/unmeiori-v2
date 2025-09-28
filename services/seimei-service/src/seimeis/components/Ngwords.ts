export default class Ngwords {
    private _word: string;
    private _reason: string;

    constructor(word: string, reason: string) {
        this._word = word;
        this._reason = reason;
    }

    get word(): string {
        return this._word;
    }

    get reason(): string {
        return this._reason;
    }
}