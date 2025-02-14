import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    reset: async ({ request, locals: { supabase }, url }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const origin = url.origin;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/update-password`
        });

        if (error) {
            return fail(400, { error: error.message });
        }

        return { success: true };
    }
};