import { IGame } from '../Interfaces.js'
import { DrawableGameModule } from "../GameModule.js";
import { DEBUG_FONT } from '../Constants.js';
import { Point } from '../Types.js';
import { Renderer } from '../Renderer.js';
import { InputManager } from './InputManager.js';

export class DebugModule extends DrawableGameModule {
    Fps: number = NaN;

    private _game: IGame;
    private totalFrames: number = 0;
    private elapsedTime: number = 0;
    private textHeight: number;

    public Extras: (() => string)[] = [];
    
    public static S?: DebugModule;

    constructor(game: IGame) {
        super(false, -9999, -9999);

        this._game = game;

        this.textHeight = 10 + Renderer.MeasureText(DEBUG_FONT, "0").actualBoundingBoxAscent;

        DebugModule.S = this;
    }

    Draw(_: number): void {
        this.totalFrames++;

        const ctx = Renderer.Ctx;
        for (const entity of this._game.State?.Entities ?? []) {
            Renderer.FillCircle('red', entity.Pos[0], entity.Pos[1], 3);
        }

        Renderer.DrawText("black", DEBUG_FONT, 10, this.textHeight, `${this.Fps} fps`);

        Renderer.DrawText("black", DEBUG_FONT, 10, this.textHeight * 2, "Stage: " + (this._game.State?.Name || "None"));

        Renderer.DrawText("black", DEBUG_FONT, 10, this.textHeight * 3, "Keys: " + InputManager.S.Keys().join(', '));

        const mouse = InputManager.S.MousePos();
        Renderer.DrawText("black", DEBUG_FONT, 10, this.textHeight * 4, `Mouse: ${mouse[0]},${mouse[1]} (${(mouse[0] / 25).toFixed(2)},${(mouse[1] / 25).toFixed(2)}) ` + InputManager.S.MouseButtons().join(', '));

        for (let i = 0; i < this.Extras.length; i++) {
            const extra = this.Extras[i];
            Renderer.DrawText("black", DEBUG_FONT, 10, this.textHeight * (5 + i), extra());
        }

        // if (player !== undefined)
        //     Renderer.DrawText("black", DEBUG_FONT, 10, this.textHeight * 5, `Player: ${(player.Pos[0] / 25).toFixed(2)},${(player.Pos[1] / 25).toFixed(2)}`);
    }
    
    Update(elapsedTime: number): void {
        this.elapsedTime += elapsedTime;

        if (this.elapsedTime >= 1) {
            this.Fps = Math.round((this.totalFrames / this.elapsedTime) * 100) / 100;
            this.totalFrames = 0;
            this.elapsedTime = 0;
        }

        if (InputManager.S.KeyWentDown('F3')) {
            this.Enabled = false;
        }
    }

    public override DisabledUpdate(elapsedTime: number): void {
        if (InputManager.S.KeyWentDown('F3')) {
            this.Enabled = true;
        }
    }
}