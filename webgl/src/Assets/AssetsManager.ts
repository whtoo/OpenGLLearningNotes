namespace TSE {
    export const MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";
    

    export class AssetManager {
        private static _loaders: IAssetLoader[] = []
        private static _loadedAssets: {[name:string] : IAsset} = {}

        private constructor(){

        }

        public static initialize():void {
            AssetManager._loaders.push(new ImageAssetLoader());
        }

        public static registLoader(loader:IAssetLoader):void {
            AssetManager._loaders.push(loader)
        }

        public static onAssetLoaded(asset:IAsset):void {
            AssetManager._loadedAssets[asset.name] = asset
            Message.send(MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset);
        }

        public static loadAsset(assetName: string) : void {
            let extension = assetName.split('.').pop().toLowerCase()
            for (const loader of AssetManager._loaders) {
                if(loader.supportedExtensions.indexOf(extension) !== -1) {
                    loader.loadAsset(assetName)
                    return
                }
            }
            console.warn("Unable to load asset with extension" + extension + "because there is no loader associated with it")

        }
        public static isAssetLoaded(assetName:string):boolean {
            return AssetManager._loadedAssets[assetName] !== undefined
        }

        public static getAsset(assetName:string):IAsset {
            if(AssetManager.isAssetLoaded){
                return AssetManager._loadedAssets[assetName]
            } else {
                AssetManager.loadAsset(assetName)
            }
            return undefined
        }
    }
}