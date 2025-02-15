import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
    create: async ({ request, locals: { supabase }, url }: RequestEvent) => {
        console.log('creatingDEvice')
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
            return ({ error: "Please check your inbox to confirm your email address" })
        } else {
            return ({ info: "Please check your inbox to confirm your email address" })
        }
    },

}