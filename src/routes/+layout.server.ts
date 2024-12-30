import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals: { safeGetSession } }) => {
    return {
        session: await safeGetSession(),
    };
};