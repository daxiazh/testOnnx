// SDK 支持的平台, 不要随意修改这些值, 因为服务器同步使用了
export enum Platform {
    invalid = -1, // 无效值
    web = 0, // 网页 h5
    android = 1, // 原生安卓
    ios = 2, // 原生 ios
    wx = 3, // 微信小游戏
    tt = 4, // 字节小游戏（支持不全）
    oppo = 5, // oppo 小游戏
    vivo = 6, // vivo 小游戏
    qq = 7, // qq 小游戏
    ks = 8, // 快手 小游戏
    hw = 9, // 华为 小游戏
    alipay = 10, // 支付宝 小游戏
    xhs = 11, // 小红书 小游戏
}

/**
 * 游戏平台判断工具
 */
export default class PlatformUtils {
    // 获取平台信息
    public static isPlatform(platform: Platform): boolean {
        //@ts-ignore
        const isKs = typeof KSGameGlobal != "undefined";
        //@ts-ignore
        const isQQ = typeof qq != "undefined";
        //@ts-ignore
        const isXhs = typeof wx !== 'undefined' && typeof xhs !== 'undefined';
        switch (platform) {
            case Platform.android:
                if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
                    return true;
                }
                return false;
            case Platform.ios:
                if (cc.sys.isNative && (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD)) {
                    return true;
                }
                return false;
            case Platform.tt:
                if (cc.sys.platform == cc.sys.BYTEDANCE_GAME) {
                    return true;
                }
                return false;
            case Platform.oppo:
                if (cc.sys.platform == cc.sys.OPPO_GAME) {
                    return true;
                }
                return false;
            case Platform.vivo:
                if (cc.sys.platform == cc.sys.VIVO_GAME) {
                    return true;
                }
                return false;
            case Platform.ks:
                if (isKs) {
                    return true;
                }
                return false;
            case Platform.xhs:
                if (isXhs) {
                    return true;
                }
                return false;
            case Platform.qq:
                //qq平台的 cc.sys.platform 与微信相同
                if (cc.sys.platform == cc.sys.WECHAT_GAME && isQQ && !isKs && !isXhs) {
                    return true;
                }
                return false;
            case Platform.wx:
                //qq平台的 cc.sys.platform 与微信相同
                if (cc.sys.platform == cc.sys.WECHAT_GAME && !isQQ && !isKs && !isXhs) {
                    return true;
                }
                return false;
            case Platform.web:
                return cc.sys.isBrowser;
            case Platform.hw:
                if (cc.sys.platform == cc.sys.HUAWEI_GAME) {
                    return true;
                }
                return false;
            case Platform.alipay:
                if (cc.sys.platform == cc.sys.ALIPAY_GAME) {
                    return true;
                }
                return false;
        }
        return false;
    }

    // 当前的平台类型
    private static mCurrentPlatform: Platform = Platform.invalid;

    // 获取当前平台类型
    public static getPlatform(): Platform {
        if (PlatformUtils.mCurrentPlatform != Platform.invalid) return PlatformUtils.mCurrentPlatform;

        PlatformUtils.mCurrentPlatform = (function () {
            const platforms = Object.keys(Platform).filter((v) => !isNaN(Number(v)));
            for (const platformStr of platforms) {
                const platform = parseInt(platformStr);
                if (PlatformUtils.isPlatform(platform)) return platform;
            }

            cc.error(`获取不到正确的平台类型, 将使用默认的值 Platform.web !!!`);
            return Platform.web;
        })();

        return PlatformUtils.mCurrentPlatform;
    }

    /** 是否可以保存图到相册 */
    public static canSavePngToAlbum() {
        return PlatformUtils.isPlatform(Platform.wx)
            || PlatformUtils.isPlatform(Platform.tt)
            || PlatformUtils.isPlatform(Platform.qq)
            || PlatformUtils.isPlatform(Platform.oppo);
    }

    public static isPrivacyUser() {
        if (
            PlatformUtils.isPlatform(Platform.oppo) ||
            PlatformUtils.isPlatform(Platform.vivo) ||
            PlatformUtils.isPlatform(Platform.qq) ||
            PlatformUtils.isPlatform(Platform.android) ||
            PlatformUtils.isPlatform(Platform.ios) ||
            PlatformUtils.isPlatform(Platform.hw) ||
            PlatformUtils.isPlatform(Platform.tt) ||
            PlatformUtils.isPlatform(Platform.web)
        ) {
            return true;
        }
        return false;
    }

    public static isPrivacyUserSet() {
        return true;
    }

    /** 是否是指分包 */
    public static supportSubPackage(): boolean {
        return PlatformUtils.isPlatform(Platform.wx);
    }
}
