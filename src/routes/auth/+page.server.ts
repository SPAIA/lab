import { redirect } from '@sveltejs/kit'

import type { Actions, RequestEvent } from './$types'

export const actions: Actions = {
    signup: async ({ request, locals: { supabase }, url }: RequestEvent) => {
        const origin = url.origin;
        const formData = await request.formData()
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        console.log("oooooo", origin)
        const { error } = await supabase.auth.signUp({
            email, password, options: {
                emailRedirectTo: `${origin}/auth/confirm`,
                data: {
                    email_confirm: true
                }
            }
        })
        if (error) {
            console.error(error)
            redirect(303, '/auth/error')
        } else {
            redirect(303, '/')
        }
    },
    login: async ({ request, locals: { supabase } }: RequestEvent) => {
        const formData = await request.formData()
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            console.error(error)
            redirect(303, '/auth/error')
        } else {
            redirect(303, '/private')
        }
    },
}