export class Renderer {
    private static _canvas: HTMLCanvasElement;
    public static get Canvas(): HTMLCanvasElement {
        if (this._canvas === undefined) {
            const canvas = document.getElementById("canvas");

            if (canvas === null || !(canvas instanceof HTMLCanvasElement))
                throw "Could not find a canvas with id='canvas'.";
    
            this._canvas = canvas;
        }
        return this._canvas;
    }

    public static _ctx: CanvasRenderingContext2D;
    public static get Ctx(): CanvasRenderingContext2D {
        if (this._ctx === undefined) {
            const ctx = this.Canvas.getContext("2d");
            if (ctx === null)
                throw "Could not get canvas context.";
            this._ctx = ctx;
        }
        return this._ctx;
    }

    public static get Width(): number { return this.Canvas.width; }

    public static get Height(): number { return this.Canvas.height; }

    private constructor() {}

    private static _singleton: Renderer;
    public static get S(): Renderer {
        return this._singleton || (this._singleton = new this());
    }

    static MeasureText(font: string, text: string): TextMetrics {
        this.Ctx.font = font;
        return this.Ctx.measureText(text);
    }

    static DrawText(color: string, font: string, x: number, y: number, text: string, maxWidth?: number) { 
        this.Ctx.fillStyle = color;
        this.Ctx.font = font;
        this.Ctx.fillText(text, x, y, maxWidth);
    }

    static Clear(color: string = "magenta") {
        this.Ctx.fillStyle = color;
        this.Ctx.fillRect(0, 0, this.Width, this.Height);
    }

    static DrawImage(image: HTMLImageElement, x: number, y: number, w?: number, h?: number, opacity = 1) {
        const restore = this.Ctx.globalAlpha;
        this.Ctx.globalAlpha = opacity;
        if (w !== undefined && h !== undefined)
            this.Ctx.drawImage(image, x, y, w, h);
        else
            this.Ctx.drawImage(image, x, y);
        this.Ctx.globalAlpha = restore;
    }

    static FillRect(color: string | CanvasGradient | CanvasPattern, x: number, y: number, w: number, h: number, opacity = 1) {
        const restore = this.Ctx.globalAlpha;
        this.Ctx.globalAlpha = opacity;
        this.Ctx.fillStyle = color;
        this.Ctx.fillRect(x, y, w, h);
        this.Ctx.globalAlpha = restore;
    }

    static DrawRect(stroke: string, x: number, y: number, w: number, h: number, opacity = 1) {
        const restore = this.Ctx.globalAlpha;
        this.Ctx.globalAlpha = opacity;
        this.Ctx.strokeStyle = stroke;
        this.Ctx.strokeRect(x, y, w, h);
        this.Ctx.globalAlpha = restore;
    }

    static DrawLine(stroke: string, sx: number, sy: number, ex: number, ey: number) {
        this.Ctx.strokeStyle = stroke;
        this.Ctx.beginPath();
        this.Ctx.moveTo(sx, sy);
        this.Ctx.lineTo(ex, ey);
        this.Ctx.stroke();
    }

    static FillEllipse(color: string, x: number, y: number, rx: number, ry: number) {
        this.Ctx.fillStyle = color;
        this.Ctx.beginPath();
        this.Ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
        this.Ctx.fill();
    }

    static DrawEllipse(stroke: string, x: number, y: number, rx: number, ry: number) {
        this.Ctx.strokeStyle = stroke;
        this.Ctx.beginPath();
        this.Ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
        this.Ctx.stroke();
    }

    static FillCircle(color: string, x: number, y: number, radius: number) {
        this.Ctx.fillStyle = color;
        this.Ctx.beginPath();
        this.Ctx.arc(x, y, radius, 0, 2* Math.PI);
        this.Ctx.fill();
    }
}
