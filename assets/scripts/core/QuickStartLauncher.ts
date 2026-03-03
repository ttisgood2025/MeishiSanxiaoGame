import {
    _decorator,
    Director,
    Canvas,
    Color,
    Component,
    EventTarget,
    JsonAsset,
    Label,
    Node,
    director,
    find,
    resources,
    UITransform,
    Vec3,
} from 'cc';
import { BootStatusView } from '../ui/BootStatusView';

const { ccclass, property } = _decorator;

interface TileState {
    id: number;
    type: number;
    node: Node;
    removed: boolean;
}

export interface LevelData {
    id: string;
    tiles: number[];
    slotCapacity: number;
}

@ccclass('QuickStartLauncher')
export class QuickStartLauncher extends Component {
    @property({ tooltip: '资源目录下的关卡 JSON 路径，不含扩展名。' })
    public levelPath = 'levels/level-001';

    @property(Label)
    public statusLabel: Label | null = null;

    private readonly gameEvents = new EventTarget();

    private readonly fallbackLevel: LevelData = {
        id: 'builtin-fallback',
        tiles: [1, 1, 1, 2, 2, 2, 3, 3, 3],
        slotCapacity: 7,
    };

    private bootStatusView: BootStatusView | null = null;
    private boardRoot: Node | null = null;
    private slotRoot: Node | null = null;

    private currentLevelPath = '';
    private currentLevelData: LevelData | null = null;
    private tileStates: TileState[] = [];
    private slotValues: number[] = [];
    private currentSlotCapacity = 7;
    private isGameOver = false;

    protected start(): void {
        this.currentLevelPath = this.levelPath;
        this.ensureCanvasRoot();
        this.ensureUiBridge();
        this.bindUiActions();

        this.bootstrap(this.currentLevelPath).catch((error: unknown) => {
            this.broadcastStatus(`启动失败：${String(error)}`);
            console.error('[QuickStartLauncher] bootstrap failed', error);
        });
    }


    private ensureCanvasRoot(): void {
        if (this.node.getComponent(Canvas)) {
            return;
        }

        const scene = director.getScene();
        const canvasNode = find('Canvas', scene ?? undefined);
        if (canvasNode) {
            this.node.setParent(canvasNode);
            console.warn('[QuickStartLauncher] 未挂到 Canvas，已自动迁移到 Canvas 节点。');
            return;
        }

        const fallbackCanvas = new Node('Canvas');
        fallbackCanvas.addComponent(Canvas);
        fallbackCanvas.addComponent(UITransform).setContentSize(720, 1280);
        if (scene) {
            fallbackCanvas.setParent(scene);
        }
        this.node.setParent(fallbackCanvas);
        console.warn('[QuickStartLauncher] 场景缺少 Canvas，已自动创建最小 Canvas。');
    }
    private ensureUiBridge(): void {
        this.bootStatusView = this.getComponent(BootStatusView) ?? this.addComponent(BootStatusView);
        this.bootStatusView.init(this.gameEvents);
    }

    private bindUiActions(): void {
        this.gameEvents.on('ui:restart', this.handleRestart, this);
        this.gameEvents.on('ui:next-level', this.handleNextLevel, this);
    }

    private async bootstrap(levelPath: string): Promise<void> {
        this.broadcastStatus('初始化中...');
        this.clearRuntimeNodes();
        this.resetRoundState();

        const level = await this.loadLevelWithFallback(levelPath);
        this.currentLevelData = level;
        this.currentSlotCapacity = level.slotCapacity;

        this.setupBoard(level);
        this.setupSlot();
        this.refreshAllViews();

        this.broadcastStatus(`关卡 ${level.id}：点击牌面入槽，凑齐三个自动消除。`);
        console.info('[QuickStartLauncher] level ready', level);
    }

    private clearRuntimeNodes(): void {
        this.boardRoot?.destroy();
        this.slotRoot?.destroy();
        this.boardRoot = null;
        this.slotRoot = null;
    }

    private resetRoundState(): void {
        this.tileStates = [];
        this.slotValues = [];
        this.isGameOver = false;
    }

    private setupBoard(level: LevelData): void {
        const board = new Node('BoardRoot');
        board.parent = this.node;
        this.boardRoot = board;

        const startX = -220;
        const startY = 120;
        const colCount = 3;
        const spacingX = 150;
        const spacingY = 90;

        level.tiles.forEach((type, index) => {
            const tile = new Node(`Tile-${index}`);
            tile.parent = board;

            const transform = tile.addComponent(UITransform);
            transform.setContentSize(120, 70);

            const label = tile.addComponent(Label);
            label.string = `牌 ${type}`;
            label.fontSize = 28;
            label.color = new Color(255, 255, 255, 255);

            const col = index % colCount;
            const row = Math.floor(index / colCount);
            tile.setPosition(new Vec3(startX + col * spacingX, startY - row * spacingY, 0));

            const tileState: TileState = {
                id: index,
                type,
                node: tile,
                removed: false,
            };

            tile.on(Node.EventType.TOUCH_END, () => this.onTileClicked(tileState.id));
            this.tileStates.push(tileState);
        });
    }

    private setupSlot(): void {
        const slot = new Node('SlotRoot');
        slot.parent = this.node;
        this.slotRoot = slot;
    }

