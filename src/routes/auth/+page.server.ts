import { redirect } from '@sveltejs/kit'

import type { Actions, RequestEvent } from './$types'
import { setError } from '$lib/stores/errorStore';

export const actions: Actions = {
    signup: async ({ request, locals: { supabase }, url }: RequestEvent) => {
        console.log('tick')
        const origin = url.origin;
        const formData = await request.formData()
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await supabase.auth.signUp({
            email, password, options: {
                emailRedirectTo: `${origin}/auth/confirm`
            }
        })
        if (error) {
            console.error(error)
            redirect(303, '/auth/error')
        } else {
            redirect(303, '/my/lab')
        }
    },
    login: async ({ request, locals: { supabase } }: RequestEvent) => {
        console.log('tock')
        const formData = await request.formData()
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            console.log("returned error")
            return {
                success: false,
                error: error.message
            }
        } else {

            return {
                success: true
            }
        }
        throw redirect(303, '/my/lab')
    },
}