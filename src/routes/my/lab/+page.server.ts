import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser()
    return { user };
}