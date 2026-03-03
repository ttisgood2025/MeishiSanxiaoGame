import {
    _decorator,
    Color,
    Component,
    EventTarget,
    Label,
    Node,
    UITransform,
    Vec3,
} from 'cc';

const { ccclass } = _decorator;

@ccclass('BootStatusView')
export class BootStatusView extends Component {
    private eventBus: EventTarget | null = null;

    private statusLabel: Label | null = null;
    private slotLabel: Label | null = null;
    private boardLabel: Label | null = null;

    private restartButtonLabel: Label | null = null;
    private nextButtonLabel: Label | null = null;

    public init(eventBus: EventTarget): void {
        this.eventBus = eventBus;
        this.ensureViewNodes();
        this.bindEvents();
    }

    private ensureViewNodes(): void {
        if (!this.statusLabel) {
            this.statusLabel = this.createText('StatusLabel', new Vec3(0, 280, 0), '状态：等待中', 26);
        }

        if (!this.boardLabel) {
            this.boardLabel = this.createText('BoardLabel', new Vec3(-220, -180, 0), '剩余牌：0', 22);
        }

        if (!this.slotLabel) {
            this.slotLabel = this.createText('SlotLabel', new Vec3(-220, -230, 0), '槽位：[]', 22);
        }

        if (!this.restartButtonLabel) {
            this.restartButtonLabel = this.createText('RestartButton', new Vec3(160, -180, 0), '[重开]', 24, true);
            this.restartButtonLabel.node.on(Node.EventType.TOUCH_END, () => {
                this.eventBus?.emit('ui:restart');
            });
        }

        if (!this.nextButtonLabel) {
            this.nextButtonLabel = this.createText('NextButton', new Vec3(160, -230, 0), '[下一关]', 24, true);
            this.nextButtonLabel.node.on(Node.EventType.TOUCH_END, () => {
                this.eventBus?.emit('ui:next-level');
            });
        }
    }

    private bindEvents(): void {
        if (!this.eventBus) {
            return;
        }

        this.eventBus.off('ui:status-message', this.onStatusMessage, this);
        this.eventBus.off('game:slot-updated', this.onSlotUpdated, this);
        this.eventBus.off('game:board-updated', this.onBoardUpdated, this);
        this.eventBus.off('game:state', this.onGameState, this);

        this.eventBus.on('ui:status-message', this.onStatusMessage, this);
        this.eventBus.on('game:slot-updated', this.onSlotUpdated, this);
        this.eventBus.on('game:board-updated', this.onBoardUpdated, this);
        this.eventBus.on('game:state', this.onGameState, this);
    }

    private onStatusMessage(message: string): void {
        if (!this.statusLabel) {
            return;
        }

        this.statusLabel.string = `状态：${message}`;
    }

    private onSlotUpdated(payload: { values: number[]; capacity: number }): void {
        if (!this.slotLabel) {
            return;
        }

        this.slotLabel.string = `槽位： [${payload.values.join(', ')}] / ${payload.capacity}`;
    }

    private onBoardUpdated(payload: { remainingTiles: number }): void {
        if (!this.boardLabel) {
            return;
        }

        this.boardLabel.string = `剩余牌：${payload.remainingTiles}`;
    }

    private onGameState(payload: { isGameOver: boolean; canNext: boolean }): void {
        if (!this.nextButtonLabel || !this.restartButtonLabel) {
            return;
        }

        this.restartButtonLabel.color = payload.isGameOver ? new Color(255, 245, 100) : new Color(170, 170, 170);
        this.nextButtonLabel.color = payload.canNext ? new Color(120, 255, 120) : new Color(170, 170, 170);
    }

    private createText(name: string, position: Vec3, content: string, size: number, clickable = false): Label {
        const node = new Node(name);
        node.parent = this.node;
        node.setPosition(position);

        const transform = node.addComponent(UITransform);
        transform.setContentSize(clickable ? 140 : 420, 46);

        const label = node.addComponent(Label);
        label.string = content;
        label.fontSize = size;
        label.color = clickable ? new Color(180, 180, 180, 255) : new Color(255, 255, 255, 255);

        return label;
    }

    protected onDestroy(): void {
        if (!this.eventBus) {
            return;
        }

        this.eventBus.off('ui:status-message', this.onStatusMessage, this);
        this.eventBus.off('game:slot-updated', this.onSlotUpdated, this);
        this.eventBus.off('game:board-updated', this.onBoardUpdated, this);
        this.eventBus.off('game:state', this.onGameState, this);
    }
}
