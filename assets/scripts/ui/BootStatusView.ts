import { _decorator, Component, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BootStatusView')
export class BootStatusView extends Component {
    @property(Label)
    public statusLabel: Label | null = null;

    public setMessage(message: string): void {
        if (!this.statusLabel) {
            return;
        }

        this.statusLabel.string = message;
    }
}
