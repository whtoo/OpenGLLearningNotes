namespace TSE {
    export class TextureReferenceNode {
        public texture: Texture
        public referenceCount : number = 1

        public constructor(texture: Texture) {
            this.texture = texture
        }
    }
}