    private onTileClicked(tileId: number): void {
        if (this.isGameOver) {
            return;
        }

        const tile = this.tileStates.find((item) => item.id === tileId);
        if (!tile || tile.removed) {
            return;
        }

        tile.removed = true;
        tile.node.active = false;

        this.slotValues.push(tile.type);
        const eliminated = this.resolveTriples();

        if (this.checkWin()) {
            this.onWin();
            return;
        }

        if (!eliminated && this.slotValues.length >= this.currentSlotCapacity) {
            this.onFail();
            return;
        }

        this.refreshAllViews();
    }

    private resolveTriples(): boolean {
        const counter = new Map<number, number>();
        this.slotValues.forEach((value) => counter.set(value, (counter.get(value) ?? 0) + 1));

        let eliminated = false;
        counter.forEach((count, value) => {
            if (count < 3) {
                return;
            }

            let remain = 3;
            this.slotValues = this.slotValues.filter((slotValue) => {
                if (slotValue === value && remain > 0) {
                    remain -= 1;
                    eliminated = true;
                    return false;
                }
                return true;
            });
        });

        return eliminated;
    }

    private checkWin(): boolean {
        const allPicked = this.tileStates.every((tile) => tile.removed);
        return allPicked && this.slotValues.length === 0;
    }

    private onWin(): void {
        this.isGameOver = true;
        this.refreshAllViews();
        this.broadcastStatus(`胜利：${this.currentLevelData?.id ?? 'unknown'}，可点击“下一关”。`);
        this.gameEvents.emit('game:state', { isGameOver: true, canNext: true });
    }

    private onFail(): void {
        this.isGameOver = true;
        this.refreshAllViews();
        this.broadcastStatus('失败：槽位已满，点击“重开”继续。');
        this.gameEvents.emit('game:state', { isGameOver: true, canNext: false });
    }

    private refreshAllViews(): void {
        this.gameEvents.emit('game:slot-updated', {
            values: [...this.slotValues],
            capacity: this.currentSlotCapacity,
        });

        const remain = this.tileStates.filter((tile) => !tile.removed).length;
        this.gameEvents.emit('game:board-updated', { remainingTiles: remain });
    }

    private handleRestart(): void {
        this.bootstrap(this.currentLevelPath).catch((error: unknown) => {
            this.broadcastStatus(`重开失败：${String(error)}`);
        });
    }

    private handleNextLevel(): void {
        if (!this.isGameOver) {
            return;
        }

        const nextPath = this.getNextLevelPath(this.currentLevelPath);
        this.currentLevelPath = nextPath;

        this.bootstrap(nextPath).catch((error: unknown) => {
            this.broadcastStatus(`下一关失败：${String(error)}`);
        });
    }

    private getNextLevelPath(path: string): string {
        const matched = path.match(/(.*?)(\d+)$/);
        if (!matched) {
            return this.levelPath;
        }

        const prefix = matched[1];
        const currentNo = Number(matched[2]);
        const nextNo = currentNo + 1;
        const nextPath = `${prefix}${String(nextNo).padStart(matched[2].length, '0')}`;
        return nextPath;
    }

    private loadLevelWithFallback(path: string): Promise<LevelData> {
        return new Promise((resolve) => {
            resources.load(path, JsonAsset, (error, jsonAsset) => {
                if (error || !jsonAsset) {
                    console.warn(`[QuickStartLauncher] 资源加载失败，切换内置关卡：${path}`, error);
                    resolve(this.fallbackLevel);
                    return;
                }

                const parsed = this.normalizeLevelData(jsonAsset.json as Record<string, unknown>);
                resolve(parsed);
            });
        });
    }

    private normalizeLevelData(raw: Record<string, unknown>): LevelData {
        const id = typeof raw.id === 'string' ? raw.id : 'unknown-level';
        const tiles = Array.isArray(raw.tiles)
            ? raw.tiles.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0)
            : [];

        const slotCapacityValue = Number(raw.slotCapacity);
        const safeCapacity = Number.isFinite(slotCapacityValue) && slotCapacityValue > 0
            ? Math.floor(slotCapacityValue)
            : this.currentSlotCapacity;

        if (tiles.length === 0) {
            return this.fallbackLevel;
        }

        return {
            id,
            tiles,
            slotCapacity: safeCapacity,
        };
    }

    private broadcastStatus(message: string): void {
        this.setStatus(message);
        this.gameEvents.emit('ui:status-message', message);
    }

    private setStatus(message: string): void {
        if (this.statusLabel) {
            this.statusLabel.string = message;
        }
    }
}


const AUTO_LAUNCHER_NODE = '__AutoQuickStartLauncher__';

function ensureAutoLauncherMounted(): void {
    const scene = director.getScene();
    if (!scene) {
        return;
    }

    const existing = scene.getComponentsInChildren(QuickStartLauncher);
    if (existing.length > 0) {
        return;
    }

    const canvasNode = find('Canvas', scene) ?? (() => {
        const canvas = new Node('Canvas');
        canvas.addComponent(Canvas);
        canvas.addComponent(UITransform).setContentSize(720, 1280);
        canvas.setParent(scene);
        return canvas;
    })();

    const launcherNode = new Node(AUTO_LAUNCHER_NODE);
    launcherNode.setParent(canvasNode);
    launcherNode.addComponent(QuickStartLauncher);
    console.warn('[QuickStartLauncher] 未检测到挂载实例，已自动创建启动节点。');
}

director.on(Director.EVENT_AFTER_SCENE_LAUNCH, ensureAutoLauncherMounted);
if (director.getScene()) {
    ensureAutoLauncherMounted();
}
