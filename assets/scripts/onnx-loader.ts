import { AssetManager, assetManager } from "cc";
// import * as ort from "./ort.wasm.bundle.mjs";
import * as ort from "./ort.wasm-core.mjs";
import PlatformUtils, { Platform } from "./platform-utils";
import { DEBUG } from "cc/env";

/**
 * 声明微信的Wasm接口
 */
declare namespace WXWebAssembly {
    function instantiate(
        path: string,
        importObject?: WebAssembly.Imports
    ): Promise<WebAssembly.WebAssemblyInstantiatedSource>;
}

// wasm文件名
const onnxFileName = "PiecesRecommend-428-lr_3e-3_kayer3_hu_16_bs1024";
// const onnxFileName = "PiecesRecommend-429";

// wasm所在子包名
const subpackageName = "onnx_runtime";

// wasm文件名
const wasmName = "ort-wasm";

/**
 * 微信比较版本的函数, 见: https://developers.weixin.qq.com/minigame/dev/guide/runtime/client-lib/compatibility.html
 * @param v1 {string} 指定参与比较的版本号, 字符串
 * @param v2 {string} 指定参与比较的版本号, 字符串
 * @returns 如果 v1 >= v2, 则返回一个大于等于0的值
 */
function wxCompareVersion(v1, v2) {
    v1 = v1.split(".");
    v2 = v2.split(".");
    const len = Math.max(v1.length, v2.length);

    while (v1.length < len) {
        v1.push("0");
    }
    while (v2.length < len) {
        v2.push("0");
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i]);
        const num2 = parseInt(v2[i]);

        if (num1 > num2) {
            return 1;
        } else if (num1 < num2) {
            return -1;
        }
    }

    return 0;
}

// 声明 wx 全局变量
declare const wx: any;

/**
 * Wasm 的辅助类
 */
export default class WasmUtil {
    public static readonly Instance: WasmUtil = new WasmUtil();

    /**
     * 推理模型会话
     */
    private inferenceSession: any = null;

    /**
     * 观察数据的 Tensor
     */
    private obs0Tensor: any = null;

    /**
     * 动作掩码 Tensor
     */
    private actionMasksTensor: any = null;

    /**
     * 模型的输入数据
     */
    private inputFeed: { obs_0: any; action_masks: any };

    // 当前的错误
    private mError: string = "";

    /**
     * 记录释放 wasm 资源的函数
     */
    private releaseWasmFunction: () => void = null;

    public get Err(): string {
        return this.mError;
    }

    /**
     * 返回当前平台是否支持 wasm
     */
    private supportWasm(): boolean {
        if (typeof globalThis !== "object") return false;

        const currentPlatfrom = PlatformUtils.getPlatform();
        if (currentPlatfrom == Platform.web) return true;

        if (currentPlatfrom == Platform.wx) {
            const version = wx.getSystemInfoSync().SDKVersion;
            if (
                wxCompareVersion(version, "2.15.0") >= 0 &&
                globalThis.WXWebAssembly
            ) {
                // 微信只在 2.13.0以上才支持 wasm
                return true;
            }
            return false;
        }

        return false;
    }

    /**
     * 初始化真正的 wasm 库
     * @returns
     */
    private async initWasm() {
        const currentPlatform = PlatformUtils.getPlatform();

        if (false && DEBUG) {
            ort.env.logLevel = "verbose";
            ort.env.debug = true;
            ort.env.trace = true;
        }

        console.log("使用的 Model: ", onnxFileName);

        // 先加载子包, 因为我们的资源都在子包中
        const bundle = await this.loadSubpackage();
        
        // 加载 wasm 文件, 注意: 在小游戏平台, 因为子包原因, 我们实际上加载不到 wasm 文件内容, 只能使用它的路径
        const wasmAssetInfo = await this.loadWasmAsset(bundle);

        const wasmPath = bundle.getInfoWithPath(wasmName);

        ort.env.wasm.simd = false;
        ort.env.wasm.numThreads = 1;

        // hack: 用于当上层的 Wasm 加载失败时, 通知底层 Wasm 加载失败
        const readyPromiseRejectWrapper = { value: (e) => { } };
        ort.env.wasm.readyPromiseRejectWrapper = readyPromiseRejectWrapper;

        switch (currentPlatform) {
            case Platform.wx: {
                // 微信平台, 只能通过微信支持的路径来加载 wasm

                console.log("开始实例化 wasm");
                ort.env.wasm.instantiateWasm = (imports, successCallback) => {                    
                    WXWebAssembly
                        // 注意: 这里的路径是指微信中的路径, 不是 cocos creator 中的路径, 即打包后的路径
                        .instantiate(wasmAssetInfo.url, imports)
                        .then((result) => {
                            console.log("加载wasm成功");
                            successCallback(result.instance);
                        })
                        .catch((reason) => {
                            console.error("加载wasm失败: ", reason);
                            this.mError = "1." + reason.toString();
                            throw new Error(this.mError);
                        });
                };

                // 微信平台不支持 performance.timeOrigin, 但onnx 需要, 所以我们 hack 一下
                if (performance.timeOrigin == undefined) {
                    (performance as any).timeOrigin = 0;
                }
                break;
            }

            case Platform.web: {
                // web 平台
                // 设置 ort 相关参数, 让 onnxruntime-web 可以正常加载 wasm
                wasmAssetInfo.wasm;            
                ort.env.wasm.instantiateWasm = (imports, successCallback) => {
                    WebAssembly.instantiate(wasmAssetInfo.wasm, imports)
                        .then((result) => {
                            successCallback(result["instance"]);
                        })
                        .catch((reason) => {
                            readyPromiseRejectWrapper.value(reason);
                        });
                }
                break;
            }
            default: {
                // 其他平台, 不支持 Wasm, 只能使用服务器处理砖块的推荐
                // TODO: 设置连接服务器的函数?? 连接服务器???
                console.error("当前平台不支持 Wasm, 只能使用服务器处理砖块的推荐, 目前还没有实现这个功能");

                return true;
            }
        }

        // 加载 ort 模型文件
        const ortModelData = await this.loadOrtAsset(bundle);

        // 释放 wasm 资源
        if (this.releaseWasmFunction) {
            this.releaseWasmFunction();
            this.releaseWasmFunction = null;
        }

        // 创建模型 session. TODO: 加载失败的处理???
        this.inferenceSession = await ort.InferenceSession.create(ortModelData);

        // 创建对应的 Tensor, 这里必须与模型保持一致
        const obs0Shape = [1, 139];
        const actionMasksShape = [1, 1767];

        // 数据数量必须与形状的乘积匹配
        const sampleObsData = new Float32Array(1 * 139); // 示例随机数据
        const sampleActionMasksData = new Float32Array(1 * 1767); // 示例随机数据 (0或1)

        this.obs0Tensor = new ort.Tensor("float32", sampleObsData, obs0Shape);
        this.actionMasksTensor = new ort.Tensor(
            "float32",
            sampleActionMasksData,
            actionMasksShape
        );

        // 推理的输入数据
        this.inputFeed = {
            obs_0: this.obs0Tensor,
            action_masks: this.actionMasksTensor,
        };

        // 释放资源包
        assetManager.removeBundle(bundle);

        //if (DEBUG) {
        console.log("[OnnxLoader] init success");
        //}
        return true;
    }

