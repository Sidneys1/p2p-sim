import { DebugModule } from "./modules/DebugModule.js";
import { InputManager } from "./modules/InputManager.js";
import { IGame } from "./Interfaces.js";
import { GameState } from "./states/Base.js";
import { Renderer } from "./Renderer.js";
import { AssetManager } from "./modules/AssetManager.js";
import { LoadingState } from "./states/LoadingState.js";
import { GameCommon } from "./GameCommon.js";

export class P2pSimGame extends GameCommon implements IGame {
    State?: GameState;

    constructor() {
        super();

        this.AddModule(InputManager.S);
        this.AddModule(new DebugModule(this));

        AssetManager.LoadRequiredAssets().then(() => {
            this.SetState(new LoadingState(this));
            this.GameLoop();
        }).catch(console.error);
    }

    // This keeps the game running.
    private GameLoop() {
        var lastFrame = window.performance.now(); //Date.now();
        const innerGameLoop = () => {
            const currentFrame = window.performance.now(); //Date.now();
            const elapsedTime = (currentFrame - lastFrame) / 1000; // convert ms to s
            lastFrame = currentFrame;
            
            this.Update(elapsedTime);
            
            this.Draw(elapsedTime);

            // Request next animation...
            requestAnimationFrame(innerGameLoop);
        };
        requestAnimationFrame(innerGameLoop);
    }

    public SetState(state?: GameState) {
        const oldState = this.State;
        this.State = state;
        const update = false;
        if (oldState !== undefined)
            this.Drawables.splice(this.Drawables.findIndex(s => s === oldState), 1);
        
        if (state !== undefined)
            this.Drawables.push(state);
        
        this.UpdateUpdateables();
        this.UpdateDrawables();

        console.debug(`State change from ${oldState?.Name} to ${state?.Name}`);
    }

    // This pumps updates through various modules and the current game stage
    private Update(elapsedTime: number) {
        // In the case of updating, we update modules before the stage (so the module data is fresh as necessary).
        for (const updatable of this.Updatables)
            updatable.Enabled ? updatable.Update(elapsedTime) : updatable.DisabledUpdate(elapsedTime);
        
        if (this.State !== undefined)
            this.State.Update(elapsedTime);
    }

    private Draw(elapsedTime: number) {
        for (const drawable of this.Drawables) {
            if (drawable.Enabled)
                drawable.Draw(elapsedTime);
        }
    }
}
