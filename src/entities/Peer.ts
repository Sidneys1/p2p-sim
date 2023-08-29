import { Entity } from "./Base.js";
import { Point, MouseButton } from "../Types.js";
import { Renderer } from "../Renderer.js";
import { InputManager } from "../modules/InputManager.js";
import { LABEL_FONT } from "../Constants.js";

export enum PeerState {
    'DEAD',
    'BOOTSTRAP',
    'PEERING',
    'ESTABLISHED',
}



export class Peer extends Entity {
    private _font = LABEL_FONT;
    public get Font() {
        return this._font;
    }
    public set Font(value) {
        this._font = value;
        this.textMetrics = Renderer.MeasureText(this._font, this.text)
    }

    private text: string;
    private textMetrics: TextMetrics;
    private halfSize: number;
    private hovered: boolean = false;
    public get Hovered() { return this.hovered; }
    private clicked: boolean = false;
    public state: PeerState;

    constructor(text: string, pos: Point, size: number, state: PeerState = PeerState.BOOTSTRAP) {
        super(pos, [size, size]);
        this.state = state;

        this.halfSize = size;

        this.text = text;

        this.textMetrics = Renderer.MeasureText(this.Font, this.text);
    }

    // SetText(text: string) {
    //     this.text = text;

    //     this.textMetrics = Renderer.MeasureText(this.Font, this.text);
    // }

    Draw(elapsedTime: number): void {
        // console.debug(`Drawing ${this.hovered}`);
        
        // const color: string;
        let color: string;
        let state: string;
        switch (this.state) {
            case PeerState.DEAD:
                color = '#00000088';
                state = '(Dead)';
                break;
            case PeerState.BOOTSTRAP:
                color = 'orange';
                state = '(Bootstrapping)';
                break;
            case PeerState.PEERING:
                color = 'yellow';
                state = '(Peering)';
                break;
            case PeerState.ESTABLISHED:
                color = 'green';
                state = '(Established)';
                break;
            default:
                color = 'magenta';
                state = 'UNKNOWN';
                break;
        }

        Renderer.Ctx.globalAlpha = this.hovered ? 1 : 0.7;

        Renderer.DrawEllipse(color, ...this.Pos, ...this.Size, this.hovered ? 3 : 1);

        if (this.hovered) {
            const textX = this.Pos[0] - (this.textMetrics.width / 2);
            const textY = this.Pos[1] + this.halfSize + this.textMetrics.actualBoundingBoxAscent + 10;
            Renderer.DrawText(color, this.Font, textX, textY, this.text);
            const metric = Renderer.MeasureText(this.Font, state);
            Renderer.DrawText(color, this.Font, this.Pos[0] - (metric.width / 2), textY + 20, state);
        }

        Renderer.Ctx.globalAlpha = 1;
    }

    Update(elapsedTime: number): void {
        if (!this.Enabled) {
            // console.debug('Peer disabled...')
            return;
        }
        // console.debug('Updating peer...')

        const mouse = InputManager.S.MousePos();
        this.hovered = mouse[0] >= (this.Pos[0] - this.halfSize)
            && mouse[0] < (this.Pos[0] + this.halfSize)
            && mouse[1] >= (this.Pos[1] - this.halfSize)
            && mouse[1] < (this.Pos[1] + this.halfSize);

        // console.debug(`Hovered: ${this.hovered}`)

        if (!this.hovered) {
            this.clicked = false;
            return;
        }

        const lastClicked = this.clicked;
        this.clicked = InputManager.S.MouseButton(MouseButton.Left);

        // if (lastClicked && !this.clicked) {
        //     if (this.clickCallback !== undefined)
        //         this.clickCallback();
        // }
    }
}
