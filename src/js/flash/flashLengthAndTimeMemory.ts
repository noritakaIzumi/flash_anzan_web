import { type FlashMode } from "../globals.js"

export interface Memory { length?: number, time?: number }

export class FlashLengthAndTimeMemory {
    private memory: Memory = {}

    public save(args: { length: number, time: number }): void {
        this.memory.length = args.length
        this.memory.time = args.time
    }

    public expandTime(length: number): number {
        if (this.memory.time === undefined || this.memory.length === undefined) {
            throw new Error("length and time not remembered")
        }
        return this.memory.time * (length * 2 - 1) / (this.memory.length * 2 - 1)
    }

    public delete(): void {
        this.memory = {}
    }
}

export const flashLengthAndTimeMemories: { [key in FlashMode]: FlashLengthAndTimeMemory } = {
    addition: new FlashLengthAndTimeMemory(),
    multiplication: new FlashLengthAndTimeMemory(),
}
