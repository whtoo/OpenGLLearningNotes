namespace TSE {
    const LEVEL : number = 0
    const BORDER : number = 0
    const TEMP_IMAGE_DATA: Uint8Array = new Uint8Array([255,255,255,255])

    export class Texture implements IMessageHandler {
        onMessage(message: Message): void {
            throw new Error("Method not implemented.")
        }
        
        
    }
}