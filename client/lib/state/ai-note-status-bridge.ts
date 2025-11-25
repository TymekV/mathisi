type StatusHandlers = {
    setStatus: (message: string) => void;
    setUploading: (uploading: boolean) => void;
};

let handlers: StatusHandlers | null = null;
let lastStatus = '';
let lastUploading = false;

export function registerAiNoteStatusHandlers(nextHandlers: StatusHandlers) {
    handlers = nextHandlers;
    handlers.setStatus(lastStatus);
    handlers.setUploading(lastUploading);
    return () => {
        if (handlers === nextHandlers) {
            handlers = null;
        }
    };
}

export function emitAiNoteStatus(message: string) {
    lastStatus = message;
    handlers?.setStatus(message);
}

export function emitAiNoteUploading(uploading: boolean) {
    lastUploading = uploading;
    handlers?.setUploading(uploading);
}
