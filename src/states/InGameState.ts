import { IGame } from "../Interfaces.js";
import { Renderer } from "../Renderer.js";
import { GameState } from "./Base.js";

export class InGameState extends GameState {
    public Name = "In-Game";
    private readonly _game: IGame;

    constructor(game: IGame) { 
        super();

        this._game = game;
    }

    public override Update(elapsedTime: number): void {
        super.Update(elapsedTime);
    }

    public override Draw(elapsedTime: number): void {
        Renderer.Clear('CornflowerBlue');
        super.Draw(elapsedTime);
    }
}