    /**
     * 初始化 Wasm
     */
    public async init(): Promise<boolean> {
        if (!(await this.initWasm())) {
            console.error("init wasm failed, 这是非常严重的错误!");
            return false;
        }
        return true;
    }

    /**
     * 由传入的观察数据与 action mask 数据来进行模型推理, 推理下一个砖块索引
     * @param obsData 观察数据
     * @param actionMasksData action mask 数据
     */
    public async recommendPiece(
        obsData: Float32Array,
        actionMasksData: Float32Array
    ): Promise<number> {
        // 检查长度是否匹配
        if (obsData.length !== this.obs0Tensor.data.length) {
            throw new Error(
                `推理时, 传入的 obs 数据长度不匹配！期望 ${this.obs0Tensor.data.length}，实际 ${obsData.length}`
            );
        }

        if (actionMasksData.length !== this.actionMasksTensor.data.length) {
            throw new Error(
                `推理时, 传入的 action mask 数据长度不匹配！期望 ${this.actionMasksTensor.data.length}，实际 ${actionMasksData.length}`
            );
        }

        // 更新 Tensor 数据
        this.obs0Tensor.data.set(obsData);
        this.actionMasksTensor.data.set(actionMasksData);

        // 开始推理
        const startTime = performance.now();
        const results = await this.inferenceSession.run(this.inputFeed);
        const duration = performance.now() - startTime;
        // console.log(`推理耗时: ${duration} ms`);
        const discreteActionsOutput = results["discrete_actions"];
        return discreteActionsOutput.data[0];
    }

    /**
     * 释放 Wasm
     */
    public async release() {
        await this.inferenceSession?.release();
        this.inferenceSession = null;
    }

    /**
     * 加载 Wasm 资源
     * @returns 是否加载成功
     */
    private async loadWasmAsset(bundle: AssetManager.Bundle): Promise<{ url: string; wasm: ArrayBuffer }> {
        // 注册 wasm 文件的加载器
        this.registerWasmFileLoader();
        return await new Promise(
            (resolve, reject) => {
                bundle.load(wasmName, (err, asset) => {
                    if (err) {
                        console.error(
                            "加载 onnxRuntime WASM 模块失败: ",
                            err
                        );
                        reject(err);
                    } else {
                        console.log("加载 onnxRuntime WASM 模块成功");
                        resolve(asset.nativeAsset);

                        // 注释释放 Wasm 函数
                        this.releaseWasmFunction = () => {
                            assetManager.releaseAsset(asset);
                        };
                    }
                });
            }
        );
    }

    /**
     * 加载 Wasm 所在的子包, 因为 wasm 一般比较大, 所以我们需要把它们放在子包中
     * @returns
     */
    private loadSubpackage(): Promise<AssetManager.Bundle> {
        return new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(subpackageName, (err, bundle) => {
                if (err) {
                    console.error("加载 onnxRuntime Bundle 失败: ", err);
                    reject(err);
                    return;
                } else {
                    resolve(bundle);
                }
            });
        });
    }

    /**
     * 加载 Ort 模型文件
     * @returns
     */
    private loadOrtAsset(bundle: AssetManager.Bundle): Promise<Uint8Array | null> {
        return new Promise<Uint8Array | null>((resolve, reject) => {
            bundle.load(onnxFileName, (err, asset) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    resolve(new Uint8Array((asset as any).buffer()));
                }
            });
        });
    }

    /**
     * 注册 wasm 文件的加载器
     */
    private registerWasmFileLoader(): void {
        const binDownloader = assetManager.downloader["_downloaders"][".bin"];

        // 因为 cocos 不能简单的支持任意的扩展文件类型, 但微信小游戏又需要特定的文件后缀, 所以我们需要自己来处理这块的加载
        assetManager.downloader.register(
            ".wasm",
            (url, options, onComplete) => {
                binDownloader(url, options, (err, data) => {
                    onComplete(err, { url, wasm: data });
                });
            }
        );

        assetManager.parser.register(".wasm", (file, options, onComplete) => {
            // console.log(file);
            onComplete(undefined, file);
        });
    }
}
