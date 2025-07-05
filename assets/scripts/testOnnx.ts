import { _decorator, Component, Node } from 'cc';
import WasmUtil from './onnx-loader';
const { ccclass, property } = _decorator;

@ccclass('testOnnx')
export class testOnnx extends Component {
    private loadSuccess: boolean = false;

    start() {
        WasmUtil.Instance.init().then((success) => {
            if (!success) {
                console.log("init wasm failed");
                return;
            }
            this.loadSuccess = true;
        });
    }

    private tickCount: number = 0;
    private sampleObsData = new Float32Array(1 * 139);
    private sampleActionMasksData = new Float32Array(1 * 1767).fill(1);

    public onClick() {
        if (!this.loadSuccess) {
            return;
        }

        // const sampleObsData = new Float32Array(1 * 139).map(() => Math.random() > 0.7 ? 1.0 : 0.0); // 示例随机数据
        // const sampleActionMasksData = new Float32Array(1 * 1767).map(() => Math.random() > 0.5 ? 1.0 : 0.0); // 示例随机数据 (0或1)

        const sampleObsData = this.sampleObsData;
        const sampleActionMasksData = this.sampleActionMasksData;

        const test = async () => {
            // 保存统计输出的砖块的数量
            const brickCount = new Map<number, number>();
            const maxCount = 1000;

            const startTime = Date.now();

            for (let i = 0; i < maxCount; i++) {
                const recommendPiece = await WasmUtil.Instance.recommendPiece(sampleObsData, sampleActionMasksData);
                brickCount.set(recommendPiece, (brickCount.get(recommendPiece) || 0) + 1);
            }

            // 统计推理总时间及平均时间
            const totalTime = Date.now() - startTime;
            console.log(`${maxCount}次推理时间: ${totalTime}ms, 平均每次: ${(totalTime / maxCount).toFixed(2)}ms`);

            // 在一行中打印统计结果, 按降序排序
            // 统计结果
            // 原始代码
            // const tempMap = [...brickCount.entries()].sort((a, b) => b[1] - a[1]);
            // const brickCountArr = tempMap.map(([key, value]) => `ID:${key}, brickCount:${value}, percent:${(value / maxCount).toFixed(2)}`);

            // 兼容性修改后代码
            const tempArray = [];
            brickCount.forEach(function (value, key) {
                tempArray.push({ key: key, value: value });
            });

            // 手动排序 (降序)
            tempArray.sort(function (a, b) {
                return b.value - a.value;
            });

            // 构建结果数组
            const brickCountArr = [];
            for (let i = 0; i < tempArray.length; i++) {
                const item = tempArray[i];
                const percent = (item.value / maxCount).toFixed(2);
                brickCountArr.push("ID:" + item.key + ", brickCount:" + item.value + ", percent:" + percent);
            }
            console.log("统计结果:\n", brickCountArr);
        }

        test();

    }
}

