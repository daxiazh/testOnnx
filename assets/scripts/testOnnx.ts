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

        WasmUtil.Instance.recommendPiece(sampleObsData, sampleActionMasksData).then((recommendPiece) => {
            console.log(`${this.tickCount++}. recommendPiece: ${recommendPiece}`);
        })
    }
}

