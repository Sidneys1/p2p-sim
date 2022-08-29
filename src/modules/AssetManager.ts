import { ASSETS, AssetType, REQUIRED_ASSETS } from "../Constants.js";

export class AssetManager {
    private constructor(){}
    
    private static assetsLoaded = 0;
    private static imageAssets = new Map<string, HTMLImageElement>();

    public static GetImage(id: string) {
        const ret = this.imageAssets.get(id);
        if (ret === undefined)
            throw `Missing asset "${id}".`;
        return ret;
    }

    public static Progress(): number {
        return this.assetsLoaded / ASSETS.length;
    }

    public static async LoadRequiredAssets() {
        const start = Date.now();
        for (const asset of REQUIRED_ASSETS)
            await this.LoadAsset(asset, false);
        const diff = Date.now() - start;
        console.debug(`Loaded required assets in ${diff}ms`);
    }

    public static async LoadAllAssets() {
        const start = Date.now();
        for (const asset of ASSETS)
            await this.LoadAsset(asset);
        const diff = Date.now() - start;
        console.debug(`Loaded all other assets in ${diff}ms`);
    }

    private static LoadAsset(asset: [AssetType, string], increment = true): Promise<void> {
        const assetPath = `./assets/${asset[1]}`;
        return new Promise((resolve, reject) => {
            switch (asset[0]) {
                case AssetType.Image:
                    const img = new Image();
                    img.addEventListener('load', e => {
                        if (increment) this.assetsLoaded++;
                        this.imageAssets.set(asset[1], img);
                        console.debug(`Loaded asset "${asset[1]}".`)
                        resolve();
                    });
                    img.addEventListener('error', e => reject(e));
                    img.src = assetPath;
                    break;
            
                default:
                    break;
            }
        });
    }
}