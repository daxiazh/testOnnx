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
            for (let i = 0; i < maxCount; i++) {
                const recommendPiece = await WasmUtil.Instance.recommendPiece(sampleObsData, sampleActionMasksData);
                brickCount.set(recommendPiece, (brickCount.get(recommendPiece) || 0) + 1);
            }
            
            // 在一行中打印统计结果, 按降序排序
            console.log([...brickCount.entries()].sort((a, b) => b[1] - a[1]).map(([key, value]) => `ID:${key}, brickCount:${value}, percent:${(value / maxCount).toFixed(2)}`));
        }

        test();
        
    }
}

