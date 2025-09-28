export default class Config {
    // 吉方位設定ID
    public static readonly SAIDAI = "saidai";
    public static readonly DAIKI = "daiki";
    public static readonly DOUKAI = "doukai";
    public static readonly RINJU_KITI = "rinju_kiti";
    public static readonly TENDO = "tendo";
    public static readonly DAISAN = "daisan";
    public static readonly TAISAI = "taisai";
    public static readonly GEKKEN = "gekken";
    public static readonly NISSIN = "nissin";

    // 凶方位設定ID
    public static readonly GOOU = "goou";
    public static readonly ANKEN = "anken";
    public static readonly HONMEI = "honmei";
    public static readonly GETUMEI = "getumei";
    public static readonly SAIHA = "saiha";
    public static readonly GEPPA = "geppa";
    public static readonly NIPPA = "nippa";
    public static readonly HONMEI_TEKI = "honmei_teki";
    public static readonly GETUMEI_TEKI = "getumei_teki";
    public static readonly KOJI = "koji";
    public static readonly RINJU_KYOU = "rinju_kyou";
    public static readonly TEII_TEKI = "teii_teki";

    public static getEnableId(id: string): string {
        return `enable_${id}`;
    }
}