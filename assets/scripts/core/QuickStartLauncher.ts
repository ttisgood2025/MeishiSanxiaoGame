import { _decorator, Component, JsonAsset, Label, resources } from 'cc';

const { ccclass, property } = _decorator;

export interface LevelData {
    id: string;
    grid: number[][];
    goalScore: number;
}

@ccclass('QuickStartLauncher')
export class QuickStartLauncher extends Component {
    @property({ tooltip: '资源目录下的关卡 JSON 路径，不含扩展名。' })
    public levelPath = 'levels/level-001';

    @property(Label)
    public statusLabel: Label | null = null;

    private readonly fallbackLevel: LevelData = {
        id: 'builtin-fallback',
        grid: [
            [1, 2, 3],
            [2, 3, 1],
            [3, 1, 2],
        ],
        goalScore: 300,
    };

    protected start(): void {
        this.bootstrap().catch((error: unknown) => {
            this.setStatus(`启动失败：${String(error)}`);
            console.error('[QuickStartLauncher] bootstrap failed', error);
        });
    }

    private async bootstrap(): Promise<void> {
        this.setStatus('初始化中...');
        const level = await this.loadLevelWithFallback(this.levelPath);

        // TODO(phase-2): 在这里注入真实 GameDirector / UI Flow。
        this.setStatus(`骨架就绪，关卡：${level.id}`);
        console.info('[QuickStartLauncher] loaded level', level);
    }

    private loadLevelWithFallback(path: string): Promise<LevelData> {
        return new Promise((resolve) => {
            resources.load(path, JsonAsset, (error, jsonAsset) => {
                if (error || !jsonAsset) {
                    console.warn(`[QuickStartLauncher] 资源加载失败，切换内置关卡：${path}`, error);
                    resolve(this.fallbackLevel);
                    return;
                }

                const data = jsonAsset.json as LevelData;
                resolve(data);
            });
        });
    }

    private setStatus(message: string): void {
        if (this.statusLabel) {
            this.statusLabel.string = message;
        }
    }
}
