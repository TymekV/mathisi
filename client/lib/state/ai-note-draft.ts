import { useSyncExternalStore } from 'react';

export type AiNoteAttachment = {
    id: number;
    filename: string;
    uri?: string;
    ocr?: string;
};

let attachments: AiNoteAttachment[] = [];
const subscribers = new Set<() => void>();

const emit = () => {
    subscribers.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
};

const getSnapshot = () => attachments;

export function useAiNoteAttachments() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addAttachments(newAttachments: AiNoteAttachment[]) {
    if (!newAttachments.length) {
        return;
    }

    attachments = [...attachments, ...newAttachments];
    emit();
}

export function removeAttachment(id: number) {
    attachments = attachments.filter((attachment) => attachment.id !== id);
    emit();
}

export function clearAttachments() {
    if (!attachments.length) {
        return;
    }

    attachments = [];
    emit();
}
