import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    update: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const password = formData.get('password') as string;

        const { error } = await supabase.auth.updateUser({
            password
        });

        if (error) {
            return fail(400, { error: error.message });
        }

        throw redirect(303, '/my/lab');
    }
};