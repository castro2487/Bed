declare function subscribe(type: string, callback: (payload?: any, context?: SandboxContext) => void, source?: any): () => void;

interface SandboxContext {
    transfer?: Transferable[];
    source?: any;
}

declare function emit(message: SandboxMessage, callback?: (payload: any) => void): void;

interface SandboxMessage {
    type: string;
    payload?: any;
    source?: any;
    transfer?: Transferable | Transferable[];
}
