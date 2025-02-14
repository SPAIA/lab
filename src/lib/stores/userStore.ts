import type { User } from '@supabase/supabase-js';
import { writable } from 'svelte/store';



export const userStore = writable<User | null>(null);

export function setUser(user: User | null) {
    userStore.set(user);
}

export function clearUser() {
    userStore.set(null);
}