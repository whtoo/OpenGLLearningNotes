namespace TSE {
    export class TextureManager {
        private static _texture: {[name:string]:TextureReferenceNode} = {}

        private constructor() {

        }
        
        public static getTexture(textureName:string): Texture {
            if(TextureManager._texture[textureName] === undefined){
                let texture = new Texture(textureName)
                TextureManager._texture[textureName] = new TextureReferenceNode(texture)
            } else {
                TextureManager._texture[textureName].referenceCount++
            }
            return TextureManager._texture[textureName].texture
        }

        public static releaseTexture(textureName:string) : void {
            if(TextureManager._texture[textureName] === undefined) {
                console.warn(`A texture named ${textureName} dosent exist before you delete it.`)
            } else {
                let textureRef = TextureManager._texture[textureName] as TextureReferenceNode
                textureRef.referenceCount--
                if(textureRef.referenceCount < 1) {
                    textureRef.texture.destroy()
                    TextureManager._texture[textureName] = undefined
                    delete TextureManager._texture[textureName]
                }
            }

        }
    }
}