import { Peer, PeerState } from "../entities/Peer.js";
import { IGame } from "../Interfaces.js";
import { AssetManager } from "../modules/AssetManager.js";
import { DebugModule } from "../modules/DebugModule.js";
import { InputManager } from "../modules/InputManager.js";
import { Renderer } from "../Renderer.js";
import { Point, PointMath } from "../Types.js";
import { GameState } from "./Base.js";

const SPEED = 1 / 5;

export enum ConnectionState {
    'NONE',
    'CONNECTING',
    'ESTABLISHED',
    'FAILED'
};

export class RunningState extends GameState {
    public Name = "In-Game";
    private readonly _game: IGame;
    connections = new Map<Peer, Map<Peer, [ConnectionState, number]>>();
    peer2: Peer;

    constructor(game: IGame) { 
        super();

        this._game = game;
        console.debug("Adding bootstrap peer...");
        const bootstrap = new Peer('Bootstrap Node', [Renderer.Width / 2, Renderer.Height / 2], 20, PeerState.ESTABLISHED);
        this.AddEntity(bootstrap);

        let peer = new Peer('Peer #1', [Renderer.Width / 2 + 200, Renderer.Height / 2], 10, PeerState.BOOTSTRAP);
        const connections =  new Map<Peer, [ConnectionState, number]>();
        this.connections.set(peer, connections);
        connections.set(bootstrap, [ConnectionState.CONNECTING, 0]);
        this.AddEntity(peer);

        let peer2 = new Peer('Peer #2', [Renderer.Width / 2, Renderer.Height / 2 - 200], 10, PeerState.ESTABLISHED);
        const connections2 =  new Map<Peer, [ConnectionState, number]>();
        this.connections.set(peer2, connections2);
        connections2.set(bootstrap, [ConnectionState.ESTABLISHED, 1]);
        this.AddEntity(peer2);
        this.peer2 = peer2;

        // this.connections.set(bootstrap, [[peer, ConnectionState.CONNECTING]]);

        this.UpdateDrawables();
        this.UpdateUpdateables();

        // DebugModule.S?.Extras.push(() => `Temp: ${this.Temperature.toFixed(2)}`);
    }

    private PosToPlant(pos: Point): Point | undefined {
        if (pos[0] < 137 || pos[0] > 675 || pos[1] < 275 || pos[1] > 590) return undefined;
        return [Math.floor((pos[0] - 137) / 75), Math.floor((pos[1] - 275) / 45)];
    }

    public override Update(elapsedTime: number): void {
        super.Update(elapsedTime);

        for (const [src, conns] of this.connections.entries()) {
            for (const [dest, [s, completion]] of conns.entries()) {
                if (s != ConnectionState.CONNECTING)
                    continue;

                if (completion == 1) {
                    if (dest != this.peer2) {
                        conns.set(dest, [ConnectionState.ESTABLISHED, 1]);
                        src.state = PeerState.PEERING;
                        conns.set(this.peer2, [ConnectionState.CONNECTING, 0]);
                    } else {
                        conns.set(this.peer2, [ConnectionState.FAILED, 0]);
                    }
                    continue;
                }

                conns.set(dest, [s, Math.min(1, completion + (elapsedTime * SPEED))]);
            }
        }
    }

    public override Draw(elapsedTime: number): void {
        Renderer.Clear('cornflowerblue')

        // Renderer.DrawText('black', INGAME_SCORE_FONT, 10, 50, `Text!`);
        this.DrawConnections();
        super.Draw(elapsedTime);
    }

    private DrawConnections() {
        for (const [src, conns] of this.connections.entries()) {
            for (const [dest, [s, completion]] of conns.entries()) {
                let conn_color: string;
                switch (s) {
                    case ConnectionState.NONE:
                        conn_color = '#333';
                        Renderer.Ctx.setLineDash([3, 3]);
                        break;
                    case ConnectionState.CONNECTING:
                        conn_color = 'orange';
                        Renderer.Ctx.setLineDash([6, 6]);
                        break;
                    case ConnectionState.ESTABLISHED:
                        conn_color = 'green';
                        Renderer.Ctx.setLineDash([]);
                        break;
                    case ConnectionState.FAILED:
                        conn_color = 'red';
                        break;
                    default:
                        conn_color = 'magenta';
                        break;
                }
                const vec = PointMath.sub(dest.Pos, src.Pos);
                const norm_vec = PointMath.Normalize(vec);
                const clockwise: Point = PointMath.mul([-norm_vec[1], norm_vec[0]], 1);
                // console.debug(vec, clockwise);
                Renderer.DrawLine(conn_color, ...PointMath.add(src.Pos, clockwise), ...PointMath.add(dest.Pos, clockwise), src.Hovered ? 3 : 1);
                if (completion != 0 && completion != 1) {
                    const comp_point = PointMath.add(src.Pos, PointMath.mul(vec, completion));
                    Renderer.FillCircle(conn_color, ...PointMath.add(comp_point, clockwise), src.Hovered ? 5 : 3);
                }
            }
        }
        Renderer.Ctx.setLineDash([]);
    }
}