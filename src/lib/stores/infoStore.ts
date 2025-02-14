import { writable } from 'svelte/store';



export const infoStore = writable<string | null>(null);

export function setInfo(message: string) {
    infoStore.set(message);
}

export function clearinfo() {
    infoStore.set(null);